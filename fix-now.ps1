# fix-now.ps1 - Simple fixes for syntax errors
Write-Host "Starting fixes..." -ForegroundColor Cyan

# 1. Fix GoogleOAuth.js line 28
$file = "src\auth\GoogleOAuth.js"
if (Test-Path $file) {
    $lines = Get-Content $file
    if ($lines.Count -ge 28) {
        $lines[27] = '    this.clientId = process.env.GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID.apps.googleusercontent.com";'
        $lines | Set-Content $file
        Write-Host "✓ Fixed GoogleOAuth.js line 28" -ForegroundColor Green
    }
}

# 2. Fix GasParser.js parameter
$file = "src\analyzer\GasParser.js"
if (Test-Path $file) {
    $content = Get-Content $file
    $newContent = @()
    foreach ($line in $content) {
        $newContent += $line -replace 'function parseGS\(code,', 'function parseGS(_code,'
    }
    $newContent | Set-Content $file
    Write-Host "✓ Fixed GasParser.js parameter" -ForegroundColor Green
}

# 3. Remove semicolons from export default
$files = @("src\cli\utils\logger.js", "src\cli\utils\progress.js")
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file
        $newContent = @()
        foreach ($line in $content) {
            $newContent += $line -replace 'export default (\w+);', 'export default $1'
        }
        $newContent | Set-Content $file
        Write-Host "✓ Fixed $($file.Split('\')[-1])" -ForegroundColor Green
    }
}

# 4. Fix command files
$commandFiles = @(
    "src\cli\commands\auth.js",
    "src\cli\commands\create.js", 
    "src\cli\commands\setup.js"
)

foreach ($file in $commandFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        # Remove stray semicolons after method calls
        $content = $content -replace '\.command\("[^"]*"\);', '.command("$1")'
        $content = $content -replace '\.description\("[^"]*"\);', '.description("$1")'
        $content | Set-Content $file
        Write-Host "✓ Fixed $($file.Split('\')[-1])" -ForegroundColor Green
    }
}

Write-Host "`n✅ Fixes applied!" -ForegroundColor Cyan