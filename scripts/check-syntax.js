console.log('🔍 Syntax Check for C³X CLI');
console.log('===========================\n');

const filesToCheck = [
  'src/cli/commands/migrate.js',
  'src/cli/utils/progress.js', 
  'src/converters/index.js',
  'src/converters/GenioConverter.js',
  'src/converters/GuapoConverter.js',
  'src/generators/ProjectGenerator.js',
  'src/analyzer/GasParser.js'
];

let passed = 0;
let failed = 0;

for (const file of filesToCheck) {
  try {
    // Dynamically import each module
    await import(`../${file}`);
    console.log(`✅ ${file} - Syntax OK`);
    passed++;
  } catch (error) {
    console.log(`❌ ${file} - Syntax Error: ${error.message}`);
    failed++;
  }
}

console.log('\n📊 Results:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All files have valid syntax!');
} else {
  console.log('\n⚠️  Some files need fixing');
}
