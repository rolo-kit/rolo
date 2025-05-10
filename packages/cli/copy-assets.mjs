import fs from "fs-extra";
import path from "path";

const src = path.resolve("./static");
const dest = path.resolve("./dist/static");

fs.removeSync(dest);
fs.copySync(src, dest);
console.log(`Copied static assets to ${dest}`);
