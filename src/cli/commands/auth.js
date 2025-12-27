import { Command } from "commander";
import chalk from "chalk";
import GoogleOAuth from "../../auth/GoogleOAuth.js";
import setupCommand from "./setup.js";

const authCommand = new Command("auth");

authCommand.description("Google authentication commands").action(() => {
  console.log(chalk.blue("🔐 Google Authentication"));
  console.log(chalk.gray("Available commands:"));
  console.log(chalk.white("  c3x auth login     - Login with Google"));
  console.log(chalk.white("  c3x auth logout    - Logout and clear tokens"));
  console.log(chalk.white("  c3x auth setup     - Setup OAuth credentials"));
  console.log(chalk.white("  c3x auth status    - Check authentication status"));
});

// Login subcommand
authCommand
  .command("login")
  .description("Login with Google OAuth")
  .action(async () => {
    const oauth = new GoogleOAuth();
    await oauth.initialize();
    await oauth.authenticate();
  });

// Logout subcommand
authCommand
  .command("logout")
  .description("Logout and clear tokens")
  .action(async () => {
    const oauth = new GoogleOAuth();
    await oauth.logout();
  });

// Status subcommand
authCommand
  .command("status")
  .description("Check authentication status")
  .action(async () => {
    const oauth = new GoogleOAuth();
    const hasAuth = await oauth.initialize();

    if (hasAuth) {
      console.log(chalk.green("✅ Authenticated with Google"));
    } else {
      console.log(chalk.yellow("⚠️  Not authenticated"));
      console.log(chalk.cyan("Run: c3x auth login to authenticate"));
    }
  });

// Add setup subcommand
authCommand.addCommand(setupCommand);

export default authCommand;