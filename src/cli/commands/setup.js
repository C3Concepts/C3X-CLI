import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // eslint-disable-line no-unused-vars

const setupCommand = new Command("setup");

setupCommand
  .description("Setup Google OAuth credentials for CÂ³X CLI")
  .action(async () => {
    console.log(chalk.cyan("\nðŸ”§ Google OAuth Setup Wizard"));
    console.log(chalk.gray("=".repeat(50)));

    console.log(chalk.yellow("\nðŸ“‹ Prerequisites:"));
    console.log("1. A Google Cloud Platform project");
    console.log("2. Google Apps Script API enabled");
    console.log("3. OAuth 2.0 credentials created");
    console.log("4. Redirect URI configured");

    const { hasCredentials } = await inquirer.prompt([
      {
        type: "confirm",
        name: "hasCredentials",
        message: "Do you have OAuth 2.0 credentials?",
        default: false,
      },
    ]);

    if (!hasCredentials) {
      console.log(chalk.cyan("\nðŸ”— Open Google Cloud Console:"));
      console.log(chalk.blue("https://console.cloud.google.com/"));
      console.log("\nFollow these steps:");
      console.log("1. Create a new project");
      console.log('2. Enable "Google Apps Script API"');
      console.log('3. Go to "APIs & Services" > "Credentials"');
      console.log('4. Click "Create Credentials" > "OAuth client ID"');
      console.log('5. Application type: "Desktop app"');
      console.log('6. Name: "CÂ³X CLI"');
      console.log("7. Add redirect URI: http://localhost:3000/oauth2callback");
      console.log('8. Click "Create" and note your Client ID & Secret');

      const { ready } = await inquirer.prompt([
        {
          type: "confirm",
          name: "ready",
          message: "Ready to enter your credentials?",
          default: true,
        },
      ]);

      if (!ready) {
        console.log(chalk.yellow("\nSetup cancelled. Run c3x auth setup when ready."));
        return;
      }
    }

    // Collect credentials
    const credentials = await inquirer.prompt([
      {
        type: "input",
        name: "clientId",
        message: "Enter your OAuth Client ID:",
        validate: (input) => {
          if (!input.includes(".apps.googleusercontent.com")) {
            return "Client ID should end with .apps.googleusercontent.com";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "clientSecret",
        message: "Enter your OAuth Client Secret:",
        validate: (input) => {
          if (!input.trim()) return "Client Secret is required";
          return true;
        },
      },
    ]);

    // Save credentials
    const credentialsPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      ".c3x",
      "credentials.json"
    );
    await fs.ensureDir(path.dirname(credentialsPath));

    await fs.writeJson(
      credentialsPath,
      {
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uris: ["http://localhost:3000/oauth2callback"],
      },
      { spaces: 2 }
    );

    console.log(chalk.green("\nâœ… Credentials saved successfully!"));
    console.log(chalk.gray(`Location: ${credentialsPath}`));
    console.log(chalk.cyan("\nðŸ” Next steps:"));
    console.log("1. Run: c3x auth login");
    console.log("2. Authorize in browser");
    console.log("3. Start migrating GAS projects!");
  });

export default setupCommand;

