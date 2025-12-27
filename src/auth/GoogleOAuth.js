import { google } from "googleapis"; // eslint-disable-line no-unused-vars
import { OAuth2Client } from "google-auth-library";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";
import inquirer from "inquirer";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // eslint-disable-line no-unused-vars

class GoogleOAuth {
  constructor() {
    this.oauth2Client = null;
    this.tokenPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      ".c3x",
      "token.json"
    );
    this.credentialsPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      ".c3x",
      "credentials.json"
    );

    // Default credentials (users should replace these)
    this.clientId = process.env.GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID.apps.googleusercontent.com";
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
    this.redirectUri = "http://localhost:3000/oauth2callback";
  }

  async initialize() {
    console.log(chalk.blue("ðŸ” Initializing Google OAuth..."));

    this.oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    // Try to load existing tokens
    if (await this.loadTokens()) {
      console.log(chalk.green("âœ… Using existing authentication tokens"));
      return true;
    }

    return false;
  }

  async authenticate() {
    console.log(chalk.cyan("\nðŸ“‹ Google OAuth Setup"));
    console.log(chalk.gray("=".repeat(40)));

    // Step 1: Check if we have client credentials
    if (!(await this.hasCredentials())) {
      console.log(chalk.yellow("âš ï¸  No Google OAuth credentials found."));
      console.log(chalk.cyan("\nTo use CÂ³X CLI, you need to:"));
      console.log("1. Go to https://console.cloud.google.com/");
      console.log("2. Create a new project");
      console.log("3. Enable Google Apps Script API");
      console.log("4. Create OAuth 2.0 credentials");
      console.log("5. Set redirect URI to: http://localhost:3000/oauth2callback");
      console.log("\nOr run: c3x auth setup");

      const { proceed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "proceed",
          message: "Do you want to continue with demo mode?",
          default: false
        }
      ]);

      if (!proceed) {
        console.log(
          chalk.yellow("\nSetup cancelled. Please configure Google OAuth to continue.")
        );
        process.exit(0);
      }

      // Use demo mode
      return this.demoMode();
    }

    // Step 2: Generate auth URL
    const authUrl = this.generateAuthUrl();
    console.log(chalk.cyan("\nðŸ”— Opening Google authentication in browser..."));
    console.log(chalk.gray("If browser doesn't open, visit this URL:"));
    console.log(chalk.blue(authUrl));

    // Open browser
    try {
      await open(authUrl);
    } catch (error) {
      console.log(chalk.yellow("âš ï¸  Could not open browser automatically."));
    }

    // Step 3: Get authorization code
    const { code } = await inquirer.prompt([
      {
        type: "input",
        name: "code",
        message: "Paste the authorization code from the browser:",
        validate: (input) => {
          if (!input.trim()) return "Authorization code is required";
          return true;
        }
      }
    ]);

    // Step 4: Exchange code for tokens
    console.log(chalk.blue("\nðŸ”„ Exchanging code for tokens..."));
    try {
      const { tokens } = await this.oauth2Client.getToken(code.trim());
      this.oauth2Client.setCredentials(tokens);

      // Save tokens
      await this.saveTokens(tokens);

      console.log(chalk.green("âœ… Successfully authenticated with Google!"));
      console.log(chalk.gray(`Tokens saved to: ${this.tokenPath}`));

      return this.oauth2Client;
    } catch (error) {
      console.error(chalk.red("âŒ Authentication failed:"), error.message);
      throw error;
    }
  }

  generateAuthUrl() {
    const scopes = [
      "https://www.googleapis.com/auth/script.projects",
      "https://www.googleapis.com/auth/script.projects.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/userinfo.email"
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent"
    });
  }

  async hasCredentials() {
    // Check if environment variables are set
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      return true;
    }

    // Check for credentials file
    return await fs.pathExists(this.credentialsPath);
  }

  async loadCredentials() {
    if (await fs.pathExists(this.credentialsPath)) {
      const credentials = await fs.readJson(this.credentialsPath);
      this.clientId = credentials.client_id;
      this.clientSecret = credentials.client_secret;
      return true;
    }
    return false;
  }

  async loadTokens() {
    try {
      if (await fs.pathExists(this.tokenPath)) {
        const tokens = await fs.readJson(this.tokenPath);
        this.oauth2Client.setCredentials(tokens);

        // Check if token is expired
        if (tokens.expiry_date && tokens.expiry_date > Date.now()) {
          return true;
        }

        // Try to refresh
        if (tokens.refresh_token) {
          console.log(chalk.blue("ðŸ”„ Refreshing access token..."));
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          await this.saveTokens(credentials);
          return true;
        }
      }
    } catch (error) {
      console.log(chalk.yellow("âš ï¸  Could not load tokens: "), error.message);
    }
    return false;
  }

  async saveTokens(tokens) {
    await fs.ensureDir(path.dirname(this.tokenPath));
    await fs.writeJson(this.tokenPath, tokens, { spaces: 2 });
  }

  async demoMode() {
    console.log(chalk.yellow("\nðŸš€ Starting in DEMO MODE"));
    console.log(chalk.gray("You can test the CLI flow without actual Google API calls."));
    console.log(chalk.gray("For full functionality, set up Google OAuth credentials.\n"));

    // Create mock OAuth client
    this.oauth2Client = {
      setCredentials: () => {},
      getToken: async () => ({ tokens: { access_token: "demo-token" } }),
      generateAuthUrl: () => "https://accounts.google.com/demo-mode"
    };

    return this.oauth2Client;
  }

  async logout() {
    if (await fs.pathExists(this.tokenPath)) {
      await fs.remove(this.tokenPath);
      console.log(chalk.green("âœ… Successfully logged out"));
    } else {
      console.log(chalk.yellow("âš ï¸  No active session found"));
    }
  }

  getScriptAPI() {
    // This method would return the script API client
    // For now, return null or a mock
    return null;
  }
}

export default GoogleOAuth;

