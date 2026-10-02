import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQuery,
  createReport,
  fetchRows,
  normalizeRows,
  parseArgs,
  runReport,
} from './analytics_report.mjs';

const sample = [
  {
    path: '/calculators/fabric-yardage/',
    event: 'pageview',
    properties: '{}',
    total: 8,
  },
  {
    path: '/calculators/fabric-yardage/',
    event: 'tool_viewed',
    properties: '{"tool":"calculator","returning_user":true}',
    total: 3,
  },
  {
    path: '/calculators/fabric-yardage/',
    event: 'calculator_started',
    properties: '{"calculator":"fabric-yardage"}',
    total: 4,
  },
  {
    path: '/calculators/fabric-yardage/',
    event: 'calculator_completed',
    properties: '{"calculator":"fabric-yardage"}',
    total: 6,
  },
  {
    path: '/calculators/quilt-backing/',
    event: 'calculator_error',
    properties: '{"calculator":"quilt-backing","error_category":"validation"}',
    total: 2,
  },
  {
    path: '/planner/',
    event: 'tool_viewed',
    properties: '{"tool":"planner","returning_user":false}',
    total: 2,
  },
  {
    path: '/planner/',
    event: 'planner_started',
    properties: '{}',
    total: 1,
  },
  {
    path: '/planner/',
    event: 'plan_calculation_started',
    properties: '{}',
    total: 2,
  },
  {
    path: '/planner/',
    event: 'plan_calculation_completed',
    properties: '{"completion_status":"covered_by_stock"}',
    total: 3,
  },
  {
    path: '/planner/',
    event: 'plan_calculation_failed',
    properties: '{"error_category":"calculation"}',
    total: 1,
  },
  { path: '/planner/', event: 'print_result', properties: '{}', total: 2 },
  {
    path: '/planner/',
    event: 'copy_shopping_list',
    properties: '{}',
    total: 1,
  },
  {
    path: '/guides/starting/',
    event: 'guide_started',
    properties:
      '{"guide_slug":"getting-started","guide_category":"start_here"}',
    total: 2,
  },
  {
    path: '/planner/',
    event: 'context_help_opened',
    properties: '{"help_key":"planner.fabrics"}',
    total: 4,
  },
];

test('parses bounded days and json options', () => {
  assert.deepEqual(parseArgs([]), { days: 7, json: false });
  assert.deepEqual(parseArgs(['--days', '90', '--json']), {
    days: 90,
    json: true,
  });
  for (const args of [
    ['--days', '0'],
    ['--days', '91'],
    ['--days', '1.5'],
    ['--days', 'x'],
    ['--other'],
  ]) {
    assert.throws(() => parseArgs(args), /Invalid arguments/);
  }
});

test('builds the sampling-weighted schema-filtered Analytics Engine query', () => {
  const query = buildQuery(7);
  assert.match(query, /SUM\(_sample_interval\) AS total/);
  assert.match(query, /timestamp >= NOW\(\)-INTERVAL '7' DAY/);
  assert.match(query, /blob1='1'/);
  assert.match(query, /GROUP BY blob2,blob3,blob4 FORMAT JSON$/);
});

test('aggregates weighted events into route, calculator, planner, action and categorical reports', () => {
  const report = createReport(normalizeRows(sample), 14);
  assert.equal(report.pageviewsByRoute['/calculators/fabric-yardage/'], 8);
  assert.equal(report.pageviewsByRoute['/planner/'], undefined);
  assert.equal(report.eventTotals.calculator_completed, 6);
  assert.deepEqual(report.calculators['fabric-yardage'], {
    starts: 4,
    completions: 6,
    errors: 0,
    completionPerStart: 1.5,
  });
  assert.deepEqual(report.calculators['quilt-backing'], {
    starts: 0,
    completions: 0,
    errors: 2,
    completionPerStart: null,
  });
  assert.deepEqual(report.planner, {
    workflowStarts: 1,
    calculationAttempts: 2,
    calculationCompletions: 3,
    errors: 1,
    activationPerWorkflowStart: 3,
    completionPerAttempt: 1.5,
  });
  assert.equal(report.printAndCopyActions.print_result, 2);
  assert.equal(report.printAndCopyActions.copy_shopping_list, 1);
  assert.deepEqual(report.returningUserCategories, { true: 3, false: 2 });
  assert.deepEqual(report.guideUse.guideSlug, { 'getting-started': 2 });
  assert.deepEqual(report.helpUse.helpKey, { 'planner.fabrics': 4 });
});

test('handles empty rows and rejects malformed grouped values', () => {
  assert.equal(createReport([], 7).planner.activationPerWorkflowStart, null);
  assert.equal(createReport([], 7).planner.completionPerAttempt, null);
  assert.deepEqual(normalizeRows({ data: [] }), []);
  assert.throws(
    () =>
      normalizeRows({
        data: [{ path: '/', event: 'x', properties: '[]', total: 1 }],
      }),
    /Malformed analytics data/,
  );
  assert.throws(
    () =>
      normalizeRows({
        data: [{ path: '/', event: 'x', properties: '{}', total: 'NaN' }],
      }),
    /Malformed analytics data/,
  );
});

test('fetches from the account endpoint with the environment token and never leaks upstream bodies', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ data: sample }) };
  };
  const result = await runReport({
    args: ['--days', '7'],
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'account-123',
      CLOUDFLARE_ANALYTICS_READ_TOKEN: 'secret-token',
    },
    fetchImpl,
  });
  assert.equal(result.report.eventTotals.calculator_started, 4);
  assert.match(request.url, /accounts\/account-123\/analytics_engine\/sql$/);
  assert.equal(request.options.headers.Authorization, 'Bearer secret-token');
  assert.match(request.options.body, /INTERVAL '7' DAY/);
  assert.ok(request.options.signal);
  await assert.rejects(
    fetchRows({
      accountId: 'a',
      token: 's',
      days: 7,
      fetchImpl: async () => ({
        ok: false,
        status: 403,
        text: async () => 'secret upstream body',
      }),
    }),
    (error) =>
      error.message === 'Cloudflare Analytics returned HTTP 403.' &&
      !error.message.includes('secret'),
  );
});

test('missing credentials and network failures are sanitized', async () => {
  await assert.rejects(
    fetchRows({ accountId: '', token: '', days: 7 }),
    /Missing credentials/,
  );
  await assert.rejects(
    fetchRows({
      accountId: 'a',
      token: 's',
      days: 7,
      fetchImpl: async () => {
        throw new Error('token=sensitive');
      },
    }),
    (error) =>
      error.message === 'Cloudflare Analytics request failed or timed out.' &&
      !error.message.includes('sensitive'),
  );
});
