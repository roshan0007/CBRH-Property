// Generates public/og.png (1200x630) in the brand style from the hero photo.
// Run: node scripts/make-og.mjs   (re-run after swapping the hero photo)
import sharp from 'sharp';

const W = 1200;
const H = 630;
const INK = '#0b3029';
const CREAM = '#f7f2e8';
const CORAL = '#ee765f';
const CORAL_LIGHT = '#f4aa98';

const photo = await sharp('src/assets/photos/terrace-sunset.jpg')
  .resize(620, H, { fit: 'cover', position: 'centre' })
  .toBuffer();

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0" stop-color="${INK}" stop-opacity="1"/>
      <stop offset="0.25" stop-color="${INK}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${INK}" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect x="580" y="0" width="620" height="${H}" fill="url(#fade)"/>
  <g transform="translate(72 64) scale(0.9)">
    <path d="M0 0h10v18h11V0h10v46H21V29H10v17H0z" fill="${CREAM}"/>
    <path d="M0 25c5 0 9-6 14-6s10 6 17 6" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
    <path fill="${CORAL}" fill-rule="evenodd" d="M30 0h8v15h10V0h8v46h-8V31H38v15h-8zm8 25 5-5 5 5v7H38z"/>
  </g>
  <text x="138" y="88" font-family="Georgia, serif" font-size="30" fill="${CREAM}">Hi-Ho</text>
  <text x="139" y="108" font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="${CORAL}">INVESTMENTS</text>
  <text x="70" y="352" font-family="Georgia, serif" font-size="66" fill="${CREAM}">UK Property Investment,</text>
  <text x="70" y="432" font-family="Georgia, serif" font-size="66" font-style="italic" fill="${CORAL_LIGHT}">Made Hands-Off.</text>
  <text x="72" y="540" font-family="Arial, sans-serif" font-size="22" fill="#c4cec9">Sourcing · Renovation · Social housing handover</text>
</svg>`);

await sharp({ create: { width: W, height: H, channels: 3, background: INK } })
  .composite([
    { input: photo, left: W - 620, top: 0 },
    { input: overlay, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile('public/og.png');

console.log('public/og.png written');
