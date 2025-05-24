import fs from 'fs-extra';
import path from 'path';
import esbuild from 'esbuild';
import { injectConfigIntoManifest } from '../../utils/configToManifest.js';
import { readConfigFile } from '../../utils/configUtil.js';

export async function vanillaBuild({
  srcDir,
  publicDir,
  distDir,
}: {
  srcDir: string;
  publicDir: string;
  distDir: string;
}) {
  await fs.remove(distDir);
  await fs.copy(publicDir, distDir);

  try {
    await esbuild.build({
      entryPoints: [path.join(srcDir, 'index.js')],
      bundle: true,
      minify: true,
      outfile: path.join(distDir, 'index.js'),
    });

    // Inject config into manifest if config exists
    const config = await readConfigFile();
    await injectConfigIntoManifest(distDir, config);

    return true;
  } catch (err) {
    throw new Error((err as any).message);
  }
}
