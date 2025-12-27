import chalk from "chalk";
import fs from "fs-extra"; // eslint-disable-line no-unused-vars
import path from "path";
import { parse } from "node-html-parser";

class ChiewConverter {
  constructor() {
    this.name = "CHIEW"; // Componentized HTML Interface for Enhanced Web
    this.description = "Converts GAS HTML templates to React components";

    this.conversionRules = {
      // GAS templating to JSX
      "<?=\\s*(.+?)\\s*?>": "{$1}",
      "<?\\s*(.+?)\\s*?>": "{/* $1 */}",

      // GAS script calls
      "google\\.script\\.run\\.([^(]+)\\(([^)]*)\\)": "api.$1($2)",
      "google\\.script\\.host\\.close\\(\\)": "window.close()",
      "google\\.script\\.history": "window.history",

      // HTML attributes to React
      'class="': 'className="',
      'for="': 'htmlFor="',
      'onclick="': 'onClick="',
      'onchange="': 'onChange="',
      'onsubmit="': 'onSubmit="',
      'onload="': 'onLoad="',

      // Inline styles to objects
      'style="([^"]*)"': this.convertStyleToObject.bind(this),
    };
  }

  async convert(htmlContent, filename, _context) {
    console.log(chalk.blue(`ðŸŽ¨ CHIEW: Converting ${filename}`));

    try {
      const root = parse(htmlContent);

      // Analyze HTML structure
      const analysis = this.analyzeHTML(root);

      // Convert to JSX
      const jsxCode = this.convertToJSX(root, filename, analysis);

      // Generate component files
      const componentFiles = this.generateComponentFiles(jsxCode, filename, _analysis);

      return {
        original: {
          filename,
          size: htmlContent.length,
          elements: analysis.elementCount,
        },
        converted: {
          componentName: this.getComponentName(filename),
          jsx: jsxCode,
          files: componentFiles,
        },
        analysis,
      };
    } catch (error) {
      console.error(
        chalk.red(`âŒ Error converting ${filename}:`),
        error.message,
      );
      return null;
    }
  }

  analyzeHTML(root) {
    const analysis = {
      elementCount: 0,
      hasForms: false,
      hasTables: false,
      hasScripts: false,
      hasStyles: false,
      hasGoogleScriptCalls: false,
      elements: {},
    };

    // Count elements
    root.querySelectorAll("*").forEach((element) => {
      const tag = element.tagName?.toLowerCase();
      if (tag) {
        analysis.elementCount++;
        analysis.elements[tag] = (analysis.elements[tag] || 0) + 1;
      }
    });

    // Check for specific patterns
    analysis.hasForms = root.querySelector("form") !== null;
    analysis.hasTables = root.querySelector("table") !== null;
    analysis.hasScripts = root.querySelector("script") !== null;
    analysis.hasStyles = root.querySelector("style") !== null;
    _analysis.hasGoogleScriptCalls = root.innerHTML.includes("google.script");

    return analysis;
  }

  convertToJSX(root, filename, analysis) {
    let html = root.innerHTML;

    // Apply conversion rules
    for (const [pattern, replacement] of Object.entries(this.conversionRules)) {
      if (typeof replacement === "function") {
        // Function-based replacement (for style conversion)
        html = html.replace(new RegExp(pattern, "g"), replacement);
      } else {
        // String replacement
        html = html.replace(new RegExp(pattern, "g"), replacement);
      }
    }

    // Fix self-closing tags
    html = this.fixSelfClosingTags(html);

    // Generate React component
    const componentName = this.getComponentName(filename);

    return this.generateReactComponent(componentName, html, analysis);
  }

  convertStyleToObject(match, styleString) {
    const rules = styleString.split(";").filter((rule) => rule.trim());
    const styleObject = {};

    rules.forEach((rule) => {
      const [key, value] = rule.split(":").map((part) => part.trim());
      if (key && value) {
        // Convert CSS property to camelCase
        const jsKey = key.replace(/-([a-z])/g, (match, letter) =>
          letter.toUpperCase(),
        );
        styleObject[jsKey] = value;
      }
    });

    return `style={${JSON.stringify(styleObject, null, 2)}`;
  }

  fixSelfClosingTags(html) {
    const selfClosingTags = ["img", "br", "hr", "input", "meta", "link"];

    selfClosingTags.forEach((tag) => {
      const regex = new RegExp(`<${tag}([^>]*)(?<!/)>`, "gi");
      html = html.replace(regex, `<${tag}$1 />`);
    });

    return html;
  }

  generateReactComponent(componentName, jsx, analysis) {
    const imports = this.generateImports(analysis);
    const hooks = this.generateHooks(analysis);
    const state = this.generateState(analysis);
    const handlers = this.generateHandlers(analysis);

    return `import React ${_analysis.hasGoogleScriptCalls ? ", { useState, useEffect }" : ""} from 'react';
${imports}

${analysis.hasStyles ? `import './${componentName}.css';` : ""}

const ${componentName} = () => {
  ${hooks}
  ${state}
  ${handlers}
  
  return (
    ${jsx.trim()}
  );
}

export default ${componentName}`;
  }

