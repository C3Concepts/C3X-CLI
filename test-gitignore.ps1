# Test Git Ignore Configuration
# This script verifies that your .gitignore is working correctly

Write-Host "🔍 Testing Git Ignore Configuration" -ForegroundColor Cyan
Write-Host "=============================================="

# Check if we're in a git repository
$isGitRepo = git rev-parse --is-inside-work-tree 2>$null
if (-not $isGitRepo) {
    Write-Host "❌ Error: Not in a git repository" -ForegroundColor Red
    Write-Host "Run this script from your project root" -ForegroundColor Yellow
    exit 1
}

# Test 1: Check if .gitignore exists
Write-Host "`n📁 Test 1: Checking .gitignore file..." -ForegroundColor Yellow
if (Test-Path .gitignore) {
    Write-Host "✅ .gitignore file exists" -ForegroundColor Green
    
    # Read and display .gitignore content
    $gitignoreContent = Get-Content .gitignore -Raw
    Write-Host "`n.gitignore content preview:" -ForegroundColor Gray
    Write-Host "----------------------------"
    $gitignoreContent -split "`n" | Select-Object -First 20 | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
    if (($gitignoreContent -split "`n").Count -gt 20) {
        Write-Host "  ... (and more)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ .gitignore file not found!" -ForegroundColor Red
    exit 1
}

# Test 2: Check if .env is in .gitignore
Write-Host "`n🔐 Test 2: Checking if .env is ignored..." -ForegroundColor Yellow
$envPatterns = @('\.env', '\.env\.local', '\.env\.*\.local', '\.env\.example')
$isEnvIgnored = $false

foreach ($pattern in $envPatterns) {
    if ($gitignoreContent -match $pattern) {
        Write-Host "✅ Found '$pattern' in .gitignore" -ForegroundColor Green
        $isEnvIgnored = $true
    }
}

if (-not $isEnvIgnored) {
    Write-Host "❌ WARNING: .env patterns not found in .gitignore!" -ForegroundColor Red
    Write-Host "   Add these lines to your .gitignore:" -ForegroundColor Yellow
    Write-Host "   .env" -ForegroundColor White
    Write-Host "   .env.local" -ForegroundColor White
    Write-Host "   .env.*.local" -ForegroundColor White
    Write-Host "   .env.example (if you commit the example)" -ForegroundColor White
}

# Test 3: Create test .env file and check git status
Write-Host "`n🧪 Test 3: Creating test files..." -ForegroundColor Yellow

# Create test directory for safe testing
$testDir = ".gitignore-test"
New-Item -ItemType Directory -Path $testDir -Force | Out-Null

# Create test .env file
$testEnvContent = @"
# Test environment variables
SECRET_KEY=test-secret-key-12345
DATABASE_URL=postgresql://test:test@localhost:5432/testdb
API_KEY=test-api-key-67890
JWT_SECRET=test-jwt-secret-abc123
"@

$testEnvPath = Join-Path $testDir ".env"
Set-Content -Path $testEnvPath -Value $testEnvContent

# Create other test files
$testFiles = @(
    ".env.local",
    ".env.development.local",
    ".env.production.local",
    "node_modules/test-file.txt",
    "logs/test.log",
    "dist/test.js",
    ".DS_Store",
    "Thumbs.db"
)

foreach ($file in $testFiles) {
    $testFilePath = Join-Path $testDir $file
    $dirPath = Split-Path $testFilePath
    if (-not (Test-Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
    }
    Set-Content -Path $testFilePath -Value "Test content for $file"
}

Write-Host "✅ Created test files in $testDir/" -ForegroundColor Green

# Test 4: Check git status for ignored files
Write-Host "`n📊 Test 4: Checking git status..." -ForegroundColor Yellow

# First, let's check what git would track
Write-Host "`nFiles that WOULD be tracked (if not ignored):" -ForegroundColor Gray
Write-Host "-----------------------------------------------"

# Check each test file
$filesToCheck = @(
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.production.local",
    "node_modules/test-file.txt",
    "logs/test.log",
    "dist/test.js",
    ".DS_Store",
    "Thumbs.db"
)

foreach ($file in $filesToCheck) {
    $fullPath = Join-Path $testDir $file
    $relativePath = $fullPath.Replace("$PWD\", "")
    
    # Check if file exists
    if (Test-Path $fullPath) {
        # Use git check-ignore to see if it's ignored
        $ignoreResult = git check-ignore $fullPath 2>$null
        if ($ignoreResult) {
            Write-Host "✅ $file - Correctly ignored" -ForegroundColor Green
        } else {
            # Check if it would show in git status
            $statusResult = git status --porcelain $fullPath 2>$null
            if ($statusResult) {
                Write-Host "❌ $file - Would be tracked!" -ForegroundColor Red
            } else {
                Write-Host "⚠️  $file - Not tracked (but not explicitly ignored)" -ForegroundColor Yellow
            }
        }
    }
}

# Test 5: Show actual git status
Write-Host "`n📋 Test 5: Current git status (actual changes):" -ForegroundColor Yellow
Write-Host "-----------------------------------------------" -ForegroundColor Gray
git status --porcelain | ForEach-Object {
    $status = $_.Substring(0, 2)
    $file = $_.Substring(3)
    
    switch ($status) {
        "??" { Write-Host "Untracked: $file" -ForegroundColor Yellow }
        "A " { Write-Host "Added: $file" -ForegroundColor Green }
        "M " { Write-Host "Modified: $file" -ForegroundColor Blue }
        "D " { Write-Host "Deleted: $file" -ForegroundColor Red }
        "R " { Write-Host "Renamed: $file" -ForegroundColor Cyan }
        "C " { Write-Host "Copied: $file" -ForegroundColor Cyan }
        default { Write-Host "$status $file" -ForegroundColor Gray }
    }
}

# Test 6: Check for existing .env in repository
Write-Host "`n🔍 Test 6: Searching for existing .env files in git..." -ForegroundColor Yellow
$envFilesInGit = git ls-files | Where-Object { $_ -match '\.env' }

if ($envFilesInGit) {
    Write-Host "❌ WARNING: Found .env files already in git:" -ForegroundColor Red
    $envFilesInGit | ForEach-Object {
        Write-Host "   $_" -ForegroundColor White
    }
    Write-Host "`n⚠️  Important: These files are already tracked!" -ForegroundColor Red
    Write-Host "   To stop tracking them, run:" -ForegroundColor Yellow
    Write-Host "   git rm --cached <file>" -ForegroundColor White
    Write-Host "   Then add the file to .gitignore" -ForegroundColor White
} else {
    Write-Host "✅ No .env files found in git history" -ForegroundColor Green
}

# Test 7: Show what would be committed
Write-Host "`n📦 Test 7: What would be committed?" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray

$stagedChanges = git diff --name-only --cached
if ($stagedChanges) {
    Write-Host "Staged changes (will be committed):" -ForegroundColor Cyan
    $stagedChanges | ForEach-Object {
        Write-Host "   $_" -ForegroundColor Green
    }
} else {
    Write-Host "No staged changes" -ForegroundColor Gray
}

$unstagedChanges = git diff --name-only
if ($unstagedChanges) {
    Write-Host "`nUnstaged changes (won't be committed):" -ForegroundColor Cyan
    $unstagedChanges | ForEach-Object {
        Write-Host "   $_" -ForegroundColor Blue
    }
}

# Test 8: Final safety check
Write-Host "`n✅ FINAL SAFETY CHECK" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

# Check if .env exists in the root
if (Test-Path ".env") {
    Write-Host "⚠️  WARNING: .env file exists in root directory!" -ForegroundColor Yellow
    Write-Host "   Make sure it's in .gitignore before committing" -ForegroundColor White
    
    # Quick check if it's ignored
    $rootEnvIgnored = git check-ignore .env 2>$null
    if ($rootEnvIgnored) {
        Write-Host "   ✅ Root .env is correctly ignored" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Root .env is NOT ignored!" -ForegroundColor Red
        Write-Host "   Add '.env' to your .gitignore file" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No .env file in root directory" -ForegroundColor Green
}

# Cleanup
Write-Host "`n🧹 Cleaning up test files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $testDir -ErrorAction SilentlyContinue
Write-Host "✅ Test files removed" -ForegroundColor Green

# Summary
Write-Host "`n📝 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "To safely commit your code:" -ForegroundColor White
Write-Host "1. Review the staged changes above" -ForegroundColor White
Write-Host "2. Make sure no .env files are being tracked" -ForegroundColor White
Write-Host "3. Run: git commit -m 'Your commit message'" -ForegroundColor Green
Write-Host "4. Push: git push origin main" -ForegroundColor Green

Write-Host "`n💡 Tip: Consider using git-crypt or git-secret for sensitive files" -ForegroundColor Magenta
Write-Host "   These tools encrypt sensitive files before committing" -ForegroundColor Gray

# Create a .gitignore backup just in case
if (Test-Path .gitignore) {
    $backupPath = ".gitignore.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item .gitignore $backupPath
    Write-Host "`n📋 Backup created: $backupPath" -ForegroundColor Gray
}

Write-Host "`n✅ Git ignore test completed" -ForegroundColor Green