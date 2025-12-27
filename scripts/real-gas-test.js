// Create a realistic GAS test
const gasCode = `
// Sample Google Apps Script with multiple patterns
function doGet(e) {
  var params = e.parameter;
  var sheet = SpreadsheetApp.openById("SHEET_ID");
  var data = sheet.getDataRange().getValues();
  
  return ContentService
    .createTextOutput(JSON.stringify({data: data, params: params}))
    .setMimeType(ContentService.MIME_TYPE_JSON);
}

function doPostSubmit(e) {
  var params = e.parameter;
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet.appendRow([params.name, params.email, new Date()]);
  
  return ContentService.createTextOutput("Success");
}

function onEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  
  if (range.getColumn() === 1 && range.getValue() === "APPROVE") {
    sheet.getRange(range.getRow(), 2).setValue("Approved at: " + new Date());
    sendApprovalEmail(sheet.getRange(range.getRow(), 3).getValue());
  }
}

function sendApprovalEmail(email) {
  GmailApp.sendEmail(email, "Approval Notification", "Your item has been approved!");
}

function dailyReport() {
  var sheet = SpreadsheetApp.openById("REPORT_SHEET");
  var data = sheet.getDataRange().getValues();
  var report = generateReport(data);
  
  GmailApp.sendEmail("admin@example.com", "Daily Report", report);
}

function generateReport(data) {
  return "Report generated at: " + new Date() + "\\n" +
         "Total rows: " + data.length + "\\n" +
         "First row: " + data[0].join(", ");
}
`;

console.log("📋 Sample GAS Code Analysis:");
console.log("Contains:");
console.log("  • 2 API endpoints (doGet, doPostSubmit)");
console.log("  • 3 triggers/functions (onEdit, sendApprovalEmail, dailyReport)");
console.log("  • Multiple GAS services (SpreadsheetApp, ContentService, GmailApp)");
console.log("  • Complex logic flows");
console.log("");
console.log("✅ This is exactly the kind of code C³X CLI is designed to migrate!");
