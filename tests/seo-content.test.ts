import { describe, expect, it } from 'vitest';
import astroConfig from '../astro.config.mjs?raw';
import calculatorComponent from '../src/components/CalculatorPage.astro?raw';
import guideComponent from '../src/components/GuidePage.astro?raw';
import baseLayout from '../src/layouts/BaseLayout.astro?raw';
import bordersPage from '../src/pages/calculators/borders.astro?raw';
import fabricYardagePage from '../src/pages/calculators/fabric-yardage.astro?raw';
import hstPage from '../src/pages/calculators/half-square-triangle.astro?raw';
import backingPage from '../src/pages/calculators/quilt-backing.astro?raw';
import bindingPage from '../src/pages/calculators/quilt-binding.astro?raw';
import blockCountPage from '../src/pages/calculators/quilt-block-count.astro?raw';
import sashingPage from '../src/pages/calculators/sashing.astro?raw';
import battingPage from '../src/pages/calculators/quilt-batting.astro?raw';
import qstPage from '../src/pages/calculators/quarter-square-triangle.astro?raw';
import geesePage from '../src/pages/calculators/flying-geese.astro?raw';
import piecesPage from '../src/pages/calculators/pieces-from-fabric.astro?raw';
import backingGuide from '../src/pages/guides/backing-overage.astro?raw';
import canonicalBackingGuide from '../src/pages/guides/how-much-extra-backing.astro?raw';
import sizeGuide from '../src/pages/guides/finished-vs-cut-size.astro?raw';
import yardageGuide from '../src/pages/guides/how-to-calculate-quilt-yardage.astro?raw';
import canonicalYardageGuide from '../src/pages/guides/how-to-calculate-quilt-fabric.astro?raw';
import seamGuide from '../src/pages/guides/quilt-seam-allowance.astro?raw';
import wofGuide from '../src/pages/guides/width-of-fabric.astro?raw';
import battingGuide from '../src/pages/guides/how-much-extra-batting.astro?raw';
import directionalGuide from '../src/pages/guides/directional-fabric-cutting.astro?raw';
import fatQuarterGuide from '../src/pages/guides/fat-quarter-size.astro?raw';
import remnantsGuide from '../src/pages/guides/using-quilt-fabric-remnants.astro?raw';
import patternGuide from '../src/pages/guides/check-pattern-yardage.astro?raw';
import guideIndex from '../src/pages/guides/index.astro?raw';
import howItWorks from '../src/pages/how-it-works.astro?raw';
import sitemap from '../src/pages/sitemap.xml.ts?raw';
import robots from '../src/pages/robots.txt.ts?raw';
import aboutPage from '../src/pages/about.astro?raw';
import methodologyPage from '../src/pages/methodology.astro?raw';
import correctionsPage from '../src/pages/corrections.astro?raw';
import gettingStartedGuide from '../src/pages/guides/getting-started.astro?raw';
import plannerTutorialGuide from '../src/pages/guides/project-planner-tutorial.astro?raw';

describe('Milestone 8 static SEO and content contracts', () => {
  it('emits unique canonical links from a configurable static origin', () => {
    expect(astroConfig).toContain('process.env.SITE_URL');
    expect(baseLayout).toContain('rel="canonical"');
    expect(baseLayout).toContain('rel="icon"');
    expect(baseLayout).toContain('href="/favicon.svg"');
    expect(baseLayout).toContain('canonicalPath = Astro.url.pathname');
  });

  it('gives every calculator the required static content structure', () => {
    const pages = [
      fabricYardagePage,
      backingPage,
      bindingPage,
      hstPage,
      blockCountPage,
      bordersPage,
      sashingPage,
      battingPage,
      qstPage,
      geesePage,
      piecesPage,
    ];
    for (const page of pages) {
      expect(page).toContain('slot="assumptions"');
      expect(page).toContain('slot="methodology"');
      expect(page).toContain('slot="example"');
      expect(page).toContain('slot="related"');
    }
    expect(calculatorComponent).toContain('Open the fabric cutting planner');
    expect(calculatorComponent).toContain('<h3>Limitations</h3>');
    expect(calculatorComponent).toContain('<h3>Common question</h3>');
  });

  it('provides the hand-authored V1.1 guide routes and discovery pages', () => {
    const guides = [
      wofGuide,
      sizeGuide,
      seamGuide,
      canonicalBackingGuide,
      canonicalYardageGuide,
      battingGuide,
      directionalGuide,
      fatQuarterGuide,
      remnantsGuide,
      patternGuide,
    ];
    for (const guide of guides) {
      expect(guide).toContain('<GuidePage');
      expect(guide).toContain('<h2>');
      expect(guide).toMatch(/\/(calculators|fabric-cutting-planner)\//);
    }
    expect(guideComponent).toContain('Open the planner');
    expect(backingGuide).toContain('index={false}');
    expect(backingGuide).toContain('/guides/how-much-extra-backing/');
    expect(yardageGuide).toContain('index={false}');
    expect(yardageGuide).toContain('/guides/how-to-calculate-quilt-fabric/');
    expect(guideIndex).toContain('Start Here');
    expect(guideIndex).toContain('Common Workflows');
    expect(guideIndex).toContain('Quilting Reference');
    expect(gettingStartedGuide).toContain('Buy now is ⅜ yard');
    expect(plannerTutorialGuide).toContain('id="usable-wof"');
    expect(plannerTutorialGuide).toContain('id="cut-vs-finished"');
    expect(plannerTutorialGuide).toContain('id="buy-now"');
    expect(plannerTutorialGuide).toContain('id="cutting-plan"');
    expect(howItWorks).toContain('same selected');
    expect(howItWorks).toContain('placements.');
  });

  it('lists indexable product and trust routes, excluding unavailable feedback', () => {
    const routeCount = sitemap.match(/^ {2}'\//gm)?.length ?? 0;
    expect(routeCount).toBe(38);
    expect(sitemap).toContain("'/guides/getting-started/'");
    expect(sitemap).toContain("'/guides/project-planner-tutorial/'");
    expect(sitemap).toContain("'/guides/use-remnants-before-buying/'");
    expect(sitemap).toContain("'/guides/how-to-calculate-quilt-fabric/'");
    expect(sitemap).toContain("'/calculators/pieces-from-fabric/'");
    expect(sitemap).toContain("'/how-it-works/'");
    expect(sitemap).toContain(
      "'Content-Type': 'application/xml; charset=utf-8'",
    );
    expect(sitemap).toContain("'/about/'");
    expect(sitemap).toContain("'/methodology/'");
    expect(sitemap).not.toContain("'/corrections/'");
    expect(correctionsPage).toContain('index={false}');
    expect(baseLayout).toContain('href="/corrections/">Feedback</a>');
  });

  it('adds restrained structured data, crawl controls, and trust content', () => {
    expect(baseLayout).toContain("'@type': 'WebSite'");
    expect(baseLayout).toContain("'@type': 'BreadcrumbList'");
    expect(baseLayout).toContain("'@type': 'WebApplication'");
    expect(robots).toContain(
      "Sitemap: ${new URL('/sitemap.xml', origin).href}",
    );
    expect(robots).toContain('PUBLIC_ROBOTS_NOINDEX');
    expect(aboutPage).toContain('bounded practical heuristic');
    expect(methodologyPage).toContain('nearest increment');
    expect(correctionsPage).toContain('Feedback system coming soon');
    expect(correctionsPage).toContain('submissions are not available yet.');
    expect(correctionsPage).not.toContain('PUBLIC_CORRECTIONS_EMAIL');
    expect(correctionsPage).not.toContain('mailto:');
  });
});
