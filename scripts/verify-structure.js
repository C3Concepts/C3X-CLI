// Final Verification Test for C³X CLI
import fs from 'fs-extra';
import path from 'path';

console.log('🔍 C³X CLI FINAL VERIFICATION');
console.log('==============================\n');

// Test project structure
const requiredDirs = [
    'bin',
    'src/cli',
    'src/api', 
    'src/converters',
    'src/analyzer',
    'src/generators',
    'templates'
];

const requiredFiles = [
    'bin/c3x.js',
    'src/cli/index.js',
    'src/cli/commands/migrate.js',
    'src/cli/commands/create.js',
    'src/cli/commands/auth.js',
    'src/converters/index.js',
    'src/analyzer/GasParser.js',
    'src/generators/ProjectGenerator.js',
    'package.json'
];

console.log('Checking project structure...');
let allPassed = true;

for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
        console.log(`✅ Directory: ${dir}/`);
    } else {
        console.log(`❌ Missing directory: ${dir}/`);
        allPassed = false;
    }
}

console.log('\nChecking required files...');
for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
        console.log(`✅ File: ${file}`);
    } else {
        console.log(`❌ Missing file: ${file}`);
        allPassed = false;
    }
}

// Check package.json has required scripts
const packageJson = fs.readJsonSync('package.json');
const requiredScripts = ['dev', 'start', 'test'];
const hasScripts = requiredScripts.every(script => packageJson.scripts[script]);

if (hasScripts) {
    console.log('\n✅ All npm scripts present');
} else {
    console.log('\n❌ Missing some npm scripts');
    allPassed = false;
}

// Check if it's executable
try {
    const cliContent = fs.readFileSync('bin/c3x.js', 'utf8');
    if (cliContent.includes('#!/usr/bin/env node')) {
        console.log('✅ CLI is executable (has shebang)');
    } else {
        console.log('⚠️  CLI missing shebang (but still works with node)');
    }
} catch {
    console.log('⚠️  Could not check CLI executable');
}

if (allPassed) {
    console.log('\n🎉 VERIFICATION PASSED! C³X CLI is properly structured.');
    console.log('\n🚀 Ready for:');
    console.log('   npm link                    # Install locally');
    console.log('   npm publish --access public # Share with the world');
    console.log('   git push origin main       # Backup to GitHub');
} else {
    console.log('\n⚠️  Some issues found in project structure.');
}
