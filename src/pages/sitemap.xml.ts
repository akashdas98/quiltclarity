import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../lib/site-identity';
import { INDEXABLE_PATHS } from '../lib/analytics/canonical-paths';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(SITE_ORIGIN);
  const entries = INDEXABLE_PATHS.map(
    (path) => `  <url><loc>${new URL(path, origin).href}</loc></url>`,
  ).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
