import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild
  .build({
    entryPoints: ['bin/rolo.ts', 'commands/**/**.ts', 'utils/**.ts'],
    outdir: 'dist',
    bundle: false,
    platform: 'node',
    format: 'esm',
    sourcemap: true,
    target: ['node20'],
    plugins: [nodeExternalsPlugin()],
    tsconfig: 'tsconfig.json',
    minify: true,
  })
  .catch(() => process.exit(1));
