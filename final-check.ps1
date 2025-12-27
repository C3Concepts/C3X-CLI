# final-check.ps1
Write-Host "Running final syntax check..." -ForegroundColor Cyan

$problematic = @()
Get-ChildItem src -Recurse -Filter *.js | ForEach-Object {
    try {
        node --check $_.FullName > $null 2>&1
        Write-Host "✅ $($_.FullName)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($_.FullName)" -ForegroundColor Red
        $problematic += $_.FullName
    }
}

if ($problematic.Count -gt 0) {
    Write-Host "`n❌ Found $($problematic.Count) files with syntax errors:" -ForegroundColor Red
    $problematic | ForEach-Object { Write-Host "  - $_" }
    
    Write-Host "`nTo fix remaining files, run:" -ForegroundColor Yellow
    Write-Host "node --check <file>  # To see the exact error" -ForegroundColor Yellow
} else {
    Write-Host "`n🎉 All files are syntactically correct!" -ForegroundColor Green
    Write-Host "Now run: npm run lint" -ForegroundColor Yellow
}