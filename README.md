# Hi-Ho Investments: landing page

One-page Meta Ads landing page for **Hi-Ho Investments** (CBRH Property Ltd). Its single job is qualified investor enquiries.

- **Stack:** Astro 5 (static) + Tailwind CSS v4 + TypeScript, served by a Cloudflare Worker with Static Assets
- **Worker:** `worker/index.ts` handles `POST /api/enquiry`. Everything else is static (`assets.run_worker_first: ["/api/*"]`).
- **Project brief and context:** `Z:\Tech Management\projects\hiho-landing\` (BRIEF.md, CONTEXT.md)

## Setup

```bash
npm install
cp .env.example .env              # build-time public values
cp .dev.vars.example .dev.vars    # Worker secrets for local runs
```

| Command | What it does |
|---|---|
| `npm run dev` | Astro dev server at http://localhost:4321 (page only; `/api/enquiry` isn't served here) |
| `npm run preview` | Builds, then runs the real Worker + assets with `wrangler dev` at http://localhost:8787. Use this to test the form. |
| `npm run verify` | Token audit + type check + build. Run before every commit. |
| `npm run deploy` | Builds and deploys with `wrangler deploy` |
| `node scripts/make-og.mjs` | Regenerates `public/og.png` from the hero photo |

## Environment variables

**Build time** (`.env`, or Cloudflare build settings). Baked into the HTML.

| Name | Purpose |
|---|---|
| `PUBLIC_SITE_URL` | Canonical URL, used for OG tags and the sitemap |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key. Defaults to Cloudflare's always-pass test key. |
| `PUBLIC_META_PIXEL_ID` | Meta Pixel ID. **Empty = no pixel code and no cookie banner at all.** |
| `PUBLIC_ALLOW_INDEXING` | `true` only at launch. Anything else adds `noindex` and a `Disallow: /` robots.txt. |

**Worker runtime** (`wrangler.jsonc` vars or `wrangler secret put`):

| Name | Type | Purpose |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | secret | Server-side Turnstile check. If unset, the check is skipped and a warning is logged. |
| `LEAD_WEBHOOK_URL` | secret | Each lead is POSTed here as JSON (Zapier / Make / Zoho Flow catch hook). Optional. |
| `LEAD_NOTIFY_EMAIL` | var | Email notification recipient. Optional; needs the `send_email` binding. |
| `LEAD_FROM_EMAIL` | var | Sender address on an onboarded domain, e.g. `leads@hihoinvestments.co.uk` |

## How the form works

1. Visitor answers 3 radio-card questions plus name, email and UK phone. Validation runs client-side, then again on the server.
2. Turnstile (invisible) loads on first touch of the form, so it never slows the first paint.
3. The Worker applies a rate limit (5 per minute per IP), checks the honeypot, validates, verifies Turnstile and scores the lead:
   - **cold:** no funds yet, or just researching
   - **hot:** funds ready and investing immediately or within 30 days (except £50–100k within 30 days, which is warm)
   - **warm:** everything else
4. The lead (including UTM params, `fbclid`, landing URL and timestamps) goes to every configured adapter in `worker/index.ts`: webhook, email, and a Meta CAPI stub. Adding Zoho CRM later means adding one adapter function.
5. On success the form swaps for an inline thank-you and fires the Pixel `Lead` event (only with consent) using an `event_id` that the Worker also receives, so CAPI can dedupe later.

Every lead is also written to the Worker logs (id, score, email), so nothing is lost before a destination is configured.

## Deploy to Cloudflare

1. `npx wrangler login`
2. Set secrets:
   ```bash
   npx wrangler secret put TURNSTILE_SECRET_KEY
   npx wrangler secret put LEAD_WEBHOOK_URL
   ```
3. Create a real Turnstile widget (Cloudflare dashboard → Turnstile) for the final domain. Put the site key in `PUBLIC_TURNSTILE_SITE_KEY` and the secret in step 2.
4. Optional email notifications: run `npx wrangler email sending enable hihoinvestments.co.uk`, uncomment `send_email` in `wrangler.jsonc`, and set `LEAD_NOTIFY_EMAIL` / `LEAD_FROM_EMAIL`.
5. `npm run deploy`
6. Custom domain: Workers & Pages → `hiho-landing` → Settings → Domains & Routes → Add custom domain (e.g. `invest.hihoinvestments.co.uk`). The zone must be on Cloudflare.
7. At launch: set `PUBLIC_ALLOW_INDEXING=true` and `PUBLIC_META_PIXEL_ID`, then redeploy.

## Design system

- Tokens live in `src/styles/tokens.css`: **primitives** (`--p-*`, the only place raw hex/px/fonts may appear), then **semantic roles** in `@theme`. Tailwind's default palette, radii, shadows and type scale are wiped, so only our roles exist as utilities.
- `npm run audit:tokens` fails the build on any raw colour, px font-size, font stack, radius or shadow outside the primitives layer (Frontend Bible §10).
- Fonts are self-hosted via `@fontsource-variable` (Newsreader for display, Inter for body). There's no Google Fonts request.
- Copy, stats, fees, FAQs and risk text are all in `src/data/content.ts`. **Fees are unconfirmed.**

## Verified (2026-10-14, local)

- Lighthouse mobile (simulated slow 4G): Performance 95–96, Accessibility 100, Best Practices 100, SEO 100 except the intentional `noindex`. CLS 0. LCP 2.7s (target was < 2.0s; see open questions).
- No horizontal overflow at 375px; checked visually at 375 and 1440.
- Form tested end to end in a headless browser: validation errors, real tap submit, Turnstile test token, Worker 200, inline success.
- API tested: invalid input gives 422 with per-field errors, honeypot fakes success, GET gives 405.
