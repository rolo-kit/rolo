import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import {
  notifyClients,
  setupWebsocketConnectionForReload,
} from '../../utils/reloadSocketUtils.js';
import { logError, logInfo, logSuccess } from '../../utils/logger.js';

export default async function reactDev() {
  logInfo('Starting dev server for React project...');

  const cwd = process.cwd();
  const srcDir = path.join(cwd, 'src');
  const publicDir = path.join(cwd, 'public');
  const distDir = path.join(cwd, 'dist');

  const webSocketServer = setupWebsocketConnectionForReload();
  notifyClients(webSocketServer);

  await buildAll();

  chokidar.watch([srcDir, publicDir]).on('change', async (changedPath) => {
    logInfo(`Detected change in ${changedPath}`);
    await buildAll();
    notifyClients(webSocketServer);
  });

  async function buildAll() {
    await fs.remove(distDir);
    await fs.copy(publicDir, distDir);

    const { exec } = await import('child_process');
    await new Promise<void>((resolve, reject) => {
      exec('npx vite build', { cwd }, (error, stdout, stderr) => {
        if (error) {
          logError(`Build failed: ${error.message}`);
          reject(error);
          return;
        }
        if (stdout) logInfo(stdout.trim());
        logSuccess('Build complete');
        resolve();
      });
    });
  }
}
