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
    .command('init [project-name] ')
    .description('Initialise a new extension project')
    .action(async () => {
      try {
        // step 1: Fetch the user inputs
        const response = await prompts([
          {
            type: 'text',
            name: 'projectName',
            message: 'What is the name of  your extension?',
            initial: 'my-extension',
            validate: (name) =>
              name.trim() === '' ? 'Project name is required!' : true,
          },
          {
            type: 'select',
            name: 'template',
            message: 'Choose a template',
            choices: [
              { title: 'Vanilla JS', value: 'vanilla' },
              { title: 'React', value: 'react' },
            ],
          },
        ]);

        const { projectName, template } = response;
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
        const __fileName = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__fileName);
        const templateDirectory = path.resolve(
          __dirname,
          '..',
          'static',
          'templates',
          template
        );
        await copyTemplate(templateDirectory, targetDir);

        // step 4:display success message
        logSuccess(
          `✅ Project "${projectName}" created using "${template}" template!`
        );
        logInfo(
          `\nNext steps:\n\t 1. cd ${projectName}\n\t 2. npm install\n\t 3. npm run dev`
        );
      } catch (exception) {
        // Remove the created directory on error
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
