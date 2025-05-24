import fs from 'fs-extra';
import { writeToConfigFile } from './configUtil.js';
import { logSuccess } from './logger.js';

/**
 * Injects config values into a manifest object, excluding templateType/template.
 * @param manifest The manifest object to update
 * @param config The config object (from rolo.config.json)
 * @returns The updated manifest object
 */
export function applyConfigToManifest(manifest: any, config: any) {
  const configKeys = Object.keys(config).filter(
    (k) => k !== 'templateType' && k !== 'template'
  );
  for (const key of configKeys) {
    manifest[key] = config[key];
  }
  return manifest;
}

/**
 * Loads, updates, and writes manifest.json in the given dist directory.
 */
export async function injectConfigIntoManifest(distDir: string, config: any) {
  const manifestPath = `${distDir}/manifest.json`;
  if (await fs.pathExists(manifestPath)) {
    const manifest = await fs.readJson(manifestPath);
    const updated = applyConfigToManifest(manifest, config);
    await fs.writeJson(manifestPath, updated, { spaces: 2 });
    logSuccess(
      `Updated manifest.json with config values from rolo.config.json`
    );
  }
}
