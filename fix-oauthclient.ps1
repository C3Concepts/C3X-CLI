# fix-oauthclient.ps1
$file = "src\api\OAuthClient.js"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # Change unused 'google' import to '_google'
    $content = $content -replace "import google from 'googleapis';", "import _google from 'googleapis';"
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Fixed OAuthClient.js" -ForegroundColor Green
}