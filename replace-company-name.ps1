# PowerShell script to replace 'Cosmo Exploit Group LLC' with 'Cargo Scale Pro Inc'
# and 'Cosmo Exploit Group LLC Weight Management System' with 'Cargo Scale Pro Inc Weight Management System'

# Get all files in the project (excluding node_modules, .git, and other unnecessary directories)
$files = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\.git\\' -and
    $_.FullName -notmatch '\\.next\\' -and
    $_.FullName -notmatch '\\dist\\' -and
    $_.FullName -notmatch '\\build\\' -and
    $_.Extension -match '\.(js|ts|tsx|jsx|css|md|yml|yaml|json|html|mjs|cjs|prisma)$'
}

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0

Write-Host "Found $totalFiles files to process..." -ForegroundColor Green

foreach ($file in $files) {
    $processedFiles++
    Write-Progress -Activity "Processing files" -Status "$processedFiles of $totalFiles" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        
        # Replace the company name references
        $content = $content -replace 'Cosmo Exploit Group LLC Weight Management System', 'Cargo Scale Pro Inc Weight Management System'
        $content = $content -replace 'Cosmo Exploit Group LLC', 'Cargo Scale Pro Inc'
        
        # Check if content was modified
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $modifiedFiles++
            Write-Host "Modified: $($file.FullName)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Error processing $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nReplacement complete!" -ForegroundColor Green
Write-Host "Total files processed: $processedFiles" -ForegroundColor Cyan
Write-Host "Files modified: $modifiedFiles" -ForegroundColor Cyan

# Show a summary of what was replaced
Write-Host "`nSummary of replacements:" -ForegroundColor Green
Write-Host "- 'Cosmo Exploit Group LLC Weight Management System' -> 'Cargo Scale Pro Inc Weight Management System'" -ForegroundColor White
Write-Host "- 'Cosmo Exploit Group LLC' -> 'Cargo Scale Pro Inc'" -ForegroundColor White

Write-Host "`nPlease review the changes and commit them to your repository." -ForegroundColor Yellow