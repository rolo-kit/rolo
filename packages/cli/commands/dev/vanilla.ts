import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import { vanillaBuild } from '../build/vanilla.js';
import {
  notifyClients,
  setupWebsocketConnectionForReload,
} from '../../utils/reloadSocketUtils.js';
import { logSuccess } from '../../utils/logger.js';

export default async function vanillaDev() {
  console.log('🚀 Starting dev server for Vanilla JS project...');

  const cwd = process.cwd();
  const srcDir = path.join(cwd, 'src');
  const publicDir = path.join(cwd, 'public');
  const distDir = path.join(cwd, 'dist');
  const { closeWebsocketServer } = await import(
    '../../utils/reloadSocketUtils.js'
  );

  const webSocketServer = setupWebsocketConnectionForReload();
  notifyClients(webSocketServer);

  await buildAll();

  const shutdown = async () => {
    try {
      await closeWebsocketServer(webSocketServer);
      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  chokidar.watch([srcDir, publicDir]).on('change', async (changedPath) => {
    console.log(`🔄 Detected change in ${changedPath}`);
    await buildAll();
    notifyClients(webSocketServer);
  });

  async function buildAll() {
    await vanillaBuild({ srcDir, publicDir, distDir });
    logSuccess('Build complete');
    // Inject live reload script in index.html
    const htmlPath = path.join(distDir, 'index.html');
    if (await fs.pathExists(htmlPath)) {
      let html = await fs.readFile(htmlPath, 'utf-8');
      const reloadScript = `
        <script>
          (() => {
            try {
              const ws = new WebSocket("ws://localhost:35729");
              ws.onmessage = () => {
                console.log("[rolo] Reloading extension...");
                chrome.runtime.reload();
              };
            } catch (e) {
              console.warn("[rolo] Live reload disabled:", e.message);
            }
          })();
        </script>`;
      if (!html.includes('ws://localhost:35729')) {
        html = html.replace('</body>', `${reloadScript}</body>`);
        await fs.writeFile(htmlPath, html, 'utf-8');
      }
    }
  }
}
