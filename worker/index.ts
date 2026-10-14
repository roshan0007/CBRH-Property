// Hi-Ho landing page Worker.
// Only /api/* reaches this code (assets.run_worker_first). Everything else is
// served straight from the static Astro build.

export interface Env {
  ASSETS: Fetcher;
  ENQUIRY_LIMITER?: RateLimit;
  EMAIL?: SendEmail;
  TURNSTILE_SECRET_KEY?: string;
  LEAD_WEBHOOK_URL?: string;
  LEAD_NOTIFY_EMAIL?: string;
  LEAD_FROM_EMAIL?: string;
}

const ENUMS = {
  budget: ['50-100k', '100-250k', '250k-plus', 'no-funds'],
  timeline: ['immediately', '30-days', '1-3-months', 'researching'],
  service: ['sourcing', 'sourcing-renovation', 'full-service', 'not-sure'],
} as const;

const LABELS: Record<string, string> = {
  '50-100k': '£50,000–£100,000',
  '100-250k': '£100,000–£250,000',
  '250k-plus': 'Over £250,000',
  'no-funds': "Doesn't yet have the funds",
  immediately: 'Immediately',
  '30-days': 'Within 30 days',
  '1-3-months': 'Within 1–3 months',
  researching: 'Just researching',
  sourcing: 'Property sourcing',
  'sourcing-renovation': 'Sourcing + renovation management',
  'full-service': 'Full service incl. social housing handover',
  'not-sure': 'Not sure yet',
};

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'landing_url', 'referrer', 'first_seen'];

export type Lead = {
  id: string;
  eventId: string;
  receivedAt: string;
  score: 'hot' | 'warm' | 'cold';
  budget: string;
  timeline: string;
  service: string;
  name: string;
  email: string;
  phone: string;
  attribution: Record<string, string>;
  meta: { ip: string; country: string; userAgent: string };
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/enquiry') {
      if (request.method !== 'POST') return json({ ok: false, message: 'Method not allowed.' }, 405);
      return handleEnquiry(request, env, ctx);
    }
    if (url.pathname.startsWith('/api/')) return json({ ok: false, message: 'Not found.' }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleEnquiry(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';

  if (env.ENQUIRY_LIMITER) {
    const { success } = await env.ENQUIRY_LIMITER.limit({ key: ip });
    if (!success) return json({ ok: false, message: 'Too many attempts. Please wait a minute and try again.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: 'We couldn’t read that submission. Please try again.' }, 400);
  }

  // Honeypot: pretend it worked so bots learn nothing.
  if (typeof body.company === 'string' && body.company.trim() !== '') return json({ ok: true });

  const str = (k: string, max = 200) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, max) : '');
  const errors: Record<string, string> = {};

  const budget = str('budget');
  const timeline = str('timeline');
  const service = str('service');
  if (!(ENUMS.budget as readonly string[]).includes(budget)) errors.budget = 'Please choose your investment budget.';
  if (!(ENUMS.timeline as readonly string[]).includes(timeline)) errors.timeline = 'Please tell us when you’re ready to invest.';
  if (!(ENUMS.service as readonly string[]).includes(service)) errors.service = 'Please choose the service that interests you.';

  const name = str('name', 120);
  if (name.length < 2) errors.name = 'Please enter your full name.';
  const email = str('email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  const phone = normaliseUkPhone(str('phone', 30));
  if (!phone) errors.phone = 'Please enter a UK phone number, e.g. 07123 456789.';

  if (Object.keys(errors).length) {
    return json({ ok: false, message: 'Please check the highlighted fields.', errors }, 422);
  }

  const human = await verifyTurnstile(str('turnstileToken', 4096), ip, env);
  if (!human) {
    return json({ ok: false, message: 'We couldn’t verify your browser. Please refresh the page and try again.' }, 403);
  }

  const rawAttr = (body.attribution && typeof body.attribution === 'object' ? body.attribution : {}) as Record<string, unknown>;
  const attribution: Record<string, string> = {};
  for (const k of ATTR_KEYS) if (typeof rawAttr[k] === 'string') attribution[k] = (rawAttr[k] as string).slice(0, 500);

  const lead: Lead = {
    id: crypto.randomUUID(),
    eventId: /^[\w-]{8,64}$/.test(str('eventId', 64)) ? str('eventId', 64) : crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    score: scoreLead(budget, timeline),
    budget,
    timeline,
    service,
    name,
    email,
    phone: phone!, // validated above
    attribution,
    meta: {
      ip,
      country: (request as Request & { cf?: { country?: string } }).cf?.country || '',
      userAgent: (request.headers.get('user-agent') || '').slice(0, 300),
    },
  };

  // Deliver after responding, so a slow webhook never slows the visitor down.
  ctx.waitUntil(deliver(lead, env));

  return json({ ok: true, id: lead.id });
}

export function normaliseUkPhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, '');
  if (d.startsWith('+44')) d = '0' + d.slice(3);
  else if (d.startsWith('0044')) d = '0' + d.slice(4);
  if (!/^0\d{9,10}$/.test(d)) return null;
  return '+44' + d.slice(1); // E.164
}

