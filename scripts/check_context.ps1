param(
  [switch]$Quiet,
  [string]$RootPath = (Join-Path $PSScriptRoot "..")
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path -LiteralPath $RootPath).Path

$requiredFiles = @(
  "AGENTS.md",
  "CONTEXT.md",
  "docs/decisions/workflow-context-memory.md",
  "docs/decisions/v1-static-architecture.md",
  "docs/decisions/v1.1-product-revision.md",
  "docs/decisions/v1.1-project-schema-migration.md",
  "docs/decisions/v1.1-finite-stock-allocation.md",
  "docs/decisions/v1.1-reconciliation-and-pattern-comparison.md",
  "docs/decisions/v1.1-calculator-domain-expansion.md",
  "docs/architecture/context-loading.md",
  "docs/architecture/documentation-index.md",
  "docs/architecture/documentation-catalog.json",
  "docs/architecture/continuation-roadmap.md",
  "docs/architecture/documentation-reconciliation-2026-10-01.md",
  "docs/launch/postlaunch-ads-review.md",
  "docs/architecture/context-history-through-2026-09-02.md",
  "docs/architecture/product-and-runtime-boundaries.md",
  "docs/architecture/domain-contracts.md",
  "docs/architecture/project-status.md",
  "docs/architecture/v1.1-repository-audit.md",
  "docs/architecture/v1.1-guides-help-audit.md",
  "docs/decisions/v1.1-guides-owner-validation-substitution.md",
  "docs/v1.1/README.md",
  "docs/v1.1/00_GOVERNING_AGENDA.md",
  "docs/v1.1/01_PRODUCT_SPEC.md",
  "docs/v1.1/02_GOLDEN_RULES_AND_TESTS.md",
  "docs/v1.1/03_UX_IA_SPEC.md",
  "docs/v1.1/04_CONTENT_SEO_ROUTES.md",
  "docs/v1.1/05_ANALYTICS_VALIDATION.md",
  "docs/v1.1/06_COMPETITIVE_BENCHMARK_GATE.md",
  "docs/v1.1/07_TECHNICAL_MIGRATION_PLAN.md",
  "docs/v1.1/08_CODEX_ENTRY_POINT.md",
  "docs/v1.1/09_CURRENT_STATE_HANDOFF.md",
  "docs/v1.1_GUIDES_HELP/README.md",
  "docs/v1.1_GUIDES_HELP/08_GUIDES_AND_CONTEXTUAL_HELP_SPEC.md",
  "docs/v1.1_GUIDES_HELP/09_MANUAL_TEST_PLAN.md",
  "docs/manual-tests/V1_1_GUIDES_HELP_MANUAL_TESTS.md",
  "docs/product/quilt_FINAL_manifest.md",
  "docs/product/quilt_FINAL_product_spec_v1.md",
  "docs/product/quilt_FINAL_golden_rules_and_tests.md",
  "docs/product/quilt_FINAL_codex_handoff.md",
  "docs/product/quilt_FINAL_prebuild_dossier.md"
)

$missing = @()
foreach ($relativePath in $requiredFiles) {
  if (-not (Test-Path -LiteralPath (Join-Path $root $relativePath) -PathType Leaf)) {
    $missing += $relativePath
  }
}
if ($missing.Count -gt 0) {
  throw "Missing context files: $($missing -join ', ')"
}

$agents = Get-Content -Raw -Encoding utf8 -LiteralPath (Join-Path $root "AGENTS.md")
if ($agents -notmatch "Mandatory Update Protocol") {
  throw "AGENTS.md must include the Mandatory Update Protocol."
}
if ($agents -notmatch "Context placement rules") {
  throw "AGENTS.md must include context placement rules."
}

