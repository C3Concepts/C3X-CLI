// Proper package.json updater without PowerShell quoting issues
import { readFileSync, writeFileSync } from 'fs';

const packageJsonPath = './package.json';

try {
  // Read package.json
  const content = readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(content);
  
  // Update the format script
  packageJson.scripts.format = 'prettier --write "src/**/*.js" --config .prettierrc.json';
  
  // Write it back
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  
  console.log('✅ Updated package.json successfully');
  console.log('\nNew format script:');
  console.log(`  ${packageJson.scripts.format}`);
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}
