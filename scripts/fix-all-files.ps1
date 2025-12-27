# PowerShell script to fix all JavaScript files
Write-Host "🔧 Fixing all JavaScript files..." -ForegroundColor Cyan

$jsFiles = Get-ChildItem -Path "src" -Filter "*.js" -Recurse

$fixedCount = 0
$errorCount = 0

foreach ($file in $jsFiles) {
    Write-Host "📄 $($file.FullName)" -ForegroundColor Gray
    
    # Check current syntax
    $syntaxCheck = node -c $file.FullName 2>&1
    $hasError = $LASTEXITCODE -ne 0
    
    if ($hasError) {
        Write-Host "  ⚠️  Has syntax errors" -ForegroundColor Yellow
        
        $content = Get-Content $file.FullName -Raw
        
        # Apply fixes
        $fixed = $content -replace ',;', ',' `
                         -replace '\(\s*;', '(' `
                         -replace '\[\s*;', '[' `
                         -replace 'console\.(log|error|warn|info)\(;', 'console.$1(' `
                         -replace '(\w+):\s*\[(.*?)\],;', '$1: [$2],' `
                         -replace 'import\s+from\s*[''"][''"];', '' `
                         -replace 'export\s+default\s+(\w+);', 'export default $1;'
        
        if ($fixed -ne $content) {
            $fixed | Out-File -FilePath $file.FullName -Encoding UTF8 -Force
            $fixedCount++
            Write-Host "  🔧 Applied fixes" -ForegroundColor Green
            
            # Check if fixed
            $newCheck = node -c $file.FullName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Now passes syntax check" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Still has errors" -ForegroundColor Red
                $errorCount++
            }
        } else {
            Write-Host "  ❌ Could not fix automatically" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "  ✅ Syntax OK" -ForegroundColor Green
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "✅ Fixed: $fixedCount files" -ForegroundColor Green
Write-Host "❌ Still problematic: $errorCount files" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })

if ($errorCount -gt 0) {
    Write-Host "`n⚠️  Some files need manual attention." -ForegroundColor Yellow
    Write-Host "Run: node -c <filepath> to see specific errors." -ForegroundColor White
}
