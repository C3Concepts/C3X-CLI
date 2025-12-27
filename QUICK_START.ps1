Write-Host "🚀 C³X CLI - Quick Start Guide" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "
📦 Available Commands:" -ForegroundColor Yellow
Write-Host "  c3x migrate <script-id>    - Migrate Google Apps Script project"
Write-Host "  c3x auth --login          - Authenticate with Google"
Write-Host "  c3x create [name]         - Create new C³X project"
Write-Host "  c3x status                - Check system status"
Write-Host "  c3x --help                - Show all commands"

Write-Host "
🔧 Development Commands:" -ForegroundColor Yellow
Write-Host "  npm start                 - Run the CLI"
Write-Host "  npm run dev               - Run with nodemon"
Write-Host "  npm test                  - Run tests"
Write-Host "  npm run lint              - Lint code"
Write-Host "  npm run format            - Format code"

Write-Host "
📁 Project Structure:" -ForegroundColor Yellow
Get-ChildItem -Recurse -Depth 2 | Where-Object { .PSIsContainer } | 
    Select-Object -First 20 | ForEach-Object {
        Write-Host ("  " + .FullName.Replace((Get-Location).Path + "\", ""))
    }

Write-Host "
🎯 To get started:" -ForegroundColor Green
Write-Host "  1. Run: node bin/c3x.js --help"
Write-Host "  2. Run: node bin/c3x.js auth --login"
Write-Host "  3. Test with: node bin/c3x.js migrate test-script-123"
Write-Host "
✅ C³X CLI is ready for development!" -ForegroundColor Green
