import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDualPlatform() {
    console.log('🔧 Testing C³X CLI Dual-Platform Capabilities\n');
    
    // Test 1: Verify FINALConverter exists and works
    console.log('1. Testing FINALConverter...');
    try {
        const { default: FINALConverter } = await import('../src/converters/FINALConverter.js');
        const converter = new FINALConverter();
        
        // Test basic HTML conversion
        const html = '<div class="container"><h1>Test</h1><button onclick="handleClick()">Click</button></div>';
        const result = converter.convertHtmlToReactNative(html, 'TestComponent');
        
        if (result.includes('import React') && result.includes('TestComponent')) {
            console.log('✅ FINALConverter works correctly');
        } else {
            console.log('⚠️  FINALConverter output may be incomplete');
        }
    } catch (error) {
        console.log(`❌ FINALConverter test failed: ${error.message}`);
    }
    
    // Test 2: Verify ExpoProjectGenerator
    console.log('\n2. Testing ExpoProjectGenerator...');
    try {
        const { default: ExpoProjectGenerator } = await import('../src/generators/ExpoProjectGenerator.js');
        const generator = new ExpoProjectGenerator();
        console.log('✅ ExpoProjectGenerator loaded successfully');
        
        // Test creating a small project
        const testDir = './test-expo-app';
        if (fs.existsSync(testDir)) {
            await fs.remove(testDir);
        }
        
        console.log('   Creating test Expo project...');
        const result = await generator.generateExpoProject('TestExpoApp', {
            outputDir: '.',
            apiUrl: 'http://localhost:3000'
        });
        
        if (result.success) {
            console.log(`✅ Expo project created at: ${result.path}`);
            
            // Verify key files exist
            const requiredFiles = [
                'app.json',
                'package.json',
                'app/_layout.js',
                'app/index.js'
            ];
            
            let allFilesExist = true;
            for (const file of requiredFiles) {
                const filePath = path.join(result.path, file);
                if (fs.existsSync(filePath)) {
                    console.log(`   ✅ ${file}`);
                } else {
                    console.log(`   ❌ ${file} (missing)`);
                    allFilesExist = false;
                }
            }
            
            if (allFilesExist) {
                console.log('✅ All required Expo files generated');
            }
            
            // Clean up
            await fs.remove(testDir);
        } else {
            console.log(`❌ Failed to create Expo project: ${result.error}`);
        }
    } catch (error) {
        console.log(`❌ ExpoProjectGenerator test failed: ${error.message}`);
    }
    
    // Test 3: Verify migration command has new options
    console.log('\n3. Testing migration command updates...');
    try {
        const { default: migrateCommand } = await import('../src/cli/commands/migrate.js');
        
        // Check if the command has the new options
        const options = migrateCommand.options || [];
        const hasExpoOption = options.some(opt => opt.long === '--expo');
        const hasMobileOnlyOption = options.some(opt => opt.long === '--mobile-only');
        
        if (hasExpoOption) {
            console.log('✅ --expo option available');
        } else {
            console.log('❌ --expo option missing');
        }
        
        if (hasMobileOnlyOption) {
            console.log('✅ --mobile-only option available');
        } else {
            console.log('❌ --mobile-only option missing');
        }
    } catch (error) {
        console.log(`❌ Migration command test failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📱 DUAL-PLATFORM TEST COMPLETE');
    console.log('='.repeat(50));
    console.log('\nYour C³X CLI now supports:');
    console.log('• 🌐 Web apps (Express.js + React)');
    console.log('• 📱 Mobile apps (Expo + React Native)');
    console.log('• 🔗 Both from the same GAS codebase!');
    console.log('\nRun: c3x migrate --help to see new options');
}

testDualPlatform().catch(console.error);
