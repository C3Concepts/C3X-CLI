import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verifying C³X CLI Structure\n');

const requiredModules = [
  { path: '../src/analyzer/GasParser.js', name: 'GasParser' },
  { path: '../src/converters/index.js', name: 'ConverterEngine' },
  { path: '../src/converters/GuapoConverter.js', name: 'GuapoConverter' },
  { path: '../src/converters/GenioConverter.js', name: 'GenioConverter' },
  { path: '../src/converters/ChiewConverter.js', name: 'ChiewConverter' },
  { path: '../src/generators/ProjectGenerator.js', name: 'ProjectGenerator' },
  { path: '../src/cli/commands/migrate.js', name: 'migrate command' }
];

let allPassed = true;

for (const module of requiredModules) {
  const fullPath = resolve(__dirname, module.path);
  
  try {
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${module.name} found at: ${module.path}`);
      
      // Try to import it
      try {
        await import(`file://${fullPath}`);
        console.log(`   Import successful`);
      } catch (importError) {
        console.log(`   ⚠️  Import error: ${importError.message.split('\n')[0]}`);
      }
    } else {
      console.log(`❌ ${module.name} NOT FOUND at: ${module.path}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Error checking ${module.name}: ${error.message}`);
    allPassed = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 All modules are present!');
  console.log('🚀 C³X CLI is ready for development.');
} else {
  console.log('⚠️  Some modules are missing or have issues.');
}
console.log('='.repeat(50));
