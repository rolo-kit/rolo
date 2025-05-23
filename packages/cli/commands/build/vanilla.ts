import fs from 'fs-extra';
import path from 'path';
import esbuild from 'esbuild';

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
    return true;
  } catch (err) {
    throw new Error((err as any).message);
  }
}
