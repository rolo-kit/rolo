import path from "path";
import fs from "fs-extra";
import { logError, logInfo } from "../../utils/logger.js";
import vanillaDev from "./vanilla.js";

export default function devCommand(program: any) {
  program
    .command("dev")
    .description("Start dev server for Rolo extension")
    .action(async () => {
      const configPath = path.join(process.cwd(), "rolo.config.json");
      if (!fs.existsSync(configPath)) {
        logError("rolo.config.json not found");
        process.exit(1);
      }

      const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
      // todo: implement a process level cache later to have the rolo config in memory

      const type = config.templateType;

      switch (type) {
        case "vanilla":
          vanillaDev();
          break;
        case "react":
          logInfo("Build command for react is WIP");
          logInfo("execute npm build manually to create executable");
          break;
        default:
          logError(
            "Incorrect template used, please refer to documentation for further information"
          );
      }
    });
}
