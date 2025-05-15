import chalk from 'chalk';

export const logSuccess = (msg: string) =>
  console.log(chalk.green(`✅ ${msg}`));
export const logError = (msg: string) => console.error(chalk.red(`❌ ${msg}`));
export const logInfo = (msg: string) => console.log(chalk.cyan(`ℹ️ ${msg}`));
