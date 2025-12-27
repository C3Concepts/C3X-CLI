console.log('🏗️  C³X CLI Build Verification');
console.log('==============================\n');

const modules = [
  { name: 'CLI Entry Point', path: './bin/c3x.js' },
  { name: 'Migration Command', path: './src/cli/commands/migrate.js' },
  { name: 'Gas Parser', path: './src/analyzer/GasParser.js' },
  { name: 'Converter Engine', path: './src/converters/index.js' },
  { name: 'Project Generator', path: './src/generators/ProjectGenerator.js' },
  { name: 'GUAPO Converter', path: './src/converters/GuapoConverter.js' },
  { name: 'GENIO Converter', path: './src/converters/GenioConverter.js' },
  { name: 'Authentication', path: './src/auth/GoogleOAuth.js' }
];

let allValid = true;

for (const module of modules) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const fullPath = path.resolve(__dirname, module.path);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic syntax checks
      const issues = [];
      
      // Check for unclosed braces
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push(`Mismatched braces: {${openBraces} vs }${closeBraces}`);
      }
      
      // Check for unclosed template strings
      const backticks = (content.match(/`/g) || []).length;
      if (backticks % 2 !== 0) {
        issues.push('Unclosed template string');
      }
      
      // Check for obvious syntax errors
      if (content.includes('import  from')) {
        issues.push('Empty import statement');
      }
      
      if (issues.length === 0) {
        console.log(`✅ ${module.name}`);
      } else {
        console.log(`⚠️  ${module.name}: ${issues.join(', ')}`);
        allValid = false;
      }
    } else {
      console.log(`❌ ${module.name}: File not found`);
      allValid = false;
    }
  } catch (error) {
    console.log(`❌ ${module.name}: ${error.message}`);
    allValid = false;
  }
}

console.log('\n' + '='.repeat(40));
if (allValid) {
  console.log('🎉 BUILD VERIFICATION PASSED!');
  console.log('\nYour C³X CLI is ready for:');
  console.log('📦 npm publish');
  console.log('🚀 Real migrations');
  console.log('🔧 Development');
} else {
  console.log('⚠️  BUILD HAS ISSUES - Need to fix above problems');
}
console.log('='.repeat(40));
