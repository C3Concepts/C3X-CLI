# fix-syntax.ps1
# PowerShell script to fix JavaScript syntax errors in the project

Write-Host "🔧 Fixing syntax errors in JavaScript files..." -ForegroundColor Cyan
Write-Host "================================================"

# Function to fix GoogleOAuth.js
function Fix-GoogleOAuth {
    $file = "src\auth\GoogleOAuth.js"
    if (Test-Path $file) {
        Write-Host "Checking $file..." -ForegroundColor Yellow
        
        # Read the file line by line
        $lines = Get-Content $file
        
        # Check and fix line 28 (index 27)
        if ($lines[27] -match 'this\.clientId\s*=;') {
            $lines[27] = '    this.clientId = process.env.GOOGLE_CLIENT_ID || "";'
            $lines | Set-Content $file -Encoding UTF8
            Write-Host "✓ Fixed line 28 in GoogleOAuth.js" -ForegroundColor Green
        }
    }
}

# Function to fix GasParser.js
function Fix-GasParser {
    $file = "src\analyzer\GasParser.js"
    if (Test-Path $file) {
        Write-Host "Checking $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $content = $content -replace 'function parseGS\(code, options\)', 'function parseGS(_code, options)'
        Set-Content $file $content -Encoding UTF8
        
        Write-Host "✓ Fixed unused parameter in GasParser.js" -ForegroundColor Green
    }
}

# Function to remove semicolons after export default
function Fix-ExportStatements {
    $files = @(
        "src\cli\utils\logger.js",
        "src\cli\utils\progress.js"
    )
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "Checking $file..." -ForegroundColor Yellow
            
            $content = Get-Content $file -Raw
            $content = $content -replace 'export default (\w+);', 'export default $1'
            Set-Content $file $content -Encoding UTF8
            
            Write-Host "✓ Fixed export statement in $($file.Split('\')[-1])" -ForegroundColor Green
        }
    }
}

# Function to fix Commander.js method chaining
function Fix-CommandFiles {
    $commandFiles = @(
        "src\cli\commands\auth.js",
        "src\cli\commands\create.js",
        "src\cli\commands\migrate.js",
        "src\cli\commands\setup.js"
    )
    
    foreach ($file in $commandFiles) {
        if (Test-Path $file) {
            Write-Host "Checking $file..." -ForegroundColor Yellow
            
            $content = Get-Content $file -Raw
            
            # Fix .command("login"); -> .command("login")
            $content = $content -replace '\.command\("[^"]*"\);', '$&' -replace ';$', ''
            # Fix .description("..."); -> .description("...")
            $content = $content -replace '\.description\("[^"]*"\);', '$&' -replace ';$', ''
            # Fix .argument("..."); -> .argument("...")
            $content = $content -replace '\.argument\("[^"]*"\);', '$&' -replace ';$', ''
            # Fix .option("..."); -> .option("...")
            $content = $content -replace '\.option\("[^"]*"\);', '$&' -replace ';$', ''
            
            Set-Content $file $content -Encoding UTF8
            
            Write-Host "✓ Fixed method chaining in $($file.Split('\')[-1])" -ForegroundColor Green
        }
    }
}

# Function to fix API files
function Fix-APIFiles {
    $apiFiles = @(
        "src\api\ScriptAPI.js",
        "src\api\SheetsAPI.js",
        "src\api\DriveAPI.js"
    )
    
    foreach ($file in $apiFiles) {
        if (Test-Path $file) {
            Write-Host "Checking $file..." -ForegroundColor Yellow
            
            $content = Get-Content $file -Raw
            
            # Fix constructor trailing commas
            $content = $content -replace 'this\.\w+ = google\.\w+\({[^}]+}\),', {
                $match = $_.Value
                $match -replace ',$', ';'
            }
            
            # Fix missing closing braces in methods
            # This is a simple fix for methods that end with { instead of }
            $content = $content -replace '(\s+)catch \(error\) \{(\s+)console\.error[^}]+\s*$', '$1catch (error) {$2console.error$3$1}'
            
            Set-Content $file $content -Encoding UTF8
            
            Write-Host "✓ Fixed API file: $($file.Split('\')[-1])" -ForegroundColor Green
        }
    }
}

# Function to run syntax check
function Test-Syntax {
    Write-Host "`n🧪 Running syntax checks..." -ForegroundColor Cyan
    
    # Check all JS files
    $jsFiles = Get-ChildItem -Path "src" -Filter "*.js" -Recurse
    
    $errors = @()
    foreach ($file in $jsFiles) {
        $result = node --check $file.FullName 2>&1
        if ($LASTEXITCODE -ne 0) {
            $errors += @{
                File = $file.FullName
                Error = $result
            }
            Write-Host "✗ $($file.Name) has syntax errors" -ForegroundColor Red
        } else {
            Write-Host "✓ $($file.Name) syntax OK" -ForegroundColor Green
        }
    }
    
    return $errors
}

# Main execution
Write-Host "`nStarting fixes..." -ForegroundColor Cyan

Fix-GoogleOAuth
Fix-GasParser
Fix-ExportStatements
Fix-CommandFiles
Fix-APIFiles

Write-Host "`n✅ All fixes applied!" -ForegroundColor Green

# Run syntax check
$syntaxErrors = Test-Syntax

if ($syntaxErrors.Count -gt 0) {
    Write-Host "`n⚠️  Found $($syntaxErrors.Count) files with syntax errors:" -ForegroundColor Red
    
    foreach ($error in $syntaxErrors) {
        Write-Host "`nFile: $($error.File)" -ForegroundColor Yellow
        Write-Host "Error: $($error.Error)" -ForegroundColor Red
    }
    
    Write-Host "`n❌ Some files still have syntax errors. Manual review needed." -ForegroundColor Red
} else {
    Write-Host "`n🎉 All files have valid syntax!" -ForegroundColor Green
}

Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: node --check src\cli\index.js" -ForegroundColor White
Write-Host "2. Test: node src\cli\index.js --help" -ForegroundColor White
Write-Host "3. If errors persist, check the specific files mentioned above" -ForegroundColor White