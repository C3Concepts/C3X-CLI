# fix-driveapi.ps1
$file = "src\api\DriveAPI.js"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # 1. Fix unused 'outputPath' parameter
    $content = $content -replace 'async downloadFile\(fileId, outputPath\)', 'async downloadFile(fileId, _outputPath)'
    # 2. Fix unused 'response' variable
    $content = $content -replace 'const response =', 'const _response ='
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Fixed DriveAPI.js" -ForegroundColor Green
}