import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

console.log('🔍 Verifying formatted files...\n');

const testFiles = [
  'src/cli/index.js',
  'src/analyzer/GasParser.js',
  'src/converters/GenioConverter.js'
];

let allValid = true;

for (const file of testFiles) {
  const fullPath = resolve(__dirname, '..', file);
  
  if (existsSync(fullPath)) {
    try {
      // Try to import to check syntax
      await import(`file://${fullPath}`);
      console.log(`✅ ${file} - Syntax valid`);
    } catch (error) {
      console.log(`❌ ${file} - Syntax error: ${error.message.split('\n')[0]}`);
      allValid = false;
    }
  } else {
    console.log(`❌ ${file} - Missing`);
    allValid = false;
  }
}

console.log('\n' + '='.repeat(40));
if (allValid) {
  console.log('✅ All files are syntactically valid');
} else {
  console.log('⚠️  Some files have syntax issues');
}
console.log('='.repeat(40));
