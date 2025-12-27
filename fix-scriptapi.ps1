# fix-scriptapi.ps1
$file = "src\api\ScriptAPI.js"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # Fix unused '__dirname' variable
    $content = $content -replace "const __dirname =", "const _dirname ="
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Fixed ScriptAPI.js" -ForegroundColor Green
}