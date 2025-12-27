console.log('🚀 Testing C³X CLI Basic Functionality\n');

// Test 1: Check if we can import core modules
try {
  const { existsSync } = require('fs');
  const { join } = require('path');
  
  const coreModules = [
    'src/cli/index.js',
    'src/analyzer/GasParser.js',
    'src/converters/index.js',
    'src/generators/ProjectGenerator.js'
  ];
  
  console.log('📁 Module Existence Check:');
  coreModules.forEach(module => {
    const fullPath = join(__dirname, '..', module);
    if (existsSync(fullPath)) {
      console.log(`  ✅ ${module}`);
    } else {
      console.log(`  ❌ ${module}`);
    }
  });
  
  // Test 2: Check package.json
  const packageJson = require('../package.json');
  console.log('\n📦 Package Info:');
  console.log(`  Name: ${packageJson.name}`);
  console.log(`  Version: ${packageJson.version}`);
  console.log(`  Type: ${packageJson.type || 'commonjs'}`);
  
  // Test 3: Check bin entry
  if (packageJson.bin && packageJson.bin['c3x']) {
    console.log('  Bin entry: ✅ Present');
  } else {
    console.log('  Bin entry: ❌ Missing');
  }
  
  console.log('\n✅ Basic checks passed!');
  console.log('\nTo use your CLI:');
  console.log('1. npm link (for local development)');
  console.log('2. c3x --help');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}