// hot = funds ready and moving soon; cold = no funds or just looking.
export function scoreLead(budget: string, timeline: string): Lead['score'] {
  if (budget === 'no-funds' || timeline === 'researching') return 'cold';
  if (timeline === 'immediately' || timeline === '30-days') return budget === '50-100k' && timeline === '30-days' ? 'warm' : 'hot';
  return 'warm';
}

async function verifyTurnstile(token: string, ip: string, env: Env): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.warn('TURNSTILE_SECRET_KEY not set; skipping bot check');
    return true;
  }
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (ip !== 'unknown') form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!data.success) console.warn('Turnstile failed', data['error-codes']);
    return data.success;
  } catch (err) {
    console.error('Turnstile verify error', err);
    return false;
  }
}

// ---- Delivery adapters --------------------------------------------------
// Each adapter is independent; one failing never blocks the others.
// To add Zoho CRM later: write zohoCrmAdapter(lead, env) and add it below.

type Adapter = (lead: Lead, env: Env) => Promise<void>;

const webhookAdapter: Adapter = async (lead, env) => {
  if (!env.LEAD_WEBHOOK_URL) return;
  const res = await fetch(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source: 'hiho-landing', ...lead }),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
};

const emailAdapter: Adapter = async (lead, env) => {
  if (!env.EMAIL || !env.LEAD_NOTIFY_EMAIL || !env.LEAD_FROM_EMAIL) return;
  const rows: [string, string][] = [
    ['Score', lead.score.toUpperCase()],
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Budget', LABELS[lead.budget]],
    ['Timeline', LABELS[lead.timeline]],
    ['Service', LABELS[lead.service]],
    ...Object.entries(lead.attribution),
    ['Received', lead.receivedAt],
  ];
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  await env.EMAIL.send({
    to: env.LEAD_NOTIFY_EMAIL,
    from: { email: env.LEAD_FROM_EMAIL, name: 'Hi-Ho Landing Page' },
    replyTo: lead.email,
    subject: `[${lead.score.toUpperCase()}] New investor enquiry: ${lead.name}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<table cellpadding="6">${rows.map(([k, v]) => `<tr><th align="left">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`,
  } as never);
};

// TODO(CAPI): send a server-side Meta "Lead" event using lead.eventId as event_id,
// so it dedupes against the browser Pixel event. Needs META_CAPI_TOKEN + pixel ID.
const metaCapiAdapter: Adapter = async () => {};

const adapters: [string, Adapter][] = [
  ['webhook', webhookAdapter],
  ['email', emailAdapter],
  ['meta-capi', metaCapiAdapter],
];

async function deliver(lead: Lead, env: Env) {
  const results = await Promise.allSettled(adapters.map(([, a]) => a(lead, env)));
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`Lead ${lead.id}: ${adapters[i][0]} delivery failed`, r.reason);
  });
  // Always log a minimal record so no lead is ever lost, even with no destination configured.
  console.log('lead', JSON.stringify({ id: lead.id, score: lead.score, receivedAt: lead.receivedAt, email: lead.email }));
}
