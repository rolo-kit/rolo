import chalk from 'chalk'

export const logSuccess = msg => console.log(chalk.green(msg))
export const logError = msg => console.error(chalk.red(`❌ ${msg}`))
export const logInfo = msg => console.log(chalk.cyan(msg))