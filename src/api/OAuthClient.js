import { google } from "googleapis"; // eslint-disable-line no-unused-vars
import GoogleOAuth from "../auth/GoogleOAuth.js";
import chalk from "chalk";

class OAuthClient {
  constructor() {
    this.oauth = new GoogleOAuth();
    this.initialized = false;
  }

  async initialize(demoMode = false) {
    if (this.initialized) return true;

    console.log(chalk.blue("ðŸ”§ Initializing Google APIs..."));

    if (demoMode) {
      console.log(chalk.yellow("âš ï¸  Running in demo mode - using mock APIs"));
      this.initialized = true;
      return true;
    }

    try {
      const hasAuth = await this.oauth.initialize();

      if (!hasAuth) {
        console.log(chalk.yellow("âš ï¸  Not authenticated with Google"));
        return false;
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error(
        chalk.red("âŒ Failed to initialize Google APIs:"),
        error.message
      );
      return false;
    }
  } 

  // Mock methods for demo mode
  getScriptAPI() {
    return {
      analyzeProject: async () => ({
        projectTitle: "Demo GAS Project",
        fileCount: 2,
        triggers: 0,
        deployments: 0,
        estimatedComplexity: "Simple"
      })
    };
  }
}

export default OAuthClient;


