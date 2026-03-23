import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mypage-dannys-projects-0b2c619a.vercel.app',
  output: 'static',
  integrations: [sitemap()],
});
