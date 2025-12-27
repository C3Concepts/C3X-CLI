# fix-gasparser.ps1
$file = "src\analyzer\GasParser.js"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # 1. Fix unused 'code' parameter
    $content = $content -replace 'function parseGS\(code, options\)', 'function parseGS(_code, options)'
    # 2. Add missing semicolons on lines 14 and 49
    $lines = $content -split "`n"
    # Line 14 (13 in 0-based) - add semicolon
    if ($lines.Count -gt 13) {
        $lines[13] = $lines[13].Trim() + ';'
    }
    # Line 49 (48 in 0-based) - add semicolon
    if ($lines.Count -gt 48) {
        $lines[48] = $lines[48].Trim() + ';'
    }
    $content = $lines -join "`n"
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Fixed GasParser.js" -ForegroundColor Green
}