import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../lib/site-identity';

const paths = [
  '/',
  '/fabric-cutting-planner/',
  '/calculators/',
  '/calculators/fabric-yardage/',
  '/calculators/quilt-backing/',
  '/calculators/quilt-batting/',
  '/calculators/quilt-binding/',
  '/calculators/half-square-triangle/',
  '/calculators/quarter-square-triangle/',
  '/calculators/flying-geese/',
  '/calculators/quilt-block-count/',
  '/calculators/borders/',
  '/calculators/sashing/',
  '/calculators/pieces-from-fabric/',
  '/guides/',
  '/guides/getting-started/',
  '/guides/project-planner-tutorial/',
  '/guides/enter-a-cut-list/',
  '/guides/add-fabric-you-have/',
  '/guides/read-your-shopping-plan/',
  '/guides/read-your-cutting-plan/',
  '/guides/print-your-project-plan/',
  '/guides/turn-pattern-cut-list-into-plan/',
  '/guides/do-i-have-enough-fabric/',
  '/guides/use-remnants-before-buying/',
  '/guides/width-of-fabric/',
  '/guides/finished-vs-cut-size/',
  '/guides/quilt-seam-allowance/',
  '/guides/how-much-extra-backing/',
  '/guides/how-much-extra-batting/',
  '/guides/how-to-calculate-quilt-fabric/',
  '/guides/directional-fabric-cutting/',
  '/guides/fat-quarter-size/',
  '/guides/using-quilt-fabric-remnants/',
  '/guides/check-pattern-yardage/',
  '/how-it-works/',
  '/about/',
  '/methodology/',
] as const;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(SITE_ORIGIN);
  const entries = paths
    .map((path) => `  <url><loc>${new URL(path, origin).href}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
