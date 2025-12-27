import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Remove BOM from files
function removeBOM(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
      console.log(`Removing BOM from: ${filePath}`);
      fs.writeFileSync(filePath, content.slice(1), 'utf8');
      return true;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return false;
}

// Files to check
const filesToCheck = [
  '.prettierrc.json',
  'package.json',
  'src/cli/index.js',
  'src/analyzer/GasParser.js'
];

let cleaned = 0;
filesToCheck.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    if (removeBOM(filePath)) {
      cleaned++;
    }
  }
});

console.log(`Cleaned BOM from ${cleaned} files`);