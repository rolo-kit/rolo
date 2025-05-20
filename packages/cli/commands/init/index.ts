import fs from 'fs-extra';
import prompts from 'prompts';
import path, { format } from 'path';
import { logSuccess, logError, logInfo } from '../../utils/logger.js';
import { copyTemplate } from '../../utils/copyTemplate.js';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import processCache from '../../utils/processCache.js';
import {
  createKey,
  formatProjectName,
  setupProjectNamespace,
} from '../../utils/projectNamespace.js';
import {
  createdDirKey,
  initCommandKey,
  projectNameKey,
  targetDirKey,
  templateKey,
} from '../../utils/cacheKeyConstants.js';

export async function initCommand(program: Command) {
  let projectNameSpace = '';
  program
    .command('init [projectName]')
    .description('Initialise a new extension project')
    .option('-t,  --template <template>', 'Template to use (vanilla|react)')
    .action(async (projectNameArg, options) => {
      try {
        // step 1: Fetch the user inputs or generate prompts
        let projectName = projectNameArg;
        let template = options.template;

        if (!projectName) {
          ({ projectName } = await prompts({
            type: 'text',
            name: 'projectName',
            message: 'What is the name of  your extension?',
            initial: 'my-extension',
            validate: (name) =>
              name.trim() === '' ? 'Project name is required!' : true,
          }));
        }
        if (!template) {
          ({ template } = await prompts({
            type: 'select',
            name: 'template',
            message: 'Choose a template',
            choices: [
              { title: 'Vanilla JS', value: 'vanilla' },
              { title: 'React', value: 'react' },
            ],
          }));
        }
        const targetDir = path.resolve(process.cwd(), projectName);
        let createdDir = false;
        const formattedProjectName = formatProjectName(projectName);
        projectNameSpace = setupProjectNamespace(
          initCommandKey,
          formattedProjectName
        );
        processCache.set(createKey(projectNameSpace, targetDirKey), targetDir);
        processCache.set(
          createKey(projectNameSpace, projectNameKey),
          projectName
        );
        processCache.set(createKey(projectNameSpace, templateKey), template);

        // Step 2: Validate and create the directory
        if (await fs.pathExists(targetDir)) {
          logError(
            `Directory "${projectNameSpace}" for project "${projectName}" already exists.`
          );
          return;
        }
        await fs.ensureDir(targetDir);
        createdDir = true;
        processCache.set(createKey(projectName, createdDirKey), createdDir);

        // step 3:copy selected template
        // Always resolve from the CLI package root (dist/static/templates)
        const __fileName = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__fileName);
        const cliRoot = path.resolve(
          __dirname,
          '../../static/templates',
          template
        );
        await copyTemplate(cliRoot, targetDir);

        // step 4:display success message
        logSuccess(
          `✅ Project "${projectName}" created using "${template}" template!`
        );
        logInfo(
          `\nNext steps:\n\t 1. cd ${projectName}\n\t 2. npm install\n\t 3. rolo dev`
        );
      } catch (exception) {
        // Remove the created directory on error
        console.log(exception);
        if (processCache.get(createKey(projectNameSpace, createdDirKey))) {
          const targetDir = processCache.get(
            createKey(projectNameSpace, targetDirKey)
          );
          if (targetDir) {
            await fs.remove(targetDir);
          }
        }
      }
    });
}
