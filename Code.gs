function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Entries') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Entries');
  const data = JSON.parse(e.postData.contents);
  const headers = Object.keys(data);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = existing.map(h => Array.isArray(data[h]) ? data[h].join(', ') : (data[h] || ''));
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
