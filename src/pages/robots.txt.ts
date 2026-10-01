import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../lib/site-identity';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(SITE_ORIGIN);
  const staging = import.meta.env.PUBLIC_ROBOTS_NOINDEX === 'true';
  return new Response(
    staging
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
