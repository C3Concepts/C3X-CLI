# Safe Prettier Runner for PowerShell
# This avoids PowerShell's quoting issues with glob patterns

param(
    [string]$Config = ".prettierrc.json"
)

Write-Host "🔄 Running Prettier safely..." -ForegroundColor Cyan

# Find all .js files in src directory
$jsFiles = Get-ChildItem -Path "src" -Filter "*.js" -Recurse | Select-Object -ExpandProperty FullName

$totalFiles = $jsFiles.Count
$processedFiles = 0
$failedFiles = 0

Write-Host "Found $totalFiles JavaScript files" -ForegroundColor Gray

foreach ($file in $jsFiles) {
    try {
        $fileName = Split-Path $file -Leaf
        Write-Host "  Formatting: $fileName" -ForegroundColor Gray -NoNewline
        
        # Run prettier on each file individually
        npx prettier --write $file --config $Config 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $processedFiles++
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $failedFiles++
        }
    } catch {
        Write-Host " ❌ (Error: $_)" -ForegroundColor Red
        $failedFiles++
    }
}

Write-Host "`n📊 Results:" -ForegroundColor Cyan
Write-Host "  Total files: $totalFiles" -ForegroundColor Gray
Write-Host "  Processed: $processedFiles" -ForegroundColor Green
Write-Host "  Failed: $failedFiles" -ForegroundColor $(if ($failedFiles -gt 0) { "Red" } else { "Gray" })

if ($failedFiles -eq 0) {
    Write-Host "`n✅ All files formatted successfully!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some files failed to format" -ForegroundColor Yellow
}
