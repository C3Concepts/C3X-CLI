import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixCommonIssues(content) {
  let fixed = content;
  
  // Fix 1: Empty imports
  fixed = fixed.replace(/import\s+from\s+['"]['"];/g, '');
  fixed = fixed.replace(/import\s+['"]['"];/g, '');
  
  // Fix 2: Unterminated template strings
  // Count backticks and ensure even number
  const backtickCount = (fixed.match(/`/g) || []).length;
  if (backtickCount % 2 !== 0) {
    // Add missing backtick at end
    fixed = fixed + '`';
  }
  
  // Fix 3: Extra closing braces
  // Remove consecutive closing braces
  fixed = fixed.replace(/\}\s*\}/g, '}');
  
  // Fix 4: Missing semicolons
  const lines = fixed.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && 
        !line.includes('if') && !line.includes('for') && !line.includes('while') &&
        !line.includes('function') && !line.includes('class') && !line.startsWith('//') &&
        !line.startsWith('/*') && !line.endsWith('*/') && !line.includes('=>')) {
      lines[i] = line + ';';
    }
  }
  fixed = lines.join('\n');
  
  return fixed;
}

async function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCommonIssues(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🛠️  Auto-fixing common syntax issues...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const jsFiles = [];
  
  function walk(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.js')) {
        jsFiles.push(fullPath);
      }
    }
  }
  
  walk(srcDir);
  
  let fixedCount = 0;
  for (const file of jsFiles) {
    if (await fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n📊 Fixed ${fixedCount} files`);
}

main().catch(console.error);
