// Consent-gated Meta Pixel + first-touch attribution.
// Nothing loads unless PUBLIC_META_PIXEL_ID is set AND the visitor accepts.

const PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID as string | undefined;
const CONSENT_KEY = 'hiho-consent'; // 'granted' | 'denied'
const ATTR_KEY = 'hiho-attr';

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown; callMethod?: (...a: unknown[]) => void };

function store(kind: 'local' | 'session') {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export const pixelEnabled = () => !!PIXEL_ID;
export const getConsent = () => store('local')?.getItem(CONSENT_KEY) ?? null;

export function setConsent(v: 'granted' | 'denied') {
  store('local')?.setItem(CONSENT_KEY, v);
  if (v === 'granted') loadPixel();
}

let loaded = false;
export function loadPixel() {
  if (loaded || !PIXEL_ID || getConsent() !== 'granted') return;
  loaded = true;
  const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };
  if (!w.fbq) {
    const n = function (...args: unknown[]) {
      n.callMethod ? n.callMethod(...args) : n.queue!.push(args);
    } as Fbq;
    n.queue = [];
    n.loaded = true;
    n.version = '2.0';
    n.push = n;
    w.fbq = w._fbq = n;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
  }
  w.fbq!('init', PIXEL_ID);
  w.fbq!('track', 'PageView', {}, { eventID: crypto.randomUUID() });
}

// eventId is shared with the Worker so server-side CAPI can dedupe later.
export function track(event: string, eventId: string) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (loaded && fbq) fbq('track', event, {}, { eventID: eventId });
}

const ATTR_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

// First touch wins for the session, so in-page navigation can't wipe the ad click.
export function captureAttribution() {
  const s = store('session');
  if (!s || s.getItem(ATTR_KEY)) return;
  const q = new URLSearchParams(location.search);
  const data: Record<string, string> = { landing_url: location.href, referrer: document.referrer, first_seen: new Date().toISOString() };
  ATTR_PARAMS.forEach((p) => {
    const v = q.get(p);
    if (v) data[p] = v.slice(0, 300);
  });
  s.setItem(ATTR_KEY, JSON.stringify(data));
}

export function getAttribution(): Record<string, string> {
  try {
    return JSON.parse(store('session')?.getItem(ATTR_KEY) || '{}');
  } catch {
    return {};
  }
}
