import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import esbuild from 'esbuild';
import { notifyClients, setupWebsocketConnectionForReload } from '../../utils/reloadSocketUtils.js';

export default async function vanillaDev() {
  console.log('🚀 Starting dev server for Vanilla JS project...');

  const cwd = process.cwd();
  const srcDir = path.join(cwd, 'src');
  const publicDir = path.join(cwd, 'public');
  const distDir = path.join(cwd, 'dist');

  const webSocketServer = setupWebsocketConnectionForReload();
  notifyClients(webSocketServer);

  await buildAll();

  chokidar.watch([srcDir, publicDir]).on('change', async (changedPath) => {
    console.log(`🔄 Detected change in ${changedPath}`);
    await buildAll();
    notifyClients(webSocketServer);
  });

  async function buildAll() {
    await fs.remove(distDir);
    await fs.copy(publicDir, distDir);

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

      // Avoid double injection
      if (!html.includes('ws://localhost:35729')) {
        html = html.replace('</body>', `${reloadScript}</body>`);
        await fs.writeFile(htmlPath, html, 'utf-8');
      }
    }

    try {
      await esbuild.build({
        entryPoints: [path.join(srcDir, 'index.js')],
        bundle: true,
        minify: true,
        outfile: path.join(distDir, 'index.js'),
      });
      console.log('✅ Build complete');
    } catch (err) {
      console.error('❌ Build failed:', (err as any).message);
    }
  }
}
