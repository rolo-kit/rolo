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
      let parsedValue: any = parseConfigValue(value);
      // If the key exists and both are objects, merge instead of replace
      if (checkIfKeyIsMergeableObject(config, key, parsedValue)) {
        config[key] = mergeConfigObjects(config[key], parsedValue);
      } else {
        config[key] = parsedValue;
      }
      await writeToConfigFile(config, { spaces: 2 });
      logSuccess(`Updated ${key} in rolo.config.json.`);
    });
}
