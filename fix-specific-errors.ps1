# fix-specific-errors.ps1

Write-Host "🔧 Fixing specific syntax errors..." -ForegroundColor Cyan

# 1. Fix GoogleOAuth.js line 28
$googleOAuthPath = "src\auth\GoogleOAuth.js"
if (Test-Path $googleOAuthPath) {
    $content = Get-Content $googleOAuthPath -Raw
    # Fix the broken assignment on line 28
    $content = $content -replace "this\.clientId =;`r?`nprocess\.env\.GOOGLE_CLIENT_ID \|\|;", "this.clientId = process.env.GOOGLE_CLIENT_ID ||"
    # Fix the trailing semicolon
    $content = $content -replace 'YOUR_CLIENT_ID\.apps\.googleusercontent\.com";', 'YOUR_CLIENT_ID.apps.googleusercontent.com";'
    Set-Content -Path $googleOAuthPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed GoogleOAuth.js" -ForegroundColor Green
}

# 2. Fix auth.js line 21
$authPath = "src\cli\commands\auth.js"
if (Test-Path $authPath) {
    $content = Get-Content $authPath -Raw
    # Fix the method chaining with stray semicolon
    $content = $content -replace 'authCommand`r?`n  \.command\("login"\);', "authCommand`n  .command('login')"
    Set-Content -Path $authPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed auth.js" -ForegroundColor Green
}

# 3. Fix create.js line 7
$createPath = "src\cli\commands\create.js"
if (Test-Path $createPath) {
    $content = Get-Content $createPath -Raw
    # Fix the stray semicolon
    $content = $content -replace 'createCommand`r?`n  \.description\("Create a new CÂ³X project"\);', "createCommand`n  .description('Create a new C³X project')"
    Set-Content -Path $createPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed create.js" -ForegroundColor Green
}

# 4. Fix migrate.js line 32
$migratePath = "src\cli\commands\migrate.js"
if (Test-Path $migratePath) {
    $content = Get-Content $migratePath -Raw
    # Fix the stray semicolon in the object
    $content = $content -replace 'database: ''postgres'', // TODO: Make this configurable;', "database: 'postgres', // TODO: Make this configurable"
    Set-Content -Path $migratePath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed migrate.js" -ForegroundColor Green
}

# 5. Fix setup.js line 14
$setupPath = "src\cli\commands\setup.js"
if (Test-Path $setupPath) {
    $content = Get-Content $setupPath -Raw
    # Fix the stray period
    $content = $content -replace 'setupCommand`r?`n  \.description\("Setup Google OAuth credentials for CÂ³X CLI"\)', "setupCommand`n  .description('Setup Google OAuth credentials for C³X CLI')"
    Set-Content -Path $setupPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed setup.js" -ForegroundColor Green
}

# 6. Fix logger.js line 31
$loggerPath = "src\cli\utils\logger.js"
if (Test-Path $loggerPath) {
    $content = Get-Content $loggerPath -Raw
    # Fix export default with semicolon
    $content = $content -replace 'export default Logger;', 'export default Logger'
    Set-Content -Path $loggerPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed logger.js" -ForegroundColor Green
}

# 7. Fix progress.js line 35
$progressPath = "src\cli\utils\progress.js"
if (Test-Path $progressPath) {
    $content = Get-Content $progressPath -Raw
    # Fix export default with semicolon
    $content = $content -replace 'export default Progress;', 'export default Progress'
    Set-Content -Path $progressPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed progress.js" -ForegroundColor Green
}

# 8. Fix GenioConverter.js line 8
$genioPath = "src\converters\GenioConverter.js"
if (Test-Path $genioPath) {
    $content = Get-Content $genioPath -Raw
    # Fix the incomplete assignment
    $content = $content -replace 'this\.description =;`r?`n      "Converts GAS triggers to Bull queues and scheduled jobs";', 'this.description = "Converts GAS triggers to Bull queues and scheduled jobs";'
    Set-Content -Path $genioPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed GenioConverter.js" -ForegroundColor Green
}

# 9. Fix GuapoConverter.js line 148
$guapoPath = "src\converters\GuapoConverter.js"
if (Test-Path $guapoPath) {
    $content = Get-Content $guapoPath -Raw
    # Fix the stray semicolon in regex pattern
    $content = $content -replace '"SpreadsheetApp\\.openByUrl\\(\([^)]+\)\)":;', '"SpreadsheetApp\\.openByUrl\\(([^)]+)\\)":'
    Set-Content -Path $guapoPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed GuapoConverter.js" -ForegroundColor Green
}

# 10. Fix index.js line 23
$convertersIndexPath = "src\converters\index.js"
if (Test-Path $convertersIndexPath) {
    $content = Get-Content $convertersIndexPath -Raw
    # Fix the stray semicolon in the object
    $content = $content -replace 'deploymentId: ''DEPLOYMENT_ID'',', 'deploymentId: "DEPLOYMENT_ID",'
    Set-Content -Path $convertersIndexPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed converters/index.js" -ForegroundColor Green
}

# 11. Fix ExpoProjectGenerator.js line 26
$expoPath = "src\generators\ExpoProjectGenerator.js"
if (Test-Path $expoPath) {
    $content = Get-Content $expoPath -Raw
    # Fix the stray semicolon in destructuring
    $content = $content -replace "features = \['api', 'navigation', 'offline'\];", "features = ['api', 'navigation', 'offline']"
    Set-Content -Path $expoPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed ExpoProjectGenerator.js" -ForegroundColor Green
}

Write-Host "`n✅ All specific errors fixed!" -ForegroundColor Cyan
Write-Host "`nNow run: npm run lint" -ForegroundColor Yellow