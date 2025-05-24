import path from 'path';
import { logError, logSuccess } from './logger.js';
import fs from 'fs-extra';
import prompts from 'prompts';

export async function readConfigFile() {
  try {
    const configPath = path.join(process.cwd(), 'rolo.config.json');
    if (!(await fs.pathExists(configPath))) {
      logError(
        'rolo.config.json not found. Run this inside your extension project root.'
      );
      return;
    }
    return await fs.readJson(configPath);
  } catch (error: any) {
    logError(`Error reading rolo.config.json: ${error.message}`);
  }
}

export function parseConfigValue(value: string): string | string[] {
  try {
    return JSON.parse(value.replace(/'/g, '"'));
  } catch {
    return value;
  }
}

export function mergeConfigObjects(existing: any, incoming: any) {
  if (Array.isArray(existing) && Array.isArray(incoming)) {
    // Merge arrays, deduplicate using Set, return as array
    return Array.from(new Set([...existing, ...incoming]));
  } else if (Array.isArray(existing)) {
    // Add single value to array, deduplicate
    return Array.from(new Set([...existing, incoming]));
  } else if (Array.isArray(incoming)) {
    // Add array to single value, deduplicate
    return Array.from(new Set([existing, ...incoming]));
  } else if (
    typeof existing === 'object' && existing !== null &&
    typeof incoming === 'object' && incoming !== null
  ) {
    // Shallow merge objects
    return { ...existing, ...incoming };
  } else {
    // Fallback: replace
    return incoming;
  }
}

export async function readFile(configPath: string) {
  if (configPath) {
    return await fs.readJson(configPath);
  }
}

export async function writeToConfigFile(config: any, options?: any) {
  try {
    const configPath = path.join(process.cwd(), 'rolo.config.json');
    await fs.writeJson(configPath, config, { spaces: 2 });
  } catch (error: any) {
    logError(`Error writing to rolo.config.json: ${error.message}`);
  }
}

export async function promptForKey(
  message: string,
  initial?: string
): Promise<string> {
  const response = await prompts({
    type: 'text',
    name: 'key',
    message,
    initial,
    validate: (k: string) => (k.trim() === '' ? 'Key required' : true),
  });
  return response.key;
}

export async function promptForValue(
  message = 'Value to set:',
  initial = ''
): Promise<string> {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message,
    initial,
  });
  return response.value;
}

export async function removeConfigKey(config: any, key: string) {
  if (config.hasOwnProperty(key)) {
    delete config[key];
    await writeToConfigFile(config, { spaces: 2 });
    logSuccess(`Removed '${key}' from rolo.config.json.`);
    return true;
  } else {
    logError(`Key '${key}' not found in rolo.config.json.`);
    return false;
  }
}

export function checkIfKeyIsMergeableObject(
  existingValue: any,
  parsedValue: any
): boolean {
  return (
    existingValue !== null &&
    parsedValue !== null &&
    Array.isArray(existingValue)
  );
}
