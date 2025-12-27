import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

class GuapoConverter {
  constructor() {
    this.name = "GUAPO"; // Google Apps Script to Universal API Objects
    this.description = "Converts GAS web apps to Express.js APIs";
    this.conversions = {
      doGet: {
        pattern: "function doGet(e)",
        template: `app.get('/api/{endpointName}', async (req, res) => {
  try {
    const params = req.query;
    {body}
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`,
      },
      doPost: {
        pattern: "function doPost(e)",
        template: `app.post('/api/{endpointName}', async (req, res) => {
  try {
    const params = req.body;
    {body}
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`,
      },
    };
  }

  async convert(gasFunction, _context) {
    console.log(chalk.blue(`ðŸ”„ GUAPO: Converting ${gasFunction.name}`));

    const functionName = gasFunction.name;
    const functionBody = gasFunction.body;

    // Determine endpoint type and name
    let endpointType = "unknown";
    let endpointName = this.slugify(functionName);

    if (functionName.startsWith("doGet")) {
      endpointType = "GET";
      endpointName = endpointName.replace("doget-", "");
    } else if (functionName.startsWith("doPost")) {
      endpointType = "POST";
      endpointName = endpointName.replace("dopost-", "");
    } else {
      // Generic API endpoint
      endpointType = "POST"; // default
    }

    // Convert GAS-specific code to Express.js
    let convertedBody = this.convertGasToExpress(functionBody);

    // Generate Express.js route
    const routeCode = this.generateRoute(
      endpointType,
      endpointName,
      convertedBody,
      gasFunction.params,
    );

    // Generate controller
    const controllerCode = this.generateController(
      functionName,
      convertedBody,
      endpointName,
    );

    return {
      endpoint: {
        type: endpointType,
        name: endpointName,
        path: `/api/${endpointName}`,
        originalFunction: functionName,
      },
      code: {
        route: routeCode,
        controller: controllerCode,
        model: this.generateModel(endpointName),
        middleware: this.generateMiddleware(endpointName),
      },
      dependencies: this.extractDependencies(convertedBody),
    };
  }

  convertGasToExpress(gasCode) {
    let expressCode = gasCode;

    // Convert parameter access
    expressCode = expressCode.replace(/e\.parameter\.(\w+)/g, "params.$1");
    expressCode = expressCode.replace(/e\.parameters/g, "params");
    expressCode = expressCode.replace(/e\.queryString/g, "req.query");
    expressCode = expressCode.replace(/e\.postData/g, "req.body");
    expressCode = expressCode.replace(/e\.contextPath/g, "req.baseUrl");

    // Convert ContentService
    expressCode = expressCode.replace(/ContentService\.createTextOutput/g, "res.set");
    expressCode = expressCode.replace(/ContentService\.MIME_TYPE_JSON/g, "'application/json'");

    // Convert JSON responses
    expressCode = expressCode.replace(
      /return ContentService\.createTextOutput\(JSON\.stringify\(([^)]+)\)\)/g,
      "res.json($1)",
    );

    // Convert SpreadsheetApp to database operations
    expressCode = this.convertSpreadsheetOperations(expressCode);

