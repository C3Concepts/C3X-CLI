import { Command } from "commander";
import migrateCommand from "./commands/migrate.js";
import authCommand from "./commands/auth.js";
import createCommand from "./commands/create.js";
import statusCommand from "./commands/status.js";
// Added if needed

export const program = new Command();

program
  .name("c3x")
  .description("C³X CLI: 3x productivity migrating from Google Apps Script")
  .version("1.0.0");

program.addCommand(migrateCommand);
program.addCommand(authCommand);
program.addCommand(createCommand);
program.addCommand(statusCommand);
// program.addCommand(setupCommand); // Uncomment if you have this

export default program;