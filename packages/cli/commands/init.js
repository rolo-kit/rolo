import fs from "fs-extra";
import prompts from "prompts";
import chalk from "chalk";
import path from "path";
// import { copyTemplate } from '../utils/copy-template.js'
import { logSuccess, logError, logInfo } from "../utils/logger.js";
import { copyTemplate } from "../utils/copyTemplate.js";
import { fileURLToPath } from "url";

export async function initCommand() {
  try {
    // step 1: Fetch the user inputs
    const response = await prompts([
      {
        type: "text",
        name: "projectName",
        message: "What is the name of  your extension?",
        initial: "my-extension",
        validate: (name) =>
          name.trim() === "" ? "Project name is required!" : true,
      },
      {
        type: "select",
        name: "template",
        message: "Choose a template",
        choices: [
          { title: "Vanilla JS", value: "vanilla" },
          { title: "React", value: "react" },
          { title: "Vue", value: "vue" },
        ],
      },
    ]);

    const { projectName, template } = response;
    const targetDir = path.resolve(process.cwd(), projectName);

    // Step 2: Validate and create the directory
    if (await fs.pathExists(targetDir)) {
      logError(`Directory "${projectName}" already exists.`);
      return;
    }

    if (template === "vanilla") {
      await fs.ensureDir(targetDir);

      // step 3:copy selected template
      const __fileName = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__fileName);
      const templateDirectory = path.resolve(
        __dirname,
        "..",
        "templates",
        template
      );
      await copyTemplate(templateDirectory, targetDir);

      // step 4:display success message
      logSuccess(
        `✅ Project "${projectName}" created using "${template}" template!`
      );
      console.log(chalk.cyan(`\nNext steps:`));
      console.log(`  cd ${projectName}`);
      console.log(`  npm install`);
      console.log(`  npm run dev`);
    } else {
      logInfo(
        `React and Vue templates are development in progress, please wait for sometime until it's developed`
      );
    }
  } catch (exception) {
    console.error(exception);
  }
}
