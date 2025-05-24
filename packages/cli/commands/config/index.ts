// Implements the `rolo config` command to update rolo.config.json
import { logSuccess } from '../../utils/logger.js';
import { Command } from 'commander';
import {
  readConfigFile,
  writeToConfigFile,
  parseConfigValue,
  mergeConfigObjects,
  promptForKey,
  promptForValue,
  removeConfigKey,
  checkIfKeyIsMergeableObject,
} from '../../utils/configUtil.js';

export async function configCommand(program: Command) {
  program
    .command('config')
    .description('Update rolo.config.json for your extension project')
    .option('-r, --remove', 'Remove a key from rolo.config.json')
    .option(
      '-a, --add',
      'Adds a value to the existing config property in manifest'
    )
    .option('-k, --key <key>', 'Config key to set')
    .option('-v, --value <value>', 'Value to set for the key')
    .action(async (options) => {
      let config = await readConfigFile();
      if (!config) return;
      let key = options.key;
      if (options.remove) {
        // Remove mode: prompt for key if not provided, ignore value
        if (!key) {
          key = await promptForKey('Config key to remove:');
        }
        await removeConfigKey(config, key);
        return;
      }
      // Set/update mode
      let value = options.value;
      if (!key) {
        key = await promptForKey('Config key to set:', 'name');
      }
      if (value === undefined) {
        value = await promptForValue();
      }
      // // Try to parse as JSON, fallback to string or array
      // try {
      //   parsedValue = JSON.parse(value);
      //   // If parsedValue is a string that looks like an array, parse it as array
      //   if (typeof parsedValue === 'string' && parsedValue.startsWith('[') && parsedValue.endsWith(']')) {
      //     parsedValue = JSON.parse(parsedValue);
      //   }
      // } catch {
      //   // If value looks like an array, parse as array
      //   if (typeof value === 'string' && value.trim().startsWith('[') && value.trim().endsWith(']')) {
      //     try {
      //       parsedValue = JSON.parse(value);
      //     } catch {
      //       parsedValue = value;
      //     }
      //   } else {
      //     parsedValue = value;
      //   }
      // }
      let parsedValue: string | string[] = parseConfigValue(value);
      let existingValue: string | string[] = config[key];
      // If the key exists and both are arrays, append new values
      if (
        options.add &&
        checkIfKeyIsMergeableObject(existingValue, parsedValue)
      ) {
        config[key] = mergeConfigObjects(existingValue, parsedValue);
      } else {
        config[key] = parsedValue;
      }
      await writeToConfigFile(config, { spaces: 2 });
      logSuccess(`Updated ${key} in rolo.config.json.`);
      Array.from('[1, 2, 3]');
    });
}
