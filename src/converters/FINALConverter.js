import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * FINAL Converter - Converts GAS code to React Native/Expo
 * (FINAL = Fully Integrated Native App Layer)
 */
export default class FINALConverter {
  constructor() {
    this.componentMap = {
      // Basic elements
      div: "View",
      span: "Text",
      p: "Text",
      h1: "Text",
      h2: "Text",
      h3: "Text",
      button: "TouchableOpacity",
      input: "TextInput",
      textarea: "TextInput",
      select: "Picker",
      img: "Image",
      a: "TouchableOpacity",
      form: "View",
      ul: "ScrollView",
      li: "View",
      label: "Text",

      // Layout elements
      section: "View",
      header: "View",
      footer: "View",
      nav: "View",
      article: "View",
      main: "View",
      aside: "View",
    };

    this.eventMap = {
      onclick: "onPress",
      onchange: "onChangeText",
      onsubmit: "onSubmit",
      onfocus: "onFocus",
      onblur: "onBlur",
      onkeypress: "onKeyPress",
      onkeyup: "onKeyPress",
      onkeydown: "onKeyPress",
      onload: "useEffect",
    };

    this.styleMap = {
      display: "",
      "flex-direction": "flexDirection",
      "justify-content": "justifyContent",
      "align-items": "alignItems",
      flex: "flex",
      width: "width",
      height: "height",
      margin: "margin",
      padding: "padding",
      "background-color": "backgroundColor",
      color: "color",
      "font-size": "fontSize",
      "font-weight": "fontWeight",
      border: "borderWidth",
      "border-radius": "borderRadius",
      position: "position",
      top: "top",
      left: "left",
      right: "right",
      bottom: "bottom",
    };
  }

  /**
   * Convert HTML to React Native JSX
   */
  convertHtmlToReactNative(html, _componentName = "App") {
    console.log(
      chalk.blue(`ðŸ“± Converting HTML to React Native: `),
    );

    // Step 1: Parse and convert HTML tags
    let reactNativeCode = this.convertHtmlTags(html);

    // Step 2: Convert inline styles to StyleSheet
    const styles = this.extractStyles(html);

    // Step 3: Generate imports based on used components
    const imports = this.generateImports(reactNativeCode);

    // Step 4: Convert event handlers
    reactNativeCode = this.convertEventHandlers(reactNativeCode);

    // Step 5: Create the complete component
    const fullCode = `${imports}

export default function ${componentName}() {
  ${this.generateGASApiHooks(componentName)}
  return (
    ${reactNativeCode}
  );
}

${this.generateStylesheet(styles, _componentName)}
${this.generateHelperFunctions()}`;

    return fullCode;
  }

