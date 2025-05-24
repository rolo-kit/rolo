import fs from 'fs-extra';
import path from 'path';
import { logSuccess, logError, logInfo } from '../../utils/logger.js';
import { Command } from 'commander';
import { exec } from 'child_process';
import { vanillaBuild } from './vanilla.js';
import { injectConfigIntoManifest } from '../../utils/configToManifest.js';

export async function buildCommand(program: Command) {
  program
    .command('build')
    .description('Build your extension for production (Web Store ready)')
    .action(async () => {
      try {
        const cwd = process.cwd();
        const configPath = path.join(cwd, 'rolo.config.json');
        if (!(await fs.pathExists(configPath))) {
          logError(
            'rolo.config.json not found. Please run this command inside your extension project root.'
          );
          return;
        }
        const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        const templateType = config.templateType || config.template;
        logInfo(`Building extension for production (type: ${templateType})...`);
        const outDir = path.join(cwd, 'dist');
        // Clean dist
        await fs.remove(outDir);
        if (templateType === 'react') {
          // Use vite for react (minification is default in production)
          await new Promise((resolve, reject) => {
            exec(
              'npx vite build --minify',
              { cwd },
              (error, stdout, stderr) => {
                if (error) {
                  logError(stderr || error.message);
                  reject(error);
                } else {
                  logInfo(stdout);
                  resolve(true);
                }
              }
            );
          });
        } else if (templateType === 'vanilla') {
          // Use shared vanillaBuild for vanilla projects
          const srcDir = path.join(cwd, 'src');
          const publicDir = path.join(cwd, 'public');
          await vanillaBuild({ srcDir, publicDir, distDir: outDir });
        } else {
          logError('Unknown template type. Supported: vanilla, react');
          return;
        }
        // Copy static assets (manifest, icons, etc.)
        const publicDir = path.join(cwd, 'public');
        if (await fs.pathExists(publicDir)) {
          await fs.copy(publicDir, outDir, { overwrite: true });
        }

        logSuccess(
          'Production build complete! Output is in the dist/ folder and ready for Chrome Web Store upload.'
        );
      } catch (e) {
        if (e instanceof Error) {
          logError('Build failed: ' + e.message);
        } else {
          logError('Build failed: ' + String(e));
        }
      }
    });
}
