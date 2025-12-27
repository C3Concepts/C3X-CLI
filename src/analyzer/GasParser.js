import chalk from "chalk";

class GasParser {
  constructor() {
    this.gasApis = {
      ContentService: ["createTextOutput", "getMimeType"],
      SpreadsheetApp: ["openById", "getActive", "getActiveSheet", "getRange"],
      Logger: ["log"],
      MailApp: ["sendEmail"],
      DriveApp: ["getFiles", "getFileById"],
      UrlFetchApp: ["fetch"],
      PropertiesService: ["getScriptProperties", "getUserProperties"],
      HtmlService: ["createHtmlOutput", "createTemplateFromFile"],
};;
  }

  parseGasFile(code, filename) {
    console.log(chalk.blue(`ðŸ” Parsing: ${filename}`));

    try {
      const functions = this.extractFunctions(code);
      const apiEndpoints = [];
      const triggers = [];
      const utils = [];

      for (const func of functions) {
        const funcType = this.classifyFunction(func, code);
        if (funcType === "api") {
          apiEndpoints.push(func);
        } else if (funcType === "trigger") {
          triggers.push(func);
        } else {
          utils.push(func);
        }
      }

      const htmlFiles = this.findHtmlFiles(code);

      return {
        filename,
        functions: { apiEndpoints, triggers, utils },
        htmlFiles,
        summary: {
          apiEndpoints: apiEndpoints.length,
          triggers: triggers.length,
          utils: utils.length,
          htmlFiles: htmlFiles.length,
        },
};;
    } catch (error) {
      console.error(chalk.red(`âŒ Error parsing ${filename}: ${error.message}`));
      return null;
    }
  }

  extractFunctions(code) {
    const functions = [];
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        params: match[2]
          .split(",")
          .map(p => p.trim())
          .filter(p => p),
        type: "function",
      });
    }

    return functions;
  }

  classifyFunction(func, _code) {
    const name = func.name.toLowerCase();
    if (name.includes("doget") || name.includes("dopost") || name.includes("api")) return "api";
    if (name.includes("onedit") || name.includes("onopen") || name.startsWith("on"))
      return "trigger";
    return "util";
  }

  findHtmlFiles(_code) {
    const htmlRegex =
      /HtmlService\.(?:createHtmlOutput|createTemplate)FromFile\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const files = [];
    let match;

    while ((match = htmlRegex.exec(_code)) !== null) {
      files.push(match[1]);
    }

    return [...new Set(files)];
  }
}

export default GasParser;


