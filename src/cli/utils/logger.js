import chalk from "chalk";

class Logger {
  static info(message) {
    console.log(chalk.blue(`[INFO] ${message}`));
  }

  static success(message) {
    console.log(chalk.green(`[SUCCESS] ${message}`));
  }

  static warn(message) {
    console.log(chalk.yellow(`[WARNING] ${message}`));
  }

  static error(message) {
    console.log(chalk.red(`[ERROR] ${message}`));
  }

  static header(message) {
    console.log(chalk.cyan("\n========================================"));
    console.log(chalk.cyan(`               ${message}`));
    console.log(chalk.cyan("========================================\n"));
  }

  static step(stepNumber, totalSteps, message) {
    const progress = chalk.gray(`[${stepNumber}/${totalSteps}]`);
    console.log(chalk.cyan(`${progress} ${message}`));
  }
}

export default Logger;