  /**
   * Convert HTML tags to React Native components
   */
  convertHtmlTags(html) {
    let result = html;

    // Convert all HTML tags
    for (const [htmlTag, rnTag] of Object.entries(this.componentMap)) {
      const regexOpen = new RegExp(`<${htmlTag}(\\s|>)`, "gi");
      const regexClose = new RegExp(`</${htmlTag}>`, "gi");

      result = result.replace(regexOpen, `<${rnTag}$1`);
      result = result.replace(regexClose, `</${rnTag}>`);
    }

    // Handle void elements
    result = result.replace(/<img([^>]*)\/?>/gi, "<Image$1 />");
    result = result.replace(/<input([^>]*)\/?>/gi, "<TextInput$1 />");
    result = result.replace(/<br\s*\/?>/gi, "{`\n`}");

    // Convert class and for attributes
    result = result.replace(/class=/gi, "style=");
    result = result.replace(/className=/gi, "style=");
    result = result.replace(/for=/gi, "htmlFor=");

    // Convert href to onPress with Linking
    result = result.replace(
      /href="([^"]*)"/gi,
      'onPress={() => Linking.openURL("$1")}',
    );

    return result;
  }

  /**
   * Convert event handlers to React Native events
   */
  convertEventHandlers(code) {
    let result = code;

    for (const [htmlEvent, rnEvent] of Object.entries(this.eventMap)) {
      const regex = new RegExp(`${htmlEvent}="([^"]*)"`, "gi");
      result = result.replace(regex, `${rnEvent}={\$1}`);
    }

    // Special handling for onClick with Google Apps Script functions
    result = result.replace(/onPress={([^}]*)}/g, (match, p1) => {
      if (p1.includes("google.script")) {
        return `onPress={() => handleGASFunction('${p1.replace(/['"]/g, "")}')}`;
      }
      return match;
    });

    return result;
  }

  /**
   * Extract CSS styles from HTML
   */
  extractStyles(html) {
    const styles = {};

    // Extract inline styles
    const styleRegex = /style="([^"]*)"/gi;
    let match;
    let styleId = 0;

    while ((match = styleRegex.exec(html)) !== null) {
      const styleString = match[1];
      const styleObject = this.cssToReactNative(styleString);
      styles[`style${styleId++}`] = styleObject;
    }

    // Extract class-based styles (simplified)
    const classRegex = /class="([^"]*)"/gi;
    while ((match = classRegex.exec(html)) !== null) {
      const className = match[1];
      styles[className.replace(/\s+/g, "_")] = this.cssToReactNative(
        this.getClassStyles(className),
      );
    }

    return styles;
  }

  /**
   * Convert CSS to React Native StyleSheet format
   */
  cssToReactNative(cssString) {
    const styles = {};
    const rules = cssString.split(";").filter((rule) => rule.trim());

    rules.forEach((rule) => {
      const [property, value] = rule.split(":").map((s) => s.trim());
      if (property && value) {
        const rnProperty = this.styleMap[property] || property;
        let rnValue = value;

        // Convert CSS values
        if (property.includes("color")) {
          rnValue = this.convertColor(value);
        } else if (property.includes("font-size")) {
          rnValue = this.convertFontSize(value);
        } else if (property.includes("border")) {
          rnValue = this.convertBorder(value);
        }

        styles[rnProperty] = rnValue;
      }
    });

    return styles;
  }

  /**
   * Generate imports based on used components
   */
  generateImports(code) {
    const imports = new Set();
    imports.add("import React from 'react';");
    imports.add("import { StyleSheet } from 'react-native';");

    // Check which React Native components are used
    for (const rnTag of Object.values(this.componentMap)) {
      if (code.includes(`<${rnTag}`)) {
        imports.add(`import { ${rnTag} from 'react-native';`);
      }
    }

    // Add additional imports based on features
    if (code.includes("Linking.openURL")) {
      imports.add("import { Linking } from 'react-native';");
    }

    if (code.includes("TextInput")) {
      imports.add("import { TextInput } from 'react-native';");
    }

    if (code.includes("Image")) {
      imports.add("import { Image } from 'react-native';");
    }

    if (code.includes("Picker")) {
      imports.add("import { Picker } from '@react-native-picker/picker';");
    }

    // Add API integration imports
    imports.add("import { useEffect, useState } from 'react';");
    imports.add("import axios from 'axios';");

    return Array.from(imports).join("\n");
  }

  /**
   * Generate StyleSheet object
   */
  generateStylesheet(styles, _componentName) {
    if (Object.keys(styles).length === 0) {
      return `const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});`;
    }

    let stylesheet = "const styles = StyleSheet.create({\n";

    for (const [name, styleObj] of Object.entries(styles)) {
      stylesheet += `  ${name}: {\n`;
      for (const [prop, value] of Object.entries(styleObj)) {
        stylesheet += `    ${prop}: ${JSON.stringify(value)},\n`;
      }
      stylesheet += "  },\n";
    }

    // Add default styles
    stylesheet += `  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
});`;

    return stylesheet;
  }

  /**
   * Generate GAS API integration hooks
   */
  generateGASApiHooks(componentName) {
    return `  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Replace with your actual API endpoint
  const API_URL = 'http://localhost:3000/api';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(\`\${API_URL}/initial\`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGASFunction = async (functionName, params = {}) => {
    try {
      setLoading(true);
      const response = await axios.post(\`\${API_URL}/gas-function\`, {
        function: functionName,
        parameters: params,
      });
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };`;
  }

  /**
   * Generate helper functions
   */
  generateHelperFunctions() {
    return `// Helper function to convert hex colors to React Native format
const convertColor = (color) => {
  if (color.startsWith('#')) return color;
  if (color.startsWith('rgb')) return color;
  return '#' + color;
};

// Helper function to convert font sizes
const convertFontSize = (size) => {
  if (size.includes('px')) return parseInt(size);
  if (size.includes('em')) return parseInt(size) * 16;
  return parseInt(size) || 16;
};

// Helper function to convert borders
const convertBorder = (border) => {
  const parts = border.split(' ');
  if (parts.length >= 3) {
    return {
      borderWidth: parseInt(parts[0]) || 1,
      borderColor: parts[2] || '#000',
      borderRadius: parts[1] || 0,
    };
  }
  return { borderWidth: 1, borderColor: '#000' };
};`;
  }

  /**
   * Get styles for a CSS class (simplified - would need CSS parser in production)
   */
  getClassStyles(className) {
    // This is a simplified version. In production, you'd parse CSS files.
    const commonStyles = {
      container: "padding: 20px;",
      button: "background-color: #007AFF; color: white; padding: 10px 20px; border-radius: 5px;",
      input: "border: 1px solid #ccc; padding: 10px; border-radius: 5px;",
      card: "border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 10px;",
      "text-center": "text-align: center;",
      flex: "display: flex;",
    };

    return commonStyles[className] || "";
  }

  /**
   * Convert a full GAS web app to Expo project structure
   */
  async convertFullProject(_gasAnalysis, outputDir) {
    console.log(chalk.cyan("ðŸ“± Creating Expo project structure..."));

    const projectStructure = {
      // Core files
      "App.js": this.convertHtmlToReactNative(
        _gasAnalysis.html || "<View><Text>Welcome to Expo App</Text></View>",
        "App",
      ),

      // Screens
      "screens/HomeScreen.js": this.convertHtmlToReactNative(
        _gasAnalysis.mainHtml || "<View><Text>Home Screen</Text></View>",
        "HomeScreen",
      ),
      "screens/DetailsScreen.js": this.generateDetailsScreen(),

      // Components
      "components/GASButton.js": this.generateGASButtonComponent(),
      "components/GASInput.js": this.generateGASInputComponent(),
      "components/GASCARD.js": this.generateGASCARDComponent(),

      // Services
      "services/api.js": this.generateApiService(_gasAnalysis),
      "services/auth.js": this.generateAuthService(),

      // Navigation
      "navigation/AppNavigator.js": this.generateNavigation(gasAnalysis),

      // Utils
      "utils/gasHelpers.js": this.generateGasHelpers(gasAnalysis),
      "utils/styles.js": this.generateCommonStyles(),

      // Config
      "config/constants.js": this.generateConstants(gasAnalysis),

      // Assets placeholder
      "assets/README.md":
        "# Place your images, fonts, and other assets here\n\n- Images should be optimized for mobile\n- Use @2x and @3x versions for different screen densities\n- Convert SVG to React Native compatible format if needed",
    };

    // Create all files
    for (const [filePath, content] of Object.entries(projectStructure)) {
      const fullPath = path.join(outputDir, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, "utf8");
      console.log(chalk.gray(`  Created: ${filePath}`));
    }

    return projectStructure;
  }

  /**
   * Generate screen templates
   */
  generateDetailsScreen() {
    return `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DetailsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Text style={styles.description}>
        This screen was automatically generated from your GAS project.
        Edit this file to add your specific details.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
});`;
  }

  generateGASButtonComponent() {
    return `import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function GASButton({ 
  title,
  onPress,
  loading = false,
  disabled = false,
  style = {},
  textStyle = {},
  type = 'primary'
}) {
  const buttonStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    danger: styles.dangerButton,
  }[type] || styles.primaryButton;

  const textStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    danger: styles.dangerText,
  }[type] || styles.primaryText;

  return (
    <TouchableOpacity
      style={[buttonStyles, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[textStyles, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});`;
  }

  generateApiService(_gasAnalysis) {
    return `import axios from 'axios';

// Base API configuration
const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// GAS function calls
export const gasService = {
  // Call a GAS function by name
  callFunction: async (functionName, parameters = {}) => {
    try {
      const response = await API.post('/gas-function', {
        function: functionName,
        parameters,
      });
      return response.data;
    } catch (error) {
      console.error('GAS function call failed:', error);
      throw error;
    }
  },

  // Get data from Google Sheets
  getSheetData: async (sheetId, range = 'A1:Z1000') => {
    try {
      const response = await API.get('/sheets', {
        params: { sheetId, range },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sheet data:', error);
      throw error;
    }
  },

  // Submit form data
  submitForm: async (formData) => {
    try {
      const response = await API.post('/submit', formData);
      return response.data;
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error;
    }
  },
};

// Mock data for demo/offline mode
export const mockService = {
  callFunction: async (functionName, parameters) => {
    console.log('Mock GAS function call:', functionName, parameters);
    return { success: true, data: { message: 'Mock response' } };
  },
  
  getSheetData: async () => {
    return { 
      success: true,
      data: [
        ['Name', 'Email', 'Date'],
        ['John Doe', 'john@example.com', '2024-01-01'],
        ['Jane Smith', 'jane@example.com', '2024-01-02'],
      ]
    };
  },
};

export default API;`;
  }

  generateNavigation(gasAnalysis) {
    return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen} 
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen} 
          options={{ title: 'Details' }}
        />
        {/* Add more screens based on your GAS project structure */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}`;
  }

  generateConstants(gasAnalysis) {
    return `// App Constants
