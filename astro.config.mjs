import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static build. The Worker in /worker serves /api/* and hands everything else
// to these static assets (see wrangler.jsonc).
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://invest.hihoinvestments.co.uk',
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
  image: { responsiveStyles: false },
  vite: { plugins: [tailwindcss()] },
});