$context = Get-Content -Raw -Encoding utf8 -LiteralPath (Join-Path $root "CONTEXT.md")
foreach ($budget in @(
  @{ Name = "AGENTS.md"; Text = $agents; Bytes = 16KB },
  @{ Name = "CONTEXT.md"; Text = $context; Bytes = 12KB }
)) {
  $size = [System.Text.Encoding]::UTF8.GetByteCount($budget.Text)
  if ($size -gt $budget.Bytes) {
    throw "$($budget.Name) exceeds its $($budget.Bytes)-byte context budget ($size bytes). Move detail to routed docs."
  }
}
foreach ($heading in @("## Session Start and Recovery", "## Execution Style")) {
  if ($agents -notmatch "(?m)^$([regex]::Escape($heading))\r?$") {
    throw "AGENTS.md missing $heading"
  }
}
$requiredContextSections = @(
  "## Project Brief",
  "## Operating Rule",
  "## Current Status",
  "## Active Gaps",
  "## Hard Boundaries",
  "## Context Routing",
  "## Next Recommended Steps",
  "## Mandatory Update Protocol",
  "## Recent Changes"
)
$missingSections = @()
foreach ($section in $requiredContextSections) {
  if ($context -notmatch "(?m)^$([regex]::Escape($section))\r?$") {
    $missingSections += $section
  }
}
if ($missingSections.Count -gt 0) {
  throw "CONTEXT.md missing sections: $($missingSections -join ', ')"
}

$recent = [regex]::Match($context, '(?ms)^## Recent Changes\r?\n(.*?)(?=^## |\z)').Groups[1].Value
if ([regex]::Matches($recent, '(?m)^- ').Count -gt 3) {
  throw "CONTEXT.md must keep at most three recent-change bullets."
}
# Root-relative paths in the routing section use inline code. Ignore glob routes;
# a path must remain inside the repository and name an existing file/directory.
$routes = [regex]::Match($context, '(?ms)^## Context Routing\r?\n(.*?)(?=^## |\z)').Groups[1].Value
foreach ($match in [regex]::Matches($routes, '`([^`]+)`')) {
  $relative = $match.Groups[1].Value
  if ($relative -match '[*?]') { continue }
  $resolved = [IO.Path]::GetFullPath((Join-Path $root $relative))
  $prefix = $root.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
  if (-not $resolved.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase) -or
      -not (Test-Path -LiteralPath $resolved)) {
    throw "CONTEXT.md has invalid route: $relative"
  }
}

$forbiddenContextSections = @(
  "## Status Ledger",
  "## Known Issues",
  "## Detailed Next Steps",
  "## Domain Contracts",
  "## Runtime Rules"
)
$presentForbidden = @()
foreach ($section in $forbiddenContextSections) {
  if ($context -match "(?m)^$([regex]::Escape($section))\s*$") {
    $presentForbidden += $section
  }
}
if ($presentForbidden.Count -gt 0) {
  throw "CONTEXT.md contains detail sections that belong in routed docs: $($presentForbidden -join ', ')"
}

$mutableStatusHeadings = @(
  "## Current Status",
  "## Current State",
  "## Active Gaps",
  "## Known Issues",
  "## Next Steps",
  "## Next Checks",
  "## Milestone Divergence Reviews"
)
$invalidDecisionDocs = @()
foreach ($file in Get-ChildItem -LiteralPath (Join-Path $root "docs/decisions") -Filter "*.md" -File) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  foreach ($heading in @("## Decision", "## Rationale", "## Consequences")) {
    if ($content -notmatch "(?m)^$([regex]::Escape($heading))\s*$") {
      $invalidDecisionDocs += "$($file.Name) missing $heading"
    }
  }
  foreach ($heading in $mutableStatusHeadings) {
    if ($content -match "(?m)^$([regex]::Escape($heading))\s*$") {
      $invalidDecisionDocs += "$($file.Name) contains mutable status heading $heading"
    }
  }
}
if ($invalidDecisionDocs.Count -gt 0) {
  throw "Decision doc hygiene failed: $($invalidDecisionDocs -join '; ')"
}

