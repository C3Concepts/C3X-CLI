import GuapoConverter from '../src/converters/GuapoConverter.js';

const converter = new GuapoConverter();
const gasFunction = {
  name: 'doGetData',
  body: `
function doGetData(e) {
  var sheet = SpreadsheetApp.openById('12345');
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data));
}`,
  params: ['e']
};

console.log('Testing GuapoConverter...');
converter.convert(gasFunction, {})
  .then(result => {
    console.log('✅ Conversion successful');
    console.log('Endpoint:', result.endpoint);
    console.log('Generated files:', Object.keys(result.code).length);
  })
  .catch(error => {
    console.log('❌ Conversion failed:', error.message);
  });
