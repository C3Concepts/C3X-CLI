#!/usr/bin/env node

import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  // Check package.json
  const pkg = require('../package.json');
  
  console.log('📦 Package.json check:');
  if (pkg.type === 'module') {
    console.log('  ✅ type: "module"');
  } else {
    console.log('  ❌ Missing type: "module"');
  }
  
  if (pkg.engines?.node) {
    console.log(`  ✅ Node.js: ${pkg.engines.node}`);
  }
  
  // Test import
  console.log('\n📦 Testing imports:');
  try {
    const { Command } = await import('commander');
    console.log('  ✅ commander import works');
    
    const chalk = await import('chalk');
    console.log('  ✅ chalk import works');
    
    console.log('\n🎉 All ESM checks passed!');
    console.log('🚀 Your CLI is ready for ESM development.');
  } catch (importError) {
    console.log('  ❌ Import error:', importError.message);
  }
  
} catch (error) {
  console.error('❌ Verification failed:', error.message);
}
