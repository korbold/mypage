import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://korbold.vercel.app',
  output: 'static',
  integrations: [sitemap()],
});
