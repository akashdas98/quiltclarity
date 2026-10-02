#!/usr/bin/env node
/* global fetch, AbortSignal */

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DATASET = 'quiltclarity_events_v1';
const API_ROOT = 'https://api.cloudflare.com/client/v4/accounts';
const SCHEMA_VERSION = '1';
const TIMEOUT_MS = 10_000;

export function parseArgs(args) {
  let days = 7;
  let sawDays = false;
  let json = false;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--json' && !json) {
      json = true;
    } else if (arg === '--days' && !sawDays) {
      sawDays = true;
      const raw = args[i + 1];
      if (raw === undefined || !/^\d+$/.test(raw)) {
        throw new Error(
          'Invalid arguments: --days must be an integer from 1 to 90.',
        );
      }
      days = Number(raw);
      i += 1;
      if (!Number.isSafeInteger(days) || days < 1 || days > 90) {
        throw new Error(
          'Invalid arguments: --days must be an integer from 1 to 90.',
        );
      }
    } else {
      throw new Error(
        'Invalid arguments. Usage: npm run analytics:report -- [--days 1-90] [--json].',
      );
    }
  }
  return { days, json };
}

export function buildQuery(days = 7) {
  if (!Number.isSafeInteger(days) || days < 1 || days > 90) {
    throw new Error('Invalid query window.');
  }
  return `SELECT blob2 AS path,blob3 AS event,blob4 AS properties,SUM(_sample_interval) AS total FROM ${DATASET} WHERE timestamp >= NOW()-INTERVAL '${days}' DAY AND blob1='${SCHEMA_VERSION}' GROUP BY blob2,blob3,blob4 FORMAT JSON`;
}

function parseProperties(value) {
  if (typeof value !== 'string') throw new Error('Malformed analytics data.');
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('Malformed analytics data.');
  }
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Malformed analytics data.');
  }
  return parsed;
}

export function normalizeRows(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(rows)) throw new Error('Malformed analytics data.');
  return rows.map((row) => {
    if (!row || typeof row !== 'object')
      throw new Error('Malformed analytics data.');
    const { path, event, properties, total } = row;
    if (
      typeof path !== 'string' ||
      typeof event !== 'string' ||
      !Number.isFinite(Number(total)) ||
      Number(total) < 0
    )
      throw new Error('Malformed analytics data.');
    return {
      path,
      event,
      properties: parseProperties(properties),
      total: Number(total),
    };
  });
}

function increment(map, key, amount) {
  map[key] = (map[key] ?? 0) + amount;
}

function categorical(rows, eventNames, field) {
  const result = {};
  for (const row of rows) {
    if (eventNames.includes(row.event) && row.properties[field] !== undefined) {
      const value = String(row.properties[field]);
      increment(result, value, row.total);
    }
  }
  return result;
}

export function createReport(rows, days = 7) {
  const events = {};
  const pageviewsByRoute = {};
  const calculators = {};
  const planner = {
    workflowStarts: 0,
    calculationAttempts: 0,
    calculationCompletions: 0,
    errors: 0,
    activationPerWorkflowStart: null,
    completionPerAttempt: null,
  };
  const returningUsers = { true: 0, false: 0 };

  for (const row of rows) {
    increment(events, row.event, row.total);
    if (row.event === 'pageview')
      increment(pageviewsByRoute, row.path, row.total);
    if (
      [
        'calculator_started',
        'calculator_completed',
        'calculator_error',
      ].includes(row.event)
    ) {
      const calculator = row.properties.calculator;
      if (typeof calculator === 'string') {
        calculators[calculator] ??= {
          starts: 0,
          completions: 0,
          errors: 0,
          completionPerStart: null,
        };
        const metric = {
          calculator_started: 'starts',
          calculator_completed: 'completions',
          calculator_error: 'errors',
        }[row.event];
        calculators[calculator][metric] += row.total;
      }
    }
    if (row.event === 'planner_started') planner.workflowStarts += row.total;
    if (row.event === 'plan_calculation_started')
      planner.calculationAttempts += row.total;
    if (row.event === 'plan_calculation_completed')
      planner.calculationCompletions += row.total;
    if (row.event === 'plan_calculation_failed') planner.errors += row.total;
    if (
      row.event === 'tool_viewed' &&
      typeof row.properties.returning_user === 'boolean'
    ) {
      returningUsers[String(row.properties.returning_user)] += row.total;
    }
  }
  for (const item of Object.values(calculators)) {
    item.completionPerStart =
      item.starts === 0 ? null : item.completions / item.starts;
  }
  planner.activationPerWorkflowStart =
    planner.workflowStarts === 0
      ? null
      : planner.calculationCompletions / planner.workflowStarts;
  planner.completionPerAttempt =
    planner.calculationAttempts === 0
      ? null
      : planner.calculationCompletions / planner.calculationAttempts;

  const actionEvents = [
    'print_result',
    'calculator_result_printed',
    'copy_shopping_list',
  ];
  const guideEvents = [
    'guide_started',
    'guide_next_clicked',
    'guide_to_tool_clicked',
    'quick_start_completed',
  ];
  const helpEvents = ['context_help_opened', 'context_help_learn_more'];
  return {
    days,
    sampling: 'Counts are sampling-weighted estimates (SUM(_sample_interval)).',
    interpretation:
      'Ratios compare repeated event counts, not unique users; values may exceed 1.0. Planner activation is calculation completions per planner workflow start; completion per attempt uses calculation attempts.',
    pageviewsByRoute,
    eventTotals: events,
    calculators,
    planner,
    printAndCopyActions: Object.fromEntries(
      actionEvents.map((name) => [name, events[name] ?? 0]),
    ),
    returningUserCategories: returningUsers,
    guideUse: {
      eventTotals: Object.fromEntries(
        guideEvents.map((name) => [name, events[name] ?? 0]),
      ),
      guideSlug: categorical(rows, guideEvents, 'guide_slug'),
      guideCategory: categorical(rows, ['guide_started'], 'guide_category'),
    },
    helpUse: {
      eventTotals: Object.fromEntries(
        helpEvents.map((name) => [name, events[name] ?? 0]),
      ),
      helpKey: categorical(rows, helpEvents, 'help_key'),
    },
  };
}

