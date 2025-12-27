#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 C³X CLI Import Path Fix Script\n');

// Define correct import mappings for each file
const importMappings = [
    {
        file: 'src/cli/commands/migrate.js',
        fixes: [
            { from: "import OAuthClient from '../api/OAuthClient.js'", to: "import OAuthClient from '../../api/OAuthClient.js'" }
        ]
    },
    {
        file: 'src/cli/commands/auth.js',
        fixes: [
            { from: "import GoogleOAuth from '../../auth/GoogleOAuth.js'", to: "import GoogleOAuth from '../../auth/GoogleOAuth.js'" }
        ]
    },
    {
        file: 'src/api/OAuthClient.js',
        fixes: [
            { from: "import GoogleOAuth from '../auth/GoogleOAuth.js'", to: "import GoogleOAuth from '../auth/GoogleOAuth.js'" },
            { from: "const { default: ScriptAPI } = await import('./ScriptAPI.js')", to: "const { default: ScriptAPI } = await import('./ScriptAPI.js')" },
            { from: "const { default: SheetsAPI } = await import('./SheetsAPI.js')", to: "const { default: SheetsAPI } = await import('./SheetsAPI.js')" },
            { from: "const { default: DriveAPI } = await import('./DriveAPI.js')", to: "const { default: DriveAPI } = await import('./DriveAPI.js')" }
        ]
    }
];

let totalFixed = 0;

for (const mapping of importMappings) {
    const filePath = path.join(__dirname, '..', mapping.file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${mapping.file} not found`);
        continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const fix of mapping.fixes) {
        if (content.includes(fix.from)) {
            console.log(`📝 ${mapping.file}:`);
            console.log(`   Changing: ${fix.from}`);
            console.log(`   To:       ${fix.to}`);
            content = content.replace(fix.from, fix.to);
            changed = true;
            totalFixed++;
        }
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${mapping.file}\n`);
    }
}

console.log(`\n🎉 Fixed ${totalFixed} import issues`);

// Verify the fixes
console.log('\n🔍 Verifying fixes...\n');

try {
    // Test importing migrate.js
    const migratePath = path.join(__dirname, '..', 'src/cli/commands/migrate.js');
    await import(`file://${migratePath}`);
    console.log('✅ migrate.js imports are working');
} catch (error) {
    console.log('❌ migrate.js import failed:', error.message);
}

try {
    // Test importing OAuthClient
    const oauthPath = path.join(__dirname, '..', 'src/api/OAuthClient.js');
    await import(`file://${oauthPath}`);
    console.log('✅ OAuthClient.js imports are working');
} catch (error) {
    console.log('❌ OAuthClient.js import failed:', error.message);
}

console.log('\n🚀 Fix script complete!');
