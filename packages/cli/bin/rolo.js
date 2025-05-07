#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "../commands/init.js";
import devCommand from "../commands/dev/index.js";

const program = new Command();

program
  .name("rolo")
  .description("Rolo:Chrome extension framework CLI")
  .version("0.1.0");

program
  .command("init [project-name] ")
  .description("Initialise a new extension project")
  .action(() => {
    initCommand();
  });

devCommand(program);

program.parse();
