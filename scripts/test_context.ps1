$ErrorActionPreference = "Stop"
$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$fixture = Join-Path ([IO.Path]::GetTempPath()) ("quiltclarity-context-" + [guid]::NewGuid().ToString("N"))
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Write-Fixture([string]$relative, [string]$content) {
  [IO.File]::WriteAllText((Join-Path $fixture $relative), $content, $utf8)
}

function Expect-Failure([string]$label, [string]$message) {
  try {
    & (Join-Path $PSScriptRoot "check_context.ps1") -RootPath $fixture -Quiet
  } catch {
    if ($_.Exception.Message -notmatch $message) { throw }
    Write-Host "PASS: $label"
    return
  }
  throw "Expected context rejection: $label"
}

try {
  New-Item -ItemType Directory -Path $fixture | Out-Null
  # Copy maintained Markdown only; never inspect/extract supplemental archives.
  $files = @(Get-Item (Join-Path $sourceRoot "AGENTS.md"), (Join-Path $sourceRoot "CONTEXT.md"))
  $files += @(Get-ChildItem (Join-Path $sourceRoot "docs") -Recurse -File -Filter "*.md")
  foreach ($file in $files) {
    $relative = $file.FullName.Substring($sourceRoot.Length + 1)
    $destination = Join-Path $fixture $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $destination
  }
  & (Join-Path $PSScriptRoot "check_context.ps1") -RootPath $fixture -Quiet
  Write-Host "PASS: valid isolated context"
  $context = Get-Content (Join-Path $fixture "CONTEXT.md") -Raw -Encoding utf8
  $agents = Get-Content (Join-Path $fixture "AGENTS.md") -Raw -Encoding utf8
  $statusPath = "docs/architecture/project-status.md"
  $status = Get-Content (Join-Path $fixture $statusPath) -Raw -Encoding utf8

  Write-Fixture "CONTEXT.md" ($context + ('x' * 12289))
  Expect-Failure "context growth" "context budget"
  Write-Fixture "CONTEXT.md" ($context.Replace('## Active Gaps', '## Omitted'))
  Expect-Failure "missing section" "missing sections"
  Write-Fixture "CONTEXT.md" ($context.Replace('`docs/architecture/domain-contracts.md`', '`docs/architecture/missing.md`'))
  Expect-Failure "broken route" "invalid route"
  Write-Fixture "CONTEXT.md" ($context.Replace('`docs/architecture/domain-contracts.md`', '`../outside.md`'))
  Expect-Failure "escaping route" "invalid route"
  # Isolate the history limit from the byte budget, even near production's cap.
  $historyPrefix = ($context -split '(?m)^## Recent Changes\s*$', 2)[0]
  Write-Fixture "CONTEXT.md" ($historyPrefix + "## Recent Changes`n`n- First.`n- Second.`n- Third.`n- Fourth.`n")
  Expect-Failure "unbounded history" "three recent-change"
  Write-Fixture "CONTEXT.md" $context
  Write-Fixture "AGENTS.md" ($agents + ('x' * 16385))
  Expect-Failure "instruction growth" "context budget"
  Write-Fixture "AGENTS.md" $agents
  Write-Fixture $statusPath ($status.Replace('- Next action:', '- Missing action:'))
  Expect-Failure "incomplete recovery" "missing nonempty field"
  Write-Fixture $statusPath $status
  & (Join-Path $PSScriptRoot "check_context.ps1") -RootPath $fixture -Quiet
  Write-Host "PASS: restored context"
} finally {
  $resolvedFixture = [IO.Path]::GetFullPath($fixture)
  $tempPrefix = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
  if (-not $resolvedFixture.StartsWith($tempPrefix, [StringComparison]::OrdinalIgnoreCase) -or
      (Split-Path $resolvedFixture -Leaf) -notmatch '^quiltclarity-context-[a-f0-9]{32}$') {
    throw "Refusing cleanup outside the isolated context fixture."
  }
  if (Test-Path -LiteralPath $resolvedFixture) {
    Remove-Item -LiteralPath $resolvedFixture -Recurse -Force
  }
}
