import { Command } from "commander";
import chalk from "chalk";
import os from "os";

const statusCommand = new Command("status");

statusCommand.description("Check C³X CLI and system status").action(() => {
  console.log(chalk.green("✅ C³X CLI Status"));
  console.log(chalk.cyan("==================="));
  console.log(chalk.yellow("System:"), os.platform(), os.arch());
  console.log(chalk.yellow("Node.js:"), process.version);
  console.log(chalk.yellow("CLI Version:"), "1.0.0");
  console.log(chalk.cyan("==================="));
  console.log(chalk.blue("Ready to migrate GAS projects!"));
});

export default statusCommand;
