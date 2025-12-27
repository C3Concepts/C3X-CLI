import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

// Common fixes for specific patterns
const fixPatterns = [
  // Fix 1: Remove BOM (Byte Order Mark)
  [/^\uFEFF/, ''],
  
  // Fix 2: Fix method chaining with incorrect dots
  [/(\w+);\s*\.(\w+)/g, '$1\n  .$2'],
  
  // Fix 3: Fix trailing semicolons in export default
  [/(export default \{[\s\S]*?);(?=\s*$)/g, (match, p1) => p1],
  
  // Fix 4: Fix object properties with trailing semicolons
  [/(\w+)\s*:\s*(.+?);(?=\s*[,\}])/g, '$1: $2,'],
  
  // Fix 5: Fix function calls with missing parameters
  [/(\w+)\(\);(\s*\))/g, '$1()$2'],
  
  // Fix 6: Remove unnecessary semicolons after closing braces
  [/\}\s*;/g, '}'],
  
  // Fix 7: Fix method calls that should be properties
  [/\.(\w+)\(\);(\s*\.)/g, '.$1()$2'],
  
  // Fix 8: Fix async function syntax issues
  [/(async\s+function\s*\()\s*\)\s*\{/g, 'async function() {'],
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Apply all fix patterns
    for (const [pattern, replacement] of fixPatterns) {
      content = content.replace(pattern, replacement);
    }
    
    // Specific fixes based on file
    const filename = path.basename(filePath);
    
    if (filename === 'GasParser.js') {
      // Fix unused parameter
      content = content.replace(/function parseGS\((.*?)\)/g, (match, params) => {
        return `function parseGS(${params.replace(/code/g, '_code')})`;
      });
    }
    
    if (filename === 'index.js') {
      // Remove unused setupCommand import
      content = content.replace(/import setupCommand from '\.\/commands\/setup\.js';?\s*/g, '');
    }
    
    // Normalize line endings and remove multiple empty lines
    content = content.replace(/\r\n/g, '\n');
    content = content.replace(/\n{3,}/g, '\n\n');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${path.relative(srcDir, filePath)}`);
      return true;
    }
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
  }
  return false;
}

// Process all JavaScript files
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      fixedCount += processDirectory(fullPath);
    } else if (entry.name.endsWith('.js')) {
      if (fixFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

console.log('🔧 Fixing syntax errors across all files...');
const totalFixed = processDirectory(srcDir);
console.log(`✅ Fixed ${totalFixed} files`);