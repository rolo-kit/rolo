#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from '../commands/init/index.js';
import devCommand from '../commands/dev/index.js';
import { buildCommand } from '../commands/build/index.js';
import { configCommand } from '../commands/config/index.js';
const program = new Command();

program
  .name('rolo')
  .description('Rolo:Chrome extension framework CLI')
  .version('0.2.0');

initCommand(program);
devCommand(program);
buildCommand(program);
configCommand(program);

program.parse();
