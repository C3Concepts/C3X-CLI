import { google } from "googleapis";
import chalk from "chalk";

class SheetsAPI {
  constructor(authClient) {
    this.authClient = authClient;
    this.sheets = google.sheets({ version: "v4", auth: authClient });
  }

  async getSpreadsheetInfo(spreadsheetId) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      const { properties, sheets } = response.data;

      return {
        id: spreadsheetId,
        title: properties.title,
        sheetCount: sheets.length,
        sheets: sheets.map((sheet) => ({
          id: sheet.properties.sheetId,
          title: sheet.properties.title,
          index: sheet.properties.index,
          type: sheet.properties.sheetType,
        })),
      };
    } catch (error) {
      console.error(
        chalk.red("❌ Error fetching spreadsheet info:"),
        error.message
      );
      throw error;
    }
  }

  async getAllData(spreadsheetId) {
    console.log(chalk.blue("📊 Exporting data from spreadsheet..."));

    try {
      const info = await this.getSpreadsheetInfo(spreadsheetId);
      const allData = {};

      for (const sheet of info.sheets) {
        console.log(chalk.gray(`  📄 Processing sheet: ${sheet.title}`));

        // Get all data from the sheet
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId,
          range: sheet.title,
        });

        allData[sheet.title] = {
          headers: response.data.values ? response.data.values[0] : [],
          data: response.data.values ? response.data.values.slice(1) : [],
          rowCount: response.data.values ? response.data.values.length - 1 : 0,
        };
      }

      console.log(
        chalk.green(`✅ Exported data from ${info.sheetCount} sheets`)
      );
      return {
        spreadsheet: info,
        data: allData,
      };
    } catch (error) {
      console.error(
        chalk.red("❌ Error exporting spreadsheet data:"),
        error.message
      );
      throw error;
    }
  }

  async detectSchema(spreadsheetId, sheetName) {
    try {
      // Get first few rows for schema detection
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z10`,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) return [];

      const headers = rows[0];
      const sampleData = rows.slice(1, Math.min(rows.length, 5));

      const schema = headers.map((header, index) => {
        const columnData = sampleData
          .map((row) => row[index])
          .filter((val) => val !== undefined);
        return {
          name: header.trim(),
          type: this.detectDataType(columnData),
          sampleValues: columnData.slice(0, 3),
        };
      });

      return schema;
    } catch (error) {
      console.error(chalk.red("❌ Error detecting schema:"), error.message);
      return [];
    }
  }

  detectDataType(values) {
    if (values.length === 0) return "string";

    // Check if all values are numbers
    const allNumbers = values.every(
      (val) => !isNaN(Number(val)) && val.trim() !== ""
    );
    if (allNumbers) return "number";

    // Check if all values are dates
    const datePattern = /^\d{4}-\d{2}-\d{2}/;
    const allDates = values.every((val) => datePattern.test(val));
    if (allDates) return "date";

    // Check if all values are boolean
    const booleanValues = ["true", "false", "yes", "no", "1", "0"];
    const allBooleans = values.every((val) =>
      booleanValues.includes(val.toLowerCase())
    );
    if (allBooleans) return "boolean";

    return "string";
  }
}

export default SheetsAPI;