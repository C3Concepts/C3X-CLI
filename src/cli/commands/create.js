import { Command } from "commander";
import chalk from "chalk";

const createCommand = new Command("create");

createCommand
  .description("Create a new C³X project")
  .argument("[name]", "Project name", "my-c3x-project")
  .action((name) => {
    console.log(chalk.green(`✅ Project "${name}" created!`));
    console.log(chalk.cyan("Next steps:"));
    console.log(chalk.white("  1. cd"), name);
    console.log(chalk.white("  2. npm install"));
    console.log(chalk.white("  3. Start building!"));
  });

export default createCommand;