export const APP_NAME = '${_gasAnalysis.projectName || "GAS Migrated App"}';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Google Apps Script Constants
export const GAS_CONSTANTS = {
  SCRIPT_ID: '${_gasAnalysis.scriptId || "YOUR_SCRIPT_ID"}',
  DEPLOYMENT_ID: '${_gasAnalysis.deploymentId || "YOUR_DEPLOYMENT_ID"}',
  API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '',
};

// Styling Constants
export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  SUCCESS: '#34C759',
  DANGER: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#5AC8FA',
  LIGHT: '#F2F2F7',
  DARK: '#1C1C1E',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#8E8E93',
};

export const SIZES = {
  BASE: 8,
  SMALL: 12,
  MEDIUM: 16,
  LARGE: 20,
  XLARGE: 24,
  XXLARGE: 32,
};

export const FONTS = {
  REGULAR: 'System',
  BOLD: 'System',
  ITALIC: 'System',
};

// Feature Flags
export const FEATURES = {
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: false,
  DARK_MODE: true,
  BIOMETRIC_AUTH: false,
};`;
  }

  // Helper conversion methods
  convertColor(color) {
    if (color.startsWith("#")) return color;
    if (color.startsWith("rgb")) {
      // Convert rgb() to hex
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const [r, g, b] = match.slice(1);
        return `#${Number(r).toString(16).padStart(2, "0")}${Number(g).toString(16).padStart(2, "0")}${Number(b).toString(16).padStart(2, "0")}`;
      }
    }
    return color;
  }

  convertFontSize(size) {
    if (typeof size === "number") return size;
    if (size.includes("px")) return parseInt(size);
    if (size.includes("em")) return parseInt(size) * 16;
    if (size.includes("rem")) return parseInt(size) * 16;
    return 16;
  }

  convertBorder(border) {
    const parts = border.split(" ");
    return {
      borderWidth: parts[0] ? parseInt(parts[0]) || 1 : 1,
      borderColor: parts[2] || "#000000",
      borderRadius: parts[1] ? parseInt(parts[1]) || 0 : 0,
    };
  }
}

