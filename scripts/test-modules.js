import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing module structure...\n');

// Test 1: Try to import OAuthClient
try {
    const OAuthClient = await import('../../api/OAuthClient.js');
    console.log('✅ OAuthClient module found');
} catch (error) {
    console.log('❌ OAuthClient import failed:', error.message);
}

// Test 2: Try to import GoogleOAuth
try {
    const GoogleOAuth = await import('../../auth/GoogleOAuth.js');
    console.log('✅ GoogleOAuth module found');
} catch (error) {
    console.log('❌ GoogleOAuth import failed:', error.message);
}

// Test 3: Check file structure
const fs = await import('fs');
const path = await import('path');

const requiredFiles = [
    'src/api/OAuthClient.js',
    'src/api/ScriptAPI.js',
    'src/api/SheetsAPI.js',
    'src/api/DriveAPI.js',
    'src/auth/GoogleOAuth.js',
    'src/cli/commands/migrate.js',
    'src/cli/commands/auth.js',
    'src/cli/commands/create.js',
    'src/cli/commands/status.js',
    'src/cli/commands/setup.js'
];

console.log('\n📁 Checking file structure:');
for (const file of requiredFiles) {
    const fullPath = resolve(__dirname, '..', '..', file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} (MISSING)`);
    }
}

console.log('\n🎉 Module structure test complete');
