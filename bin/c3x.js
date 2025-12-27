#!/usr/bin/env node

import { program } from '../src/cli/index.js';

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