export async function fetchRows({ accountId, token, days, fetchImpl = fetch }) {
  if (!accountId || !token)
    throw new Error(
      'Missing credentials: set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_ANALYTICS_READ_TOKEN in the environment.',
    );
  let response;
  try {
    response = await fetchImpl(
      `${API_ROOT}/${encodeURIComponent(accountId)}/analytics_engine/sql`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body: buildQuery(days),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
  } catch {
    throw new Error('Cloudflare Analytics request failed or timed out.');
  }
  if (!response?.ok)
    throw new Error(
      `Cloudflare Analytics returned HTTP ${response?.status ?? 'unknown'}.`,
    );
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Malformed analytics response.');
  }
  return normalizeRows(payload);
}

export async function runReport({
  args = [],
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const options = parseArgs(args);
  const rows = await fetchRows({
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    token: env.CLOUDFLARE_ANALYTICS_READ_TOKEN,
    days: options.days,
    fetchImpl,
  });
  return { options, report: createReport(rows, options.days) };
}

export function formatReport(report) {
  const lines = [
    `QuiltClarity analytics estimate — last ${report.days} days`,
    report.sampling,
    report.interpretation,
    '',
    'Pageviews by route',
    ...formatMap(report.pageviewsByRoute),
    '',
    'Event totals',
    ...formatMap(report.eventTotals),
    '',
    'Calculators (starts / completions / errors; completion per start)',
    ...Object.entries(report.calculators).map(
      ([name, value]) =>
        `  ${name}: ${value.starts} / ${value.completions} / ${value.errors}; ${formatRatio(value.completionPerStart)}`,
    ),
    ...(Object.keys(report.calculators).length
      ? []
      : ['  No calculator events']),
    '',
    `Planner workflow: ${report.planner.workflowStarts} starts; activation (calculation completions per workflow start): ${formatRatio(report.planner.activationPerWorkflowStart)}`,
    `Planner calculations: ${report.planner.calculationAttempts} attempts / ${report.planner.calculationCompletions} completions / ${report.planner.errors} errors; completion per attempt: ${formatRatio(report.planner.completionPerAttempt)}`,
    '',
    'Print and copy actions',
    ...formatMap(report.printAndCopyActions),
    '',
    'Returning-user categories (tool views)',
    ...formatMap(report.returningUserCategories),
    '',
    'Guide use',
    ...formatMap(report.guideUse.eventTotals),
    '  by guide: ' + formatInlineMap(report.guideUse.guideSlug),
    '  by category: ' + formatInlineMap(report.guideUse.guideCategory),
    '',
    'Help use',
    ...formatMap(report.helpUse.eventTotals),
    '  by help key: ' + formatInlineMap(report.helpUse.helpKey),
  ];
  return lines.join('\n');
}

function formatMap(map) {
  const entries = Object.entries(map);
  return entries.length
    ? entries.map(([key, value]) => `  ${key}: ${value}`).sort()
    : ['  None'];
}
function formatInlineMap(map) {
  return Object.keys(map).length
    ? Object.entries(map)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
    : 'None';
}
function formatRatio(value) {
  return value === null
    ? 'N/A (no starts)'
    : `${(value * 100).toFixed(1)}% (${value.toFixed(2)} per start)`;
}

async function main() {
  try {
    const { options, report } = await runReport({
      args: process.argv.slice(2),
    });
    process.stdout.write(
      options.json
        ? `${JSON.stringify(report, null, 2)}\n`
        : `${formatReport(report)}\n`,
    );
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : 'Analytics report failed.'}\n`,
    );
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
