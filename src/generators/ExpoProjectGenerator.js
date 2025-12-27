import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Expo Project Generator - Creates React Native/Expo projects
 */
export default class ExpoProjectGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, "..", "..", "templates", "expo");
  }

  /**
   * Generate a complete Expo project
   */
  async generateExpoProject(projectName, options = {}) {
    const {
      outputDir = "./",
      apiUrl = "http://localhost:3000",
      __includeWeb = true,
      platforms = ["ios", "android", "web"],
      features = ["api", "navigation", "offline"],
    } = options;
    
    console.log(chalk.cyan(`ðŸ“± Generating Expo project: ${projectName}`));
    
    const projectPath = path.join(outputDir, projectName);
    
    try {
      // Create project structure
      await this.createProjectStructure(projectPath);
      
      // Generate core Expo files
      await this.generateExpoFiles(projectPath, projectName, options);
      
      // Generate package.json
      await this.generatePackageJson(projectPath, projectName, features);
      
      // Generate configuration files
      await this.generateConfigFiles(projectPath, projectName, apiUrl, platforms);
      
      // Generate demo screens and components
      await this.generateDemoCode(projectPath, projectName);
      
      // Generate documentation
      await this.generateDocumentation(projectPath, projectName, options);
      
      console.log(chalk.green(`âœ… Expo project generated at: ${projectPath}`));
      
      return {
        success: true,
        path: projectPath,
        type: "expo",
        platforms,
        features,
      };
      
    } catch (error) {
      console.error(chalk.red("âŒ Error generating Expo project:"), error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create Expo project structure
   */
  async createProjectStructure(projectPath) {
    console.log(chalk.blue("ðŸ“ Creating Expo project structure..."));
    
    const dirs = [
      // Root
      "",
      
      // Expo app structure
      "app",
      "app/(tabs)",
      "app/(auth)",
      "app/_layout",
      
      // Screens
      "screens",
      "screens/auth",
      "screens/main",
      "screens/settings",
      
      // Components
      "components",
      "components/common",
      "components/forms",
      "components/layout",
      "components/navigation",
      
      // Services
      "services",
      "services/api",
      "services/storage",
      "services/auth",
      
      // Utils
      "utils",
      "utils/helpers",
      "utils/validators",
      "utils/formatters",
      
      // Navigation
      "navigation",
      "navigation/stacks",
      "navigation/tabs",
      "navigation/drawer",
      
      // Hooks
      "hooks",
      "hooks/api",
      "hooks/state",
      "hooks/ui",
      
      // Context
      "context",
      "context/auth",
      "context/theme",
      "context/data",
      
      // Constants
      "constants",
      
      // Types
      "types",
      
      // Assets
      "assets",
      "assets/images",
      "assets/fonts",
      "assets/icons",
      "assets/animations",
      
      // Tests
      "__tests__",
      "__tests__/components",
      "__tests__/screens",
      "__tests__/utils",
      
      // Config
      "config",
      
      // Docs
      "docs",
    ];
    
    // Create all directories
    for (const dir of dirs) {
      const fullPath = path.join(projectPath, dir);
      await fs.ensureDir(fullPath);
    }
    
    // Create .gitkeep files in empty directories
    for (const dir of dirs.filter(d => d.includes("/"))) {
      const gitkeepPath = path.join(projectPath, dir, ".gitkeep");
      await fs.writeFile(gitkeepPath, "");
    }
    
    console.log(chalk.green(`  Created ${dirs.length} directories`));
  }

  /**
   * Generate core Expo files
   */
  async generateExpoFiles(projectPath, projectName, options) {
    console.log(chalk.blue("ðŸ“„ Generating core Expo files..."));
    
    // app.json (Expo configuration)
    const appJson = {
      expo: {
        name: projectName,
        slug: projectName.toLowerCase().replace(/\s+/g, "-"),
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
          image: "./assets/splash.png",
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
        assetBundlePatterns: ["**/*"],
        ios: {
          supportsTablet: true,
          bundleIdentifier: `com.yourcompany.${projectName.toLowerCase().replace(/\s+/g, "")}`
        },
        android: {
          adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff",
          },
          package: `com.yourcompany.${projectName.toLowerCase().replace(/\s+/g, "")}`,
        },
        web: {
          favicon: "./assets/favicon.png",
        },
        extra: {
          apiUrl: options.apiUrl || "http://localhost:3000",
          eas: {
            projectId: this.generateProjectId(_platforms),
          }
        }
      }
    };
    
    await fs.writeJson(path.join(projectPath, "app.json"), appJson, { spaces: 2 });
    
    // app/_layout.js (Root layout)
    const appLayout = `import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ title: 'Welcome' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}`;
    
    await fs.writeFile(path.join(projectPath, "app/_layout.js"), appLayout, "utf8");
    
    // app/index.js (Entry point)
    const appIndex = `import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}`;
    
    await fs.writeFile(path.join(projectPath, "app/index.js"), appIndex, "utf8");
    
    // app/(tabs)/_layout.js (Tab navigation)
    const tabsLayout = `import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}`;
    
    await fs.writeFile(path.join(projectPath, "app/(tabs)/_layout.js"), tabsLayout, "utf8");
    
    // Tab screens
    const homeScreen = `import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to ${projectName}</Text>
          <Text style={styles.subtitle}>Your GAS app, now on mobile!</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Features</Text>
          <Text style={styles.cardText}>â€¢ Real-time data sync</Text>
          <Text style={styles.cardText}>â€¢ Offline support</Text>
          <Text style={styles.cardText}>â€¢ Native performance</Text>
          <Text style={styles.cardText}>â€¢ Cross-platform (iOS, Android, Web)</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Getting Started</Text>
          <Text style={styles.cardText}>1. Connect to your backend API</Text>
          <Text style={styles.cardText}>2. Customize the UI in /screens</Text>
          <Text style={styles.cardText}>3. Add your business logic</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});`;
    
    await fs.writeFile(path.join(projectPath, "app/(tabs)/home.js"), homeScreen, "utf8");
    
    console.log(chalk.green("  âœ… Core Expo files created"));
  }

  /**
   * Generate package.json for Expo project
   */
  async generatePackageJson(projectPath, projectName, features) {
    console.log(chalk.blue("ðŸ“¦ Generating package.json..."));
    
    const dependencies = {
      // React & Expo core
      "expo": "~51.0.0",
      "expo-status-bar": "~1.12.1",
      "expo-router": "~3.5.0",
      "expo-linking": "~6.3.0",
      "expo-constants": "~16.0.0",
      "expo-splash-screen": "~0.27.0",
      "expo-updates": "~0.25.0",
      
      // React Navigation
      "react-native-safe-area-context": "4.10.3",
      "react-native-screens": "~3.31.1",
      
      // UI Components
      "react-native": "0.74.3",
      "react": "18.2.0",
      
      // Common libraries
      "axios": "^1.6.0",
      "react-native-async-storage/async-storage": "1.21.0",
      "react-native-vector-icons": "^10.0.0",
    };
    
    const devDependencies = {
      "@babel/core": "^7.20.0",
    };
    
    // Add feature-specific dependencies
    if (features.includes("offline")) {
      dependencies["@react-native-async-storage/async-storage"] = "1.21.0";
      dependencies["redux-persist"] = "^6.0.0";
    }
    
    if (features.includes("navigation")) {
      dependencies["@react-navigation/native"] = "^6.0.0";
      dependencies["@react-navigation/native-stack"] = "^6.0.0";
      dependencies["@react-navigation/bottom-tabs"] = "^6.0.0";
    }
    
    if (features.includes("forms")) {
      dependencies["react-hook-form"] = "^7.0.0";
      dependencies["yup"] = "^1.0.0";
    }
    
    if (features.includes("state")) {
      dependencies["redux"] = "^4.0.0";
      dependencies["react-redux"] = "^8.0.0";
    }
    
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      main: "expo-router/entry",
      private: true,
      scripts: {
        "start": "expo start",
        "android": "expo start --android",
        "ios": "expo start --ios",
        "web": "expo start --web",
        "build:ios": "eas build --platform ios",
        "build:android": "eas build --platform android",
        "build:web": "expo export:web",
        "test": "jest",
        "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
        "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json}\""
      },
      dependencies,
      devDependencies,
    };
    
    await fs.writeJson(
      path.join(projectPath, "package.json"),
      packageJson,
      { spaces: 2 }
    );
    
    console.log(chalk.green("  âœ… package.json created"));
  }

  /**
   * Generate configuration files
   */
  async generateConfigFiles(projectPath, projectName, apiUrl, platforms) {
    console.log(chalk.blue("âš™ï¸ Generating configuration files..."));
    
    // .env file
    const envContent = `# Expo Environment Configuration
EXPO_PUBLIC_API_URL=${apiUrl}
EXPO_PUBLIC_APP_NAME="${projectName}"
EXPO_PUBLIC_APP_VERSION="1.0.0"

# Google APIs (for GAS integration)
EXPO_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Feature Flags
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
EXPO_PUBLIC_ENABLE_ANALYTICS=true

# App Configuration
EXPO_PUBLIC_PRIMARY_COLOR="#007AFF"
EXPO_PUBLIC_SECONDARY_COLOR="#5856D6"

# Development
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG=true`;
    
    await fs.writeFile(path.join(projectPath, ".env.example"), envContent);
    
    // babel.config.js
    const babelConfig = `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      'react-native-reanimated/plugin',
    ],
  };
}`;
    
    await fs.writeFile(path.join(projectPath, "babel.config.js"), babelConfig);
    
    // metro.config.js
    const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  // Adds support for \`.db\` files for SQLite databases
  'db'
);

module.exports = config;`;
    
    await fs.writeFile(path.join(projectPath, "metro.config.js"), metroConfig);
    
    // eas.json (Expo Application Services)
    const easJson = {
      cli: {
        version: ">= 6.0.0",
      },
      build: {
        development: {
          developmentClient: true,
          distribution: "internal",
          android: {
            buildType: "apk",
          },
        },
        preview: {
          distribution: "internal",
          android: {
            buildType: "apk",
          },
        },
        production: {
          android: {
            buildType: "app-bundle",
          }
        },
      },
      submit: {
        production: {}
      }
    };
    
    await fs.writeJson(path.join(projectPath, "eas.json"), easJson, { spaces: 2 });
    
    // .gitignore
    const gitignore = `# Dependencies
node_modules/
.expo/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local

# Expo
.expo/
dist/
web-build/

# iOS
ios/build/
Pods/
*.pbxuser
*.mode1v3
*.mode2v3
*.perspectivev3

# Android
android/.gradle/
android/local.properties
android/**/*.apk
android/**/*.keystore

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
__tests__/__snapshots__/

# EAS
*.jks
*.p8
*.p12
*.key
*.cer`;
    
    await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore);
    
    console.log(chalk.green("  âœ… Configuration files created"));
  }

  /**
   * Generate demo code
   */
  async generateDemoCode(projectPath, projectName) {
    console.log(chalk.blue("ðŸ’» Generating demo code..."));
    
    // API Service
    const apiService = `import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Add auth token if exists
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      await AsyncStorage.removeItem('auth_token');
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

// GAS API Service
export const gasApi = {
  // Call GAS function
  callFunction: async (functionName, params = {}) => {
    try {
      const response = await api.post('/api/gas-function', {
        function: functionName,
        parameters: params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get data from Google Sheets
  getSheetsData: async (sheetId, range = 'A:Z') => {
    try {
      const response = await api.get(\`/api/sheets/\${sheetId}\`, {
        params: { range },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit form to GAS
  submitForm: async (formData) => {
    try {
      const response = await api.post('/api/submit', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;`;
    
    await fs.writeFile(path.join(projectPath, "services/api/index.js"), apiService);
    
    // Common Button Component
    const buttonComponent = `import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Button = ({ 
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style = {},
  textStyle = {}
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'danger':
        return styles.danger;
      default:
        return styles.primary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#5856D6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 56,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#007AFF',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;`;
    
    await fs.writeFile(path.join(projectPath, "components/common/Button.js"), buttonComponent);
    
    // Constants file
    const constants = `// App Constants
export const APP_NAME = '${projectName}';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Colors
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
  GRAY_LIGHT: '#C7C7CC',
  GRAY_DARK: '#636366',
};

// Typography
export const TYPOGRAPHY = {
  H1: 32,
  H2: 24,
  H3: 20,
  H4: 18,
  BODY_LARGE: 18,
  BODY: 16,
  BODY_SMALL: 14,
  CAPTION: 12,
};

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

// Border Radius
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  ROUND: 999,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SETTINGS: 'app_settings',
  CACHE: 'app_cache',
};

// Feature Flags
export const FEATURES = {
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: false,
  DARK_MODE: true,
  BIOMETRIC_AUTH: false,
  GOOGLE_SIGN_IN: true,
};`;
    
    await fs.writeFile(path.join(projectPath, "constants/index.js"), constants);
    
    console.log(chalk.green("  âœ… Demo code generated"));
  }

  /**
   * Generate documentation
   */
  async generateDocumentation(projectPath, projectName, options) {
    console.log(chalk.blue("ðŸ“š Generating documentation..."));
    
    const readmeContent = `# ${projectName} - Expo Mobile App

This Expo app was automatically generated from your Google Apps Script project using **CÂ³X CLI**.

## ðŸš€ Quick Start

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start development
npm start

# 3. Run on specific platform
npm run android    # Android emulator/device
npm run ios        # iOS simulator/device
npm run web        # Web browser
\`\`\`

## ðŸ“± Project Structure

\`\`\`
${projectName}/
â”œâ”€â”€ app/                    # Expo Router app directory
â”‚   â”œâ”€â”€ (tabs)/            # Tab navigation screens
â”‚   â”œâ”€â”€ _layout.js         # Root layout
â”‚   â””â”€â”€ index.js           # Entry point
â”œâ”€â”€ components/            # Reusable components
â”œâ”€â”€ screens/               # Screen components
â”œâ”€â”€ services/              # API and services
â”œâ”€â”€ utils/                 # Helper functions
â”œâ”€â”€ constants/             # App constants
â”œâ”€â”€ assets/                # Images, fonts, icons
â””â”€â”€ navigation/            # Navigation configuration
\`\`\`

## ðŸ”Œ Connecting to Backend

This app is pre-configured to connect to your Express.js backend at:

\`${options.apiUrl || "http://localhost:3000"}\`

### API Integration:
- All GAS functions are available via \`/api/gas-function\` endpoint
- Google Sheets data is available via \`/api/sheets\`
- Form submissions go to \`/api/submit\`

## ðŸ“¦ Features Included

âœ… **Expo Router** - File-based navigation
âœ… **API Integration** - Ready-to-use GAS API client
âœ… **Offline Support** - AsyncStorage for data persistence  
âœ… **Responsive UI** - Works on phones, tablets, and web
âœ… **TypeScript Ready** - Add \`.ts\`/\`.tsx\` files as needed
âœ… **EAS Build** - Configured for Expo Application Services  

## ðŸŽ¨ Customization

### 1. Update API URL:
Edit \`.env.example\` and rename to \`.env\`:
\`\`\`
EXPO_PUBLIC_API_URL="https://your-backend.com"
\`\`\`

### 2. Add Screens:
Create new files in \`app/\` or \`screens/\` directory.

### 3. Custom Components:
Add reusable components in \`components/\` directory.

## ðŸ“² Building for Production

### Android:
\`\`\`bash
npm run build:android
\`\`\`

### iOS:
\`\`\`bash
npm run build:ios
\`\`\`

### Web:
\`\`\`bash
npm run build:web
\`\`\`

## ðŸ§ª Testing

\`\`\`bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
\`\`\`

## ðŸ”§ Development Tips

1. **Hot Reload**: Changes appear instantly
2. **Expo Go**: Test on real devices with Expo Go app
3. **Debugging**: Use React Native Debugger or Flipper
4. **TypeScript**: Add \`tsconfig.json\` and rename files to \`.tsx\`

## ðŸ“š Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [CÂ³X CLI Docs](https://github.com/your-repo/c3x-cli)

## ðŸ†˜ Support

For issues with the generated code:
1. Check the API connection
2. Verify GAS function names match
3. Check console logs for errors
4. Consult CÂ³X documentation

---

*Generated with â¤ï¸ by CÂ³X CLI - 3x Productivity for GAS Developers*`;

    await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
    
    // Create a setup guide
    const setupGuide = `# Setup Guide for ${projectName}

## Prerequisites

1. **Node.js** (v18 or newer)
2. **Expo CLI** (optional, included in dependencies)
3. **Mobile device** or emulator
4. **Backend API** running (from web migration)

## Step-by-Step Setup

### 1. Install Dependencies
\`\`\`bash
cd ${projectName}
npm install
\`\`\`

### 2. Configure Environment
\`\`\`bash
cp .env.example .env
# Edit .env with your API URL and Google API keys
\`\`\`

### 3. Start Development
\`\`\`bash
npm start
\`\`\`

Scan the QR code with:
- **Expo Go app** (on iOS/Android)
- **Camera app** (iOS)
- **Expo app** (Android)

### 4. Connect to Backend
Ensure your Express.js backend is running at the URL specified in \`.env\`.

## Platform-Specific Setup

### iOS
- Install Xcode (from App Store)
- Install iOS Simulator (via Xcode)
- \`npm run ios\` to launch simulator

### Android
- Install Android Studio
- Create Android Virtual Device (AVD)
- \`npm run android\` to launch emulator

### Web
- \`npm run web\` opens in browser
- No additional setup needed

## Testing GAS Integration

1. Start both backend and mobile app
2. Navigate to Home screen
3. Test API calls (check Network tab)
4. Verify data flows correctly

## Common Issues & Solutions

### "Network Request Failed"
- Ensure backend is running
- Check CORS configuration on backend
- Verify API URL in .env

### "Unable to resolve module"
- Clear cache: \`npm start -- --clear\`
- Delete node_modules and reinstall

### "Expo Go connection issues"
- Ensure phone and computer are on same network
- Try "Tunnel" connection in Expo Dev Tools

## Next Steps

1. Customize UI in \`app/\` directory
2. Add your business logic
3. Implement authentication
4. Test on real devices
5. Deploy to app stores

For more help, visit the CÂ³X documentation.`;
    
    await fs.writeFile(path.join(projectPath, "docs/SETUP.md"), setupGuide);
    
    console.log(chalk.green("  âœ… Documentation generated"));
  }

  /**
   * Generate a unique project ID
   */
  generateProjectId(_platforms) {
   
    const crypto = require("crypto");
    const hash = crypto
      .createHash("md5")
      .update(projectName + Date.now())
      .digest("hex")
      .slice(0, 8);
    
     return `${projectName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${hash}`;
  }
}