    // Convert PropertiesService to environment/config
    expressCode = expressCode.replace(
      /PropertiesService\.getScriptProperties\(\)\.getProperty\(([^)]+)\)/g,
      "process.env.$1 || config.get($1)",
    );

    // Convert CacheService to Redis/memory cache
    expressCode = expressCode.replace(
      /CacheService\.getScriptCache\(\)\.get\(([^)]+)\)/g,
      "await cache.get($1)",
    );
    expressCode = expressCode.replace(
      /CacheService\.getScriptCache\(\)\.put\(([^)]+), ([^)]+)\)/g,
      "await cache.set($1, $2)",
    );

    return expressCode;
  }

  convertSpreadsheetOperations(code) {
    let converted = code;

    // Common SpreadsheetApp patterns
    const patterns = {
      // Opening spreadsheets
      "SpreadsheetApp\\.openById\\(([^)]+)\\)": "await db.getSpreadsheet($1)",
      "SpreadsheetApp\\.openByUrl\\(([^)]+)\\)": "await db.getSpreadsheetByUrl($1)",
      "SpreadsheetApp\\.getActiveSpreadsheet\\(\\)": "req.session.activeSpreadsheet",

      // Sheet operations
      "\\.getSheetByName\\(([^)]+)\\)": ".getSheet($1)",
      "\\.getDataRange\\(\\)": ".getAllRecords()",
      "\\.getRange\\(([^)]+)\\)": ".getRange($1)",
      "\\.getValues\\(\\)": ".getValues()",
      "\\.setValues\\(([^)]+)\\)": ".update($1)",
      "\\.appendRow\\(([^)]+)\\)": ".create($1)",
      "\\.clear\\(\\)": ".truncate()",
    };

    for (const [pattern, replacement] of Object.entries(patterns)) {
      converted = converted.replace(new RegExp(pattern, "g"), replacement);
    }

    return converted;
  }

  generateRoute(method, endpointName, body, params) {
    const paramDefinitions = params.length > 0 ? `\n  // Parameters: ${params.join(", ")}` : "";

    return `// ${endpointName}.js - Auto-generated by CÂ³X GUAPO
const express = require('express');
const router = express.Router();
const { ${this.camelCase(endpointName)}Controller } = require('../controllers/${endpointName}Controller');

// ${method} /api/${endpointName}
router.${method.toLowerCase()}('/', ${this.camelCase(endpointName)}Controller);
${paramDefinitions}

module.exports = router;`;
  }

  generateController(functionName, convertedBody, endpointName) {
    return `// ${endpointName}Controller.js
const ${this.camelCase(endpointName)}Service = require('../services/${endpointName}Service');

exports.${this.camelCase(endpointName)}Controller = async (req, res) => {
  try {
    ${convertedBody}
    
    res.json({
      success: true,
      message: '${functionName} executed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in ${functionName}:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};`;
  }

  generateModel(endpointName) {
    return `// ${endpointName}Model.js
const mongoose = require('mongoose');

const ${this.camelCase(endpointName)}Schema = new mongoose.Schema({
  // Auto-generated schema based on GAS data structure
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  migratedFrom: {
    type: String,
    default: 'Google Apps Script',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('${this.pascalCase(endpointName)}', ${this.camelCase(endpointName)}Schema);`;
  }

  generateMiddleware(endpointName) {
    return `// ${endpointName}Middleware.js
const validate${this.pascalCase(endpointName)} = (req, res, next) => {
  // Add validation logic based on original GAS function parameters
  console.log('Validating ${endpointName} request');
  next();
};

const log${this.pascalCase(endpointName)} = (req, res, next) => {
  console.log(\`${endpointName} called at \${new Date().toISOString()}\`);
  next();
};

module.exports = {
  validate${this.pascalCase(endpointName)},
  log${this.pascalCase(endpointName)},
};`;
  }

  extractDependencies(code) {
    const dependencies = new Set();

    // Detect common dependencies
    if (code.includes("mongoose") || code.includes("Schema")) {
      dependencies.add("mongoose");
    }
    if (code.includes("axios")) {
      dependencies.add("axios");
    }
    if (code.includes("redis")) {
      dependencies.add("redis");
    }
    if (code.includes("fs.")) {
      dependencies.add("fs");
    }
    if (code.includes("process.env")) {
      dependencies.add("dotenv");
    }

    return Array.from(dependencies);
  }

  // Utility functions
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  camelCase(text) {
    return text
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/^./, (c) => c.toLowerCase());
  }

  pascalCase(text) {
    return this.camelCase(text).replace(/^./, (c) => c.toUpperCase());
  }
}

export default GuapoConverter;

