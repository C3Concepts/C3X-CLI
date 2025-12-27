import GasParser from '../src/analyzer/GasParser.js';

const parser = new GasParser();
const code = `
function doGet(e) {
  var sheet = SpreadsheetApp.openById("test");
  return ContentService.createTextOutput("Hello");
}

function onEdit(e) {
  Logger.log("Edit detected");
}
`;

console.log('Testing GasParser with sample code...');
const result = parser.parseGasFile(code, 'test.gs');
console.log('Result:', result ? 'Success' : 'Failed');
if (result) {
  console.log('Summary:', result.summary);
}
