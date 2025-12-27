console.log("🔍 Testing if CLI works...");

try {
    // Test if we can load the CLI
    const { program } = await import('../src/cli/index.js');
    console.log("✅ CLI module loads");
    
    // Test if we can create a GasParser
    const GasParser = await import('../src/analyzer/GasParser.js').then(m => m.default);
    const parser = new GasParser();
    console.log("✅ GasParser works");
    
    // Test simple parsing
    const result = parser.parseGasFile('function test() { return "hello"; }', 'test.js');
    console.log("✅ Basic parsing works");
    
    console.log("\n🎉 Core functionality appears to work!");
} catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack.split("\n")[0]);
}
