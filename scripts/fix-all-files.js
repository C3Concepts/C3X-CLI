// Systematic fix for all JavaScript files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.log(`❌ Cannot read ${filePath}: ${error.message}`);
        return null;
    }
}

function writeFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.log(`❌ Cannot write ${filePath}: ${error.message}`);
        return false;
    }
}

function fixSyntax(content) {
    if (!content) return '';
    
    // Common fixes
    let fixed = content;
    
    // Remove stray semicolons after commas
    fixed = fixed.replace(/,;/g, ',');
    
    // Remove semicolons after opening parentheses
    fixed = fixed.replace(/\(\s*;/g, '(');
    
    // Remove semicolons after opening brackets
    fixed = fixed.replace(/\[\s*;/g, '[');
    
    // Fix console.log(; etc.
    fixed = fixed.replace(/console\.(log|error|warn|info)\(;/g, 'console.$1(');
    
    // Fix object properties with stray semicolons
    fixed = fixed.replace(/(\w+):\s*\[(.*?)\],;/gs, '$1: [$2],');
    
    // Fix import statements
    fixed = fixed.replace(/import\s+from\s*['"]['"];/g, '');
    
    // Fix export statements
    fixed = fixed.replace(/export\s+default\s+(\w+);/g, 'export default $1;');
    
    return fixed;
}

function checkSyntax(filePath) {
    const { spawnSync } = require('child_process');
    const result = spawnSync('node', ['-c', filePath], {
        encoding: 'utf8'
    });
    return result.status === 0;
}

async function main() {
    console.log('🔧 Systematically fixing JavaScript files...\n');
    
    const srcDir = path.join(__dirname, '..', 'src');
    const jsFiles = [];
    
    // Collect all .js files
    function walk(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                walk(fullPath);
            } else if (item.name.endsWith('.js')) {
                jsFiles.push(fullPath);
            }
        }
    }
    
    walk(srcDir);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const file of jsFiles) {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`📄 ${relativePath}`);
        
        const content = readFile(file);
        if (content === null) {
            errorCount++;
            continue;
        }
        
        // Check current syntax
        const hasSyntaxError = !checkSyntax(file);
        
        if (hasSyntaxError) {
            console.log(`  ⚠️  Has syntax errors`);
            const fixed = fixSyntax(content);
            
            if (fixed !== content) {
                writeFile(file, fixed);
                console.log(`  🔧 Attempted to fix`);
                fixedCount++;
                
                // Check if fixed
                if (checkSyntax(file)) {
                    console.log(`  ✅ Now passes syntax check`);
                } else {
                    console.log(`  ❌ Still has syntax errors`);
                    errorCount++;
                }
            } else {
                console.log(`  ❌ Could not fix automatically`);
                errorCount++;
            }
        } else {
            console.log(`  ✅ Syntax OK`);
        }
        
        console.log('');
    }
    
    console.log('📊 Summary:');
    console.log(`✅ Fixed: ${fixedCount} files`);
    console.log(`❌ Still problematic: ${errorCount} files`);
    
    if (errorCount > 0) {
        console.log('\n⚠️  Some files need manual attention.');
        console.log('Run: node -c <filepath> to see specific errors.');
    }
}

main().catch(console.error);
