import GuapoConverter from "./GuapoConverter.js";
import GenioConverter from "./GenioConverter.js";
import CHIEWConverter from "./CHIEWConverter.js";
import FINALConverter from "./FINALConverter.js";

class ConverterEngine {
  constructor() {
    this.converters = {
      guapo: new GuapoConverter(),
      genio: new GenioConverter(),
      chiew: new CHIEWConverter(),
    };
  }

  /**
   * Analyze GAS code for conversion
   */
  analyzeGAS(gasCode) {
    return {
      html: this.extractHtml(gasCode),
      functions: this.extractFunctions(gasCode),
      projectName: "GAS Project",
      scriptId: "SCRIPT_ID",
      deploymentId: "DEPLOYMENT_ID",
    };
  }

  /**
   * Extract HTML from GAS code
   */
  extractHtml(gasCode) {
    // Simple HTML extraction
    const htmlMatch = gasCode.match(/HtmlService\.createHtmlOutput\(([\s\S]*?)\)/);
    if (htmlMatch) {
      return htmlMatch[1].replace(/['"]/g, "");
    }
    
    // Check for template files
    const templateMatch = gasCode.match(/template\.evaluate\(\)/);
    if (templateMatch) {
      return "<div>GAS Template Content</div>";
    }
    
    return "<div><h1>GAS App</h1><p>Converted to Mobile</p></div>";
  }

  /**
   * Extract functions from GAS code
   */
  extractFunctions(gasCode) {
    const functionRegex = /function\s+(\w+)\s*\(/g;
    const functions = [];
    let match;
    
    while ((match = functionRegex.exec(gasCode)) !== null) {
      functions.push(match[1]);
    }
    
    return functions;
  }
  
  async convert(gasProject, _options = {}) {
    const { frameworks = ["guapo", "genio", "chiew"] } = _options;
    const results = {};
    
    console.log("ðŸš€ Starting conversion engine...");
    
    // Convert based on selected frameworks
    for (const framework of frameworks) {
      if (this.converters[framework]) {
        console.log(`\nðŸ”„ Converting with ${this.converters[framework].name}...`);
        results[framework] = await this.convertWithFramework(framework, gasProject, _options);
      }
    }
    
    return results;
  }
  
  async convertWithFramework(framework, gasProject, _options) {
    const converter = this.converters[framework];
    const conversions = [];
    
    switch (framework) {
      case "guapo":
        // Convert API endpoints
        if (gasProject.apiEndpoints && gasProject.apiEndpoints.length > 0) {
          for (const endpoint of gasProject.apiEndpoints) {
            const conversion = await converter.convert(endpoint, gasProject);
            conversions.push(conversion);
          }
        }
        break;
        
      case "genio":
        // Convert triggers
        if (gasProject.triggers && gasProject.triggers.length > 0) {
          for (const trigger of gasProject.triggers) {
            const conversion = await converter.convert(trigger, gasProject);
            conversions.push(conversion);
          }
        }
        break;
        
      case "chiew":
        // Convert HTML files
        if (gasProject.htmlFiles && gasProject.htmlFiles.length > 0) {
          for (const htmlFile of gasProject.htmlFiles) {
            const conversion = await converter.convert(htmlFile.content, htmlFile.name, gasProject);
            if (conversion) {
              conversions.push(conversion);
            }
          }
        }
        break;
    }
    
    return {
      framework: converter.name,
      description: converter.description,
      conversions,
      summary: {
        totalConversions: conversions.length,
        filesGenerated: this.countGeneratedFiles(conversions),
      }
    };
  }
  
  countGeneratedFiles(conversions) {
    let count = 0;
    
    for (const conversion of conversions) {
      if (conversion.files) {
        count += Object.keys(conversion.files).length;
      }
    }
    
    return count;
  }

  getConverter(framework) {
    return this.converters[framework];
  }
  
  listConverters() {
    return Object.entries(this.converters).map(([key, converter]) => ({
      key,
      name: converter.name,
      description: converter.description,
    }));
  }
}

export default ConverterEngine;

