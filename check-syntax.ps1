$ErrorActionPreference = "Continue"

Write-Host "Checking syntax of all files..." -ForegroundColor Cyan

$files = @(
    "src\analyzer\GasParser.js",
    "src\api\DriveAPI.js", 
    "src\api\OAuthClient.js",
    "src\api\ScriptAPI.js",
    "src\api\SheetsAPI.js",
    "src\auth\GoogleOAuth.js",
    "src\cli\commands\auth.js",
    "src\cli\commands\create.js",
    "src\cli\commands\migrate.js",
    "src\cli\commands\setup.js",
    "src\cli\utils\logger.js",
    "src\cli\utils\progress.js",
    "src\converters\ChiewConverter.js",
    "src\converters\FINALConverter.js",
    "src\converters\GenioConverter.js",
    "src\converters\GuapoConverter.js",
    "src\converters\index.js",
    "src\generators\ExpoProjectGenerator.js",
    "src\generators\ProjectGenerator.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "`n=== $file ===" -ForegroundColor Yellow
        $errorOutput = node --check $file 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "âœ… Syntax OK" -ForegroundColor Green
        } else {
            Write-Host "âŒ Syntax error: $errorOutput" -ForegroundColor Red
        }
    } else {
        Write-Host "âŒ File not found: $file" -ForegroundColor Red
    }
}
