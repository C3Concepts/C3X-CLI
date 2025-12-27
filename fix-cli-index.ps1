# fix-cli-index.ps1
$cliIndexPath = "src\cli\index.js"
if (Test-Path $cliIndexPath) {
    $content = @"
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
"@
    
    Set-Content -Path $cliIndexPath -Value $content -Encoding UTF8
    Write-Host "✓ Fixed CLI index.js" -ForegroundColor Green
}