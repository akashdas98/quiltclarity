import { defineConfig } from 'astro/config';
import process from 'node:process';
import { SITE_ORIGIN } from './src/lib/site-identity.ts';

export default defineConfig({
  output: 'static',
  // Preview deployments can override the purchased canonical origin and use
  // PUBLIC_ROBOTS_NOINDEX to keep preview pages out of search.
  site: process.env.SITE_URL ?? SITE_ORIGIN,
});
