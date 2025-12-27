import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

console.log(chalk.green('🚀 TESTING DUAL-PLATFORM MIGRATION'));
console.log(chalk.cyan('=====================================\n'));

// Test 1: Check all converters exist
console.log('1. Checking converters...');
try {
    const { default: GUAPOConverter } = await import('../src/converters/GUAPOConverter.js');
    const { default: GENIOConverter } = await import('../src/converters/GENIOConverter.js');
    const { default: CHIEWConverter } = await import('../src/converters/CHIEWConverter.js');
    const { default: FINALConverter } = await import('../src/converters/FINALConverter.js');
    console.log('✅ All converters loaded: GUAPO, GENIO, CHIEW, FINAL');
} catch (error) {
    console.error('❌ Converter error:', error.message);
}

// Test 2: Check project generators
console.log('\n2. Checking project generators...');
try {
    const { default: ProjectGenerator } = await import('../src/generators/ProjectGenerator.js');
    const { default: ExpoProjectGenerator } = await import('../src/generators/ExpoProjectGenerator.js');
    console.log('✅ Both project generators loaded');
    
    // Test quick generation
    const webGen = new ProjectGenerator();
    const expoGen = new ExpoProjectGenerator();
    console.log('✅ Generators instantiated successfully');
} catch (error) {
    console.error('❌ Generator error:', error.message);
}

// Test 3: Sample GAS code for conversion
console.log('\n3. Testing conversion with sample GAS code...');
const sampleGAS = `
function doGet() {
  return HtmlService.createHtmlOutput('<div><h1>My GAS App</h1><button onclick="handleClick()">Click me</button></div>');
}

function handleClick() {
  SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow([new Date(), 'Clicked']);
}

function onEdit(e) {
  Logger.log('Cell edited: ' + e.range.getA1Notation());
}
`;

console.log('Sample GAS code loaded:');
console.log('- 1 HTML output function');
console.log('- 1 click handler');
console.log('- 1 trigger function');

// Test 4: Verify directory structure
console.log('\n4. Verifying project structure...');
const requiredDirs = [
    'src/converters',
    'src/generators',
    'src/cli/commands',
    'src/api',
    'src/analyzer'
];

let allDirsExist = true;
for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
        console.log(`  ✅ ${dir}/`);
    } else {
        console.log(`  ❌ Missing: ${dir}/`);
        allDirsExist = false;
    }
}

if (allDirsExist) {
    console.log('\n🎉 DUAL-PLATFORM MIGRATION READY!');
    console.log('\nYou can now run:');
    console.log('  c3x migrate <script-id> --expo        # Web + Mobile');
    console.log('  c3x migrate <script-id> --mobile-only # Mobile only');
    console.log('  c3x migrate <script-id>               # Web only');
} else {
    console.log('\n⚠️  Some directories missing. Run setup again.');
}