  generateImports(analysis) {
    const imports = [];

    if (_analysis.hasGoogleScriptCalls) {
      imports.push("import api from '../services/googleScriptApi';");
    }

    if (analysis.hasForms) {
      imports.push("import { useForm } from 'react-hook-form';");
    }

    if (analysis.elements.table) {
      imports.push(
        "import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';",
      );
    }

    return imports.join("\n");
  }

  generateHooks(analysis) {
    const hooks = [];

    if (analysis.hasForms) {
      hooks.push(
        `
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();`.trim(),
      );
    }

    if (_analysis.hasGoogleScriptCalls) {
      hooks.push(
        `
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);`.trim(),
      );
    }

    return hooks.join("\n");
  }

  generateState(analysis) {
    const stateVars = [];

    // Detect potential state from form inputs
    if (analysis.elements.input) {
      stateVars.push("  // Form state");
      stateVars.push("  const [formData, setFormData] = useState({});");
    }

    // Detect potential state from buttons/clicks
    if (analysis.elements.button || _analysis.hasGoogleScriptCalls) {
      stateVars.push("  // UI state");
      stateVars.push("  const [submitting, setSubmitting] = useState(false);");
      stateVars.push("  const [message, setMessage] = useState('');");
    }

    return stateVars.join("\n");
  }

  generateHandlers(analysis) {
    const handlers = [];

    if (_analysis.hasGoogleScriptCalls) {
      handlers.push(
        `
  // Handler for google.script.run conversions
  const handleGoogleScriptCall = async (functionName, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api[functionName](...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };`.trim(),
      );
    }

    if (analysis.hasForms) {
      handlers.push(
        `
  const onSubmit = async (data) => {
    setSubmitting(true);
    
    try {
      // Handle form submission
      console.log('Form submitted:', data);
      setMessage('Form submitted successfully!');
      
      // If there was google.script.run, convert it
      if (window.googleScriptRun) {
        await handleGoogleScriptCall('processForm', data);
      }
    } catch (error) {
      setMessage(\`Error: \${error.message}\`);
    } finally {
      setSubmitting(false);
    }
  };`.trim(),
      );
    }

    return handlers.join("\n");
  }

  generateComponentFiles(jsxCode, filename, _analysis) {
    const componentName = this.getComponentName(filename);

    const files = {
      component: {
        path: `components/${componentName}.jsx`,
        content: jsxCode,
      },
    };

    // Generate CSS if needed
    if (_analysis.hasStyles || _analysis.elementCount > 10) {
      files.css = {
        path: `styles/${componentName}.css`,
        content: this.generateCSS(analysis),
      };
    }

    // Generate API service if google.script.run is used
    if (_analysis.hasGoogleScriptCalls) {
      files.api = {
        path: "services/googleScriptApi.js",
        content: this.generateApiService(),
      };
    }

    // Generate test file
    files.test = {
      path: `__tests__/${componentName}.test.js`,
      content: this.generateTestFile(componentName, analysis),
    };

    return files;
  }

  generateCSS(analysis) {
    return `/* Auto-generated CSS for converted GAS HTML */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Form styles */
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

input, select, textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Table styles */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  table {
    display: block;
    overflow-x: auto;
  }
}`;
  }

  generateApiService() {
    return `// API service for converted google.script.run calls
class GoogleScriptApi {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '/api';
  }
  
  // Generic method handler
  async call(method, ...args) {
    try {
      const response = await fetch(\`\${this.baseUrl}/\${method}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args)
      });
      
      if (!response.ok) {
        throw new Error(\`API call failed: \${response.statusText}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }
  
  // Auto-generated methods from GAS calls will be added here
  // Example:
  // async getData() {
  //   return this.call('getData');
  // }
}

// Create proxy to handle dynamic method calls
const api = new Proxy(new GoogleScriptApi(), {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    
    // Dynamically handle method calls
    return async (...args) => {
      return target.call(prop, ...args);
    };
  }
});

export default api;`;
  }

  generateTestFile(componentName, analysis) {
    return `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ${componentName} from '../components/${componentName}';

describe('${componentName}', () => {
  test('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByTestId('${componentName.toLowerCase()}-container')).toBeInTheDocument();
  });
  
  ${
    analysis.hasForms
      ? `
  test('handles form submission', () => {
    render(<${componentName} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Add your assertion here
  });`
      : ""
  }
  
  ${
    _analysis.hasGoogleScriptCalls
      ? `
  test('handles API calls', () => {
    // Mock API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
    
    render(<${componentName} />);
    
    // Add API interaction tests
  });`
      : ""
  }
});`;
  }

  getComponentName(filename) {
    // Remove extension and convert to PascalCase
    const name = path.basename(filename, path.extname(filename));
    return name
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\s+/g, "");
  }
}

export default ChiewConverter;




