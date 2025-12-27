# Safe Prettier Formatter for PowerShell
Write-Host "🛡️  Safe Prettier Formatter" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Create backup
$backupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating backup in $backupDir..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force
Copy-Item -Path "src\*" -Destination "$backupDir\" -Recurse -Force

# Test with one file first
Write-Host "Testing with one file..." -ForegroundColor Yellow
npx prettier --write "src/cli/index.js" --config .prettierrc

# Check syntax
try {
    $testResult = node -c "src/cli/index.js" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test passed, formatting all files..." -ForegroundColor Green
        npx prettier --write "src/**/*.js" --config .prettierrc --ignore-path .prettierignore
        Write-Host "✅ Formatting complete" -ForegroundColor Green
    } else {
        throw "Syntax error in test file"
    }
} catch {
    Write-Host "❌ Test failed, restoring backup..." -ForegroundColor Red
    Remove-Item -Path "src" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "$backupDir\*" -Destination "src\" -Recurse -Force
    Write-Host "✅ Restored from backup" -ForegroundColor Green
}
