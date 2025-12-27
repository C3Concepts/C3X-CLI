import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Debugging import chain from migrate.js\n');

// Read migrate.js and trace imports
const migratePath = resolve(__dirname, '..', 'src/cli/commands/migrate.js');
const migrateContent = await import('fs').then(fs => fs.readFileSync(migratePath, 'utf8'));

console.log('📄 migrate.js content (first 20 lines):');
console.log(migrateContent.split('\n').slice(0, 20).join('\n'));

// Extract imports
const importRegex = /import\s+.*from\s+['"](.*?)['"]/g;
const imports = [...migrateContent.matchAll(importRegex)];

console.log('\n📦 Found imports in migrate.js:');
for (const match of imports) {
    const importPath = match[1];
    console.log(`  ${importPath}`);
    
    // Resolve the import path
    const resolvedPath = resolve(dirname(migratePath), importPath);
    console.log(`    Resolves to: ${resolvedPath}`);
    
    // Check if it exists
    const fs = await import('fs');
    if (fs.existsSync(resolvedPath)) {
        console.log(`    ✅ File exists`);
    } else if (fs.existsSync(resolvedPath + '.js')) {
        console.log(`    ✅ File exists (with .js extension)`);
    } else {
        console.log(`    ❌ File not found`);
        
        // Try to find it
        console.log(`    🔍 Searching for ${importPath}...`);
        const searchTerm = importPath.split('/').pop();
        const found = fs.readdirSync(resolve(__dirname, '..'), { recursive: true })
            .filter(file => file.includes(searchTerm));
        
        if (found.length > 0) {
            console.log(`    Found similar files:`);
            found.forEach(file => console.log(`      - ${file}`));
        }
    }
    console.log('');
}