$status = Get-Content -Raw -Encoding utf8 -LiteralPath (Join-Path $root "docs/architecture/project-status.md")
$checkpoint = [regex]::Match($status, '(?ms)^## Resume Checkpoint\r?\n(.*?)(?=^## |\z)').Groups[1].Value
foreach ($field in @("Updated", "Objective", "Status", "Constraints", "Evidence", "Unfinished", "Next action")) {
  if ($checkpoint -notmatch "(?m)^- $([regex]::Escape($field)): +\S") {
    throw "Resume Checkpoint missing nonempty field: $field"
  }
}
if ($checkpoint -notmatch '(?m)^- Updated: \d{4}-\d{2}-\d{2}\.') {
  throw "Resume Checkpoint Updated must use YYYY-MM-DD."
}
foreach ($heading in @("## Decision", "## Rationale", "## Consequences")) {
  if ($status -match "(?m)^$([regex]::Escape($heading))\s*$") {
    throw "Status doc contains durable decision heading $heading"
  }
}

# Completeness is separate from validity of existing CONTEXT routes: an omitted
# document or new section used to be invisible to this checker.
$catalog = Get-Content -Raw -Encoding utf8 -LiteralPath (Join-Path $root "docs/architecture/documentation-catalog.json") | ConvertFrom-Json
if ($catalog.schema_version -ne 1 -or -not $catalog.documents) {
  throw "Invalid documentation catalog schema."
}
$catalogPaths = @{}
$entries = @($catalog.documents) + @($catalog.evidence) + @($catalog.archives)
foreach ($entry in $entries) {
  if (-not $entry.path -or -not $entry.authority -or -not $entry.topics) {
    throw "Documentation catalog entry missing path/authority/topics."
  }
  $variants = @($entry.path) + @($entry.alternatives)
  $found = @()
  foreach ($relative in $variants) {
    if (-not $relative) { continue }
    $resolved = [IO.Path]::GetFullPath((Join-Path $root $relative))
    $prefix = $root.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
    if (-not $resolved.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
      throw "Documentation catalog has escaping route: $relative"
    }
    $key = $relative.Replace('\', '/')
    if ($catalogPaths.ContainsKey($key)) { throw "Duplicate documentation catalog route: $relative" }
    $catalogPaths[$key] = $true
    if (Test-Path -LiteralPath $resolved -PathType Leaf) { $found += $resolved }
  }
  if ($found.Count -eq 0 -and -not $entry.optional) {
    throw "Documentation catalog has missing route: $($entry.path)"
  }
  # Section names are checked; line numbers are advisory positions from the audit.
  if ($entry.path -match '\.md$') {
    foreach ($resolved in $found) {
      $actualHeadings = @(Get-Content -Encoding utf8 -LiteralPath $resolved | Where-Object { $_ -match '^#{1,6} ' } | ForEach-Object { $_ -replace '^#+ ', '' })
      $indexedHeadings = @($entry.sections | ForEach-Object { $_.heading })
      if (($actualHeadings -join "`n") -cne ($indexedHeadings -join "`n")) {
        throw "Documentation catalog has stale sections: $($entry.path)"
      }
    }
  }
}
$documentFiles = @(Get-ChildItem -LiteralPath (Join-Path $root "docs") -Recurse -File | Where-Object { $_.Extension -in @('.md', '.png', '.zip') })
if (Test-Path -LiteralPath (Join-Path $root "scripts")) {
  $documentFiles += @(Get-ChildItem -LiteralPath (Join-Path $root "scripts") -Recurse -File -Filter '*.md')
}
foreach ($name in @('AGENTS.md', 'CONTEXT.md', 'README.md', 'codex_prompt.txt')) {
  $documentFiles += Get-Item -LiteralPath (Join-Path $root $name)
}
foreach ($file in $documentFiles) {
  $relative = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
  if (-not $catalogPaths.ContainsKey($relative)) {
    throw "Unindexed project documentation: $relative"
  }
}

if (-not $Quiet) {
  Write-Host "Context check passed."
}
