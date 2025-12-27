# fix-all.ps1 - Simple script to fix all syntax errors
Write-Host "🔧 Starting to fix all syntax errors..." -ForegroundColor Cyan

# Function to fix a specific file
function Fix-File {
    param($filePath, $fixScript)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $content = Invoke-Expression $fixScript
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  ✓ Fixed: $(Split-Path $filePath -Leaf)" -ForegroundColor Green
    }
}

# 1. Fix GasParser.js - rename 'code' to '_code'
Fix-File -filePath "src\analyzer\GasParser.js" -fixScript {
    $content -replace 'function parseGS\(code, options\)', 'function parseGS(_code, options)'
    $content = $content -replace 'parseGS\(code,', 'parseGS(_code,'
    return $content
}

# 2. Fix GoogleOAuth.js line 28
Fix-File -filePath "src\auth\GoogleOAuth.js" -fixScript {
    # Fix line 28: this.clientId =;
    $content = $content -replace "this.clientId =;", "this.clientId ="
    $content = $content -replace "process.env.GOOGLE_CLIENT_ID ||;", "process.env.GOOGLE_CLIENT_ID ||"
    return $content
}

# 3. Fix auth.js line 21
Fix-File -filePath "src\cli\commands\auth.js" -fixScript {
    # Fix: .command("login");
    $content = $content -replace '\.command\("login"\);', '.command("login")'
    return $content
}

# 4. Fix create.js line 7
Fix-File -filePath "src\cli\commands\create.js" -fixScript {
    # Fix: .description("Create a new CÂ³X project");
    $content = $content -replace '\.description\("Create a new CÂ³X project"\);', '.description("Create a new C³X project")'
    return $content
}

# 5. Fix migrate.js line 30-32
Fix-File -filePath "src\cli\commands\migrate.js" -fixScript {
    # Fix line 30: database: 'postgres', // TODO: Make this configurable;
    $content = $content -replace "database: 'postgres', // TODO: Make this configurable;", "database: 'postgres', // TODO: Make this configurable"
    return $content
}

# 6. Fix setup.js line 14
Fix-File -filePath "src\cli\commands\setup.js" -fixScript {
    # Fix the stray period issue
    $content = $content -replace 'setupCommand\s*\n  \.description', "setupCommand`n  .description"
    return $content
}

# 7. Fix logger.js line 31
Fix-File -filePath "src\cli\utils\logger.js" -fixScript {
    # Fix: export default Logger;
    $content = $content -replace 'export default Logger;', 'export default Logger'
    return $content
}

# 8. Fix progress.js line 35
Fix-File -filePath "src\cli\utils\progress.js" -fixScript {
    # Fix: export default Progress;
    $content = $content -replace 'export default Progress;', 'export default Progress'
    return $content
}

# 9. Fix GenioConverter.js line 8
Fix-File -filePath "src\converters\GenioConverter.js" -fixScript {
    # Fix: this.description =;
    $content = $content -replace 'this.description =;', 'this.description = '
    return $content
}

# 10. Fix GuapoConverter.js line 148
Fix-File -filePath "src\converters\GuapoConverter.js" -fixScript {
    # Fix: "SpreadsheetApp\.openByUrl\(([^)]+)\)":;
    $content = $content -replace '"SpreadsheetApp\\.openByUrl\(([^)]+)\)":;', '"SpreadsheetApp\.openByUrl\(([^)]+)\)":'
    return $content
}

# 11. Fix converters/index.js line 23
Fix-File -filePath "src\converters\index.js" -fixScript {
    # Fix: deploymentId: 'DEPLOYMENT_ID',
    # (This might have a stray character)
    $lines = $content -split "`n"
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'deploymentId:') {
            $lines[$i] = '      deploymentId: "DEPLOYMENT_ID",'
        }
    }
    return $lines -join "`n"
}

# 12. Fix ExpoProjectGenerator.js line 26
Fix-File -filePath "src\generators\ExpoProjectGenerator.js" -fixScript {
    # Fix: features = ['api', 'navigation', 'offline'];
    $content = $content -replace "features = \['api', 'navigation', 'offline'\];", "features = ['api', 'navigation', 'offline']"
    return $content
}

# 13. Create new CLI index.js
$cliIndexPath = "src\cli\index.js"
if (Test-Path $cliIndexPath) {
    $newContent = @'
#!/usr/bin/env node

import { Command } from 'commander';
import migrateCommand from './commands/migrate.js';
import authCommand from './commands/auth.js';
import createCommand from './commands/create.js';
import statusCommand from './commands/status.js';

const program = new Command();

program
  .name('c3x')
  .description('C³X CLI: 3x productivity migrating from Google Apps Script')
  .version('1.0.0');

program.addCommand(migrateCommand);
program.addCommand(authCommand);
program.addCommand(createCommand);
program.addCommand(statusCommand);

program.parse(process.argv);
'@
    Set-Content -Path $cliIndexPath -Value $newContent -Encoding UTF8
    Write-Host "  ✓ Fixed: index.js (CLI)" -ForegroundColor Green
}

Write-Host "`n✅ All fixes applied!" -ForegroundColor Cyan
Write-Host "`nNow run: npm run lint" -ForegroundColor Yellow