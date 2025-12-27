console.log('🎯 FINAL VERIFICATION');
console.log('=====================\n');

const files = [
    'bin/c3x.js',
    'src/cli/index.js',
    'src/analyzer/GasParser.js',
    'src/converters/index.js',
    'src/generators/ProjectGenerator.js'
];

let allPassed = true;

files.forEach(file => {
    const fs = require('fs');
    const path = require('path');
    
    const fullPath = path.resolve(__dirname, '..', file);
    
    if (fs.existsSync(fullPath)) {
        // Check syntax
        const { execSync } = require('child_process');
        try {
            execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
            console.log(`✅ ${file}`);
        } catch (error) {
            console.log(`❌ ${file} - Syntax error`);
            allPassed = false;
        }
    } else {
        console.log(`❌ ${file} - Missing`);
        allPassed = false;
    }
});

console.log('\n' + '='.repeat(40));
if (allPassed) {
    console.log('🎉 All critical files are syntactically valid!');
    console.log('\nYour C³X CLI should now work.');
    console.log('Try: node bin/c3x.js --help');
} else {
    console.log('⚠️  Some files have issues');
    console.log('Check the errors above and fix manually.');
}
console.log('='.repeat(40));
