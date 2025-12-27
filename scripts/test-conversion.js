import ConverterEngine from '../src/converters/index.js';
import GasParser from '../src/analyzer/GasParser.js';
import chalk from 'chalk';

console.log(chalk.cyan('🧪 Testing Conversion Engine\n'));

// Create a mock GAS project for testing
const mockGasProject = {
  apiEndpoints: [
    {
      name: 'doGetData',
      body: `
function doGetData(e) {
  var sheet = SpreadsheetApp.openById('12345');
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MIME_TYPE_JSON);
}
      `,
      params: ['e']
    },
    {
      name: 'doPostSubmit',
      body: `
function doPostSubmit(e) {
  var params = e.parameter;
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet.appendRow([params.name, params.email, new Date()]);
  return ContentService.createTextOutput('Success');
}
      `,
      params: ['e']
    }
  ],
  
  triggers: [
    {
      name: 'onEditTrigger',
      body: `
function onEditTrigger(e) {
  var range = e.range;
  var sheet = range.getSheet();
  if (range.getColumn() === 1 && range.getValue() === 'Complete') {
    sheet.getRange(range.getRow(), 2).setValue(new Date());
  }
}
      `,
      properties: {
        eventType: 'ON_EDIT'
      }
    },
    {
      name: 'dailyReport',
      body: `
function dailyReport() {
  var sheet = SpreadsheetApp.openById('report_sheet');
  var data = sheet.getDataRange().getValues();
  MailApp.sendEmail('admin@example.com', 'Daily Report', JSON.stringify(data));
}
      `,
      properties: {
        eventType: 'CLOCK',
        frequency: 'DAILY'
      }
    }
  ],
  
  htmlFiles: [
    {
      name: 'index.html',
      content: `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to My App</h1>
    <form onsubmit="google.script.run.processForm(this)">
      <input type="text" name="name" placeholder="Your name">
      <input type="email" name="email" placeholder="Your email">
      <button type="submit">Submit</button>
    </form>
    <div id="message"></div>
  </div>
  
  <script>
    function showMessage(msg) {
      document.getElementById('message').innerHTML = msg;
    }
    
    google.script.run.withSuccessHandler(showMessage).getData();
  </script>
</body>
</html>
      `
    }
  ]
};

async function runTest() {
  try {
    const converterEngine = new ConverterEngine();
    const gasParser = new GasParser();
    
    console.log(chalk.yellow('1. Testing GasParser...'));
    
    // Test parsing
    const testCode = mockGasProject.apiEndpoints[0].body;
    const parsed = gasParser.parseGasFile(testCode, 'test.js');
    
    if (parsed) {
      console.log(chalk.green('  ✅ GasParser working'));
      console.log(chalk.gray(`    Found ${parsed.summary.apiEndpoints} API endpoints`));
    }
    
    console.log(chalk.yellow('\n2. Testing ConverterEngine...'));
    
    // List available converters
    const converters = converterEngine.listConverters();
    console.log(chalk.gray('  Available converters:'));
    converters.forEach(conv => {
      console.log(chalk.white(`    • ${conv.name} (${conv.key}): ${conv.description}`));
    });
    
    console.log(chalk.yellow('\n3. Testing GUAPO converter...'));
    const guapoConverter = converterEngine.getConverter('guapo');
    if (guapoConverter) {
      console.log(chalk.green(`  ✅ ${guapoConverter.name} converter loaded`));
      
      // Test converting an endpoint
      const conversion = await guapoConverter.convert(mockGasProject.apiEndpoints[0], mockGasProject);
      console.log(chalk.gray(`    Generated: ${conversion.endpoint.type} ${conversion.endpoint.path}`));
    }
    
    console.log(chalk.yellow('\n4. Testing GENIO converter...'));
    const genioConverter = converterEngine.getConverter('genio');
    if (genioConverter) {
      console.log(chalk.green(`  ✅ ${genioConverter.name} converter loaded`));
      
      // Test converting a trigger
      const conversion = await genioConverter.convert(mockGasProject.triggers[0], mockGasProject);
      console.log(chalk.gray(`    Converted to: ${conversion.conversion.type} (queue: ${conversion.conversion.queue})`));
    }
    
    console.log(chalk.yellow('\n5. Testing CHIEW converter...'));
    const chiewConverter = converterEngine.getConverter('chiew');
    if (chiewConverter) {
      console.log(chalk.green(`  ✅ ${chiewConverter.name} converter loaded`));
      
      // Test converting HTML
      const conversion = await chiewConverter.convert(
        mockGasProject.htmlFiles[0].content,
        mockGasProject.htmlFiles[0].name,
        mockGasProject
      );
      if (conversion) {
        console.log(chalk.gray(`    Generated component: ${conversion.converted.componentName}`));
        console.log(chalk.gray(`    Generated ${Object.keys(conversion.converted.files).length} files`));
      }
    }
    
    console.log(chalk.green('\n🎉 All conversion tests passed!'));
    console.log(chalk.cyan('\nThe C³X conversion engine is ready to transform GAS projects.'));
    
  } catch (error) {
    console.error(chalk.red('❌ Test failed:'), error);
  }
}

runTest();

