import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking import paths...\n');

const filesToCheck = [
    'src/cli/commands/migrate.js',
    'src/cli/commands/auth.js',
    'src/api/OAuthClient.js',
    'src/auth/GoogleOAuth.js'
];

let allGood = true;

for (const file of filesToCheck) {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${file} does not exist`);
        allGood = false;
        continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 ${file}:`);
    
    // Check for import statements
    const importMatches = content.match(/import\s+.*from\s+['"](.*?)['"]/g) || [];
    
    if (importMatches.length === 0) {
        console.log('   No imports found');
    } else {
        for (const match of importMatches) {
            const importPath = match.match(/from\s+['"](.*?)['"]/)[1];
            
            // Check if it's a relative import
            if (importPath.startsWith('.')) {
                const fullImportPath = path.resolve(path.dirname(filePath), importPath);
                
                // Check for .js extension
                let checkPath = fullImportPath;
                if (!checkPath.endsWith('.js')) {
                    checkPath += '.js';
                }
                
                // Check if file exists
                if (fs.existsSync(checkPath)) {
                    console.log(`   ✅ ${importPath}`);
                } else if (fs.existsSync(fullImportPath)) {
                    console.log(`   ✅ ${importPath} (directory)`);
                } else {
                    console.log(`   ❌ ${importPath} -> NOT FOUND`);
                    allGood = false;
                }
            } else {
                console.log(`   📦 ${importPath} (npm package)`);
            }
        }
    }
    console.log('');
}

if (allGood) {
    console.log('🎉 All imports are correct!');
} else {
    console.log('⚠️  Some imports are incorrect. Please fix them.');
    process.exit(1);
}
