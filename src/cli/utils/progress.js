import chalk from "chalk";
import readline from "readline";

class Progress {
  constructor(message) {
    this.message = message;
    this.interval = null;
    this.startTime = Date.now();
  }

  start() {
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;

    this.interval = setInterval(() => {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(chalk.blue(`${frames[i]} ${this.message}...`));
      i = (i + 1) % frames.length;
    }, 100);
  }

  stop(success = true) {
    clearInterval(this.interval);
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);

    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    if (success) {
      console.log(chalk.green(`✅ ${this.message} (${elapsed}s)`));
    } else {
      console.log(chalk.red(`❌ ${this.message} failed (${elapsed}s)`));
    }
  }
}

export default Progress;