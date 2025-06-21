#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Applies TypeScript best practices to the codebase based on common mistakes patterns
.DESCRIPTION
    This script implements fixes for common TypeScript mistakes including:
    - Replacing 'any' with 'unknown' and proper type guards
    - Fixing enum patterns
    - Implementing proper error handling
    - Adding type guards for API responses
    - Using utility types
.PARAMETER Path
    The path to the source directory (default: src)
.PARAMETER DryRun
    Show what would be changed without making actual changes
.EXAMPLE
    .\Fix-TypeScriptBestPractices.ps1 -Path "src" -DryRun
#>

param(
    [string]$Path = "src",
    [switch]$DryRun
)

# Ensure we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Error "This script must be run from the frontend directory"
    exit 1
}

$ErrorActionPreference = "Stop"
$changedFiles = @()
$totalChanges = 0

Write-Host "🔧 Applying TypeScript Best Practices..." -ForegroundColor Cyan
Write-Host "📁 Target directory: $Path" -ForegroundColor Gray
if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
}

# Function to apply replacements to a file
function Apply-TypeScriptFixes {
    param(
        [string]$FilePath,
        [string]$Content
    )

    $originalContent = $Content
    $changes = 0

    # 1. Replace 'any' with 'unknown' in safe contexts
    $patterns = @(
        # Basic any to unknown replacements
        @{ Pattern = ': any\b(?!\[\])'; Replacement = ': unknown'; Description = 'any type to unknown' }
        @{ Pattern = ': any\[\]'; Replacement = ': unknown[]'; Description = 'any[] to unknown[]' }
        @{ Pattern = 'Array<any>'; Replacement = 'Array<unknown>'; Description = 'Array<any> to Array<unknown>' }
        @{ Pattern = 'Promise<any>'; Replacement = 'Promise<unknown>'; Description = 'Promise<any> to Promise<unknown>' }
        @{ Pattern = 'Record<string, any>'; Replacement = 'Record<string, unknown>'; Description = 'Record<string, any> to Record<string, unknown>' }

        # Function parameters (be careful with these)
        @{ Pattern = '\(([^)]*data): any\)'; Replacement = '($1${:} unknown)'; Description = 'data parameter any to unknown' }
        @{ Pattern = '\(([^)]*response): any\)'; Replacement = '($1${:} unknown)'; Description = 'response parameter any to unknown' }
        @{ Pattern = '\(([^)]*result): any\)'; Replacement = '($1${:} unknown)'; Description = 'result parameter any to unknown' }

        # useState with any
        @{ Pattern = 'useState<any\[\]>'; Replacement = 'useState<unknown[]>'; Description = 'useState<any[]> to useState<unknown[]>' }
        @{ Pattern = 'useState<any>'; Replacement = 'useState<unknown>'; Description = 'useState<any> to useState<unknown>' }

        # Interface properties
        @{ Pattern = '(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\?${:} any;'; Replacement = '$1$2?${:} unknown;'; Description = 'optional interface property any to unknown' }
        @{ Pattern = '(\s+)([a-zA-Z_][a-zA-Z0-9_]*)${:} any;'; Replacement = '$1$2${:} unknown;'; Description = 'required interface property any to unknown' }

        # Error handling improvements
        @{ Pattern = 'catch \(([^)]*)${:} any\)'; Replacement = 'catch ($1${:} unknown)'; Description = 'catch parameter any to unknown' }
        @{ Pattern = 'catch \(([^)]*)\) \{([^}]*)\1\.message'; Replacement = 'catch ($1${:} unknown) {$2($1 instanceof Error ? $1.message ${:} String($1))'; Description = 'proper error message handling' }

        # Type assertions (be very careful)
        @{ Pattern = ' as any(?!\.)'; Replacement = ' as unknown'; Description = 'type assertion any to unknown' }
    )

    foreach ($pattern in $patterns) {
        $matches = [regex]::Matches($Content, $pattern.Pattern)
        if ($matches.Count -gt 0) {
            $Content = $Content -replace $pattern.Pattern, $pattern.Replacement
            $changes += $matches.Count
            Write-Host "    ✓ $($matches.Count) × $($pattern.Description)" -ForegroundColor Green
        }
    }

    # 2. Fix enum patterns (convert numeric enums to string literal types)
    $enumPattern = 'enum\s+(\w+)\s*\{([^}]+)\}'
    $enumMatches = [regex]::Matches($Content, $enumPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

    foreach ($match in $enumMatches) {
        $enumName = $match.Groups[1].Value
        $enumBody = $match.Groups[2].Value

        # Check if it's a numeric enum (no explicit string values)
        if ($enumBody -notmatch '=\s*"') {
            $members = $enumBody -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
            $stringMembers = $members | ForEach-Object {
                $memberName = ($_ -split '=')[0].Trim()
                "$memberName = `"$memberName`""
            }

            $newEnum = "enum $enumName {`n  " + ($stringMembers -join ",`n  ") + "`n}"
            $Content = $Content -replace [regex]::Escape($match.Value), $newEnum
            $changes++
            Write-Host "    ✓ Fixed enum $enumName to use string values" -ForegroundColor Green
        }
    }

    # 3. Add proper type guards for common patterns
    $typeGuardPatterns = @(
        # Add type guard for error checking
        @{
            Pattern = 'catch \(([^)]*)${:} unknown\) \{([^}]*)\1\.message'
            Replacement = 'catch ($1${:} unknown) {$2($1 instanceof Error ? $1.message ${:} String($1))'
            Description = 'proper error type guard'
        }
    )

    foreach ($pattern in $typeGuardPatterns) {
        $matches = [regex]::Matches($Content, $pattern.Pattern)
        if ($matches.Count -gt 0) {
            $Content = $Content -replace $pattern.Pattern, $pattern.Replacement
            $changes += $matches.Count
            Write-Host "    ✓ $($matches.Count) × $($pattern.Description)" -ForegroundColor Green
        }
    }

    return @{
        Content = $Content
        Changes = $changes
        Modified = $Content -ne $originalContent
    }
}

# Get all TypeScript files
$tsFiles = Get-ChildItem -Path $Path -Recurse -Include "*.ts", "*.tsx" | Where-Object {
    $_.FullName -notmatch "node_modules|\.next|dist|build"
}

Write-Host "📊 Found $($tsFiles.Count) TypeScript files" -ForegroundColor Gray
Write-Host ""

foreach ($file in $tsFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\', '/')
    Write-Host "🔍 Processing: $relativePath" -ForegroundColor Blue

    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $result = Apply-TypeScriptFixes -FilePath $file.FullName -Content $content

        if ($result.Modified) {
            if (-not $DryRun) {
                Set-Content -Path $file.FullName -Value $result.Content -Encoding UTF8 -NoNewline
            }
            $changedFiles += $relativePath
            $totalChanges += $result.Changes
            Write-Host "    📝 $($result.Changes) changes applied" -ForegroundColor Cyan
        } else {
            Write-Host "    ⏭️  No changes needed" -ForegroundColor Gray
        }
    }
    catch {
        Write-Warning "Failed to process $relativePath`: $($_.Exception.Message)"
    }

    Write-Host ""
}

# Summary
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Files processed: $($tsFiles.Count)" -ForegroundColor Gray
Write-Host "   Files changed: $($changedFiles.Count)" -ForegroundColor Gray
Write-Host "   Total changes: $totalChanges" -ForegroundColor Gray

if ($changedFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "📝 Changed files:" -ForegroundColor Yellow
    $changedFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

    if (-not $DryRun) {
        Write-Host ""
        Write-Host "🔍 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Run: npm run build" -ForegroundColor Gray
        Write-Host "   2. Fix any remaining type errors" -ForegroundColor Gray
        Write-Host "   3. Test the application" -ForegroundColor Gray
        Write-Host "   4. Commit changes: git add . && git commit -m 'Apply TypeScript best practices'" -ForegroundColor Gray
    }
}

if ($DryRun) {
    Write-Host ""
    Write-Host "🔄 To apply these changes, run without -DryRun flag" -ForegroundColor Yellow
}
