import esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

esbuild.build({
  entryPoints: [
    "bin/rolo.ts",
    "commands/init.ts",
    "commands/dev/index.ts",
    "commands/dev/vanilla.ts",
    "utils/copyTemplate.ts",
    "utils/logger.ts",
    "utils/reloadSocketUtils.ts"
  ],
  outdir: "dist",
  bundle: false,
  platform: "node",
  format: "esm",
  sourcemap: true,
  target: ["node20"],
  plugins: [nodeExternalsPlugin()],
  tsconfig: "tsconfig.json"
}).catch(() => process.exit(1));
