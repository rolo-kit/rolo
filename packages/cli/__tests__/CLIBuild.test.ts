import fs from 'fs-extra';
import path from 'path';
import { executeCommandInteractive } from './executeCommand';
import { describe, test, expect, afterAll } from '@jest/globals';

// Helper to wait for a file or directory to exist
async function waitForExists(filePath: string, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (fs.existsSync(filePath)) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

describe('CLI build command', () => {
  const testProject = 'test-extension-build';
  const cliBin = path.resolve(__dirname, '../dist/bin/rolo.js');
  const projectDir = path.resolve(__dirname, './', testProject);
  const distDir = path.join(projectDir, 'dist');

  afterAll(async () => {
    if (await fs.pathExists(projectDir)) {
      await fs.remove(projectDir);
    }
  });

  test('build command creates a production-ready dist folder', async () => {
    // 1. Create a new project using the init command
    await executeCommandInteractive(
      cliBin,
      ['init', testProject, '--template', 'vanilla'],
      () => undefined
    );

    // 2. Run the build command and capture output
    let buildStdout = '';
    let buildStderr = '';
    await executeCommandInteractive(cliBin, ['build'], async (data) => {
      const jsExists = await waitForExists(path.join(distDir, 'index.js'));
      const manifestExists = await waitForExists(
        path.join(distDir, 'manifest.json')
      );
      expect(jsExists).toBe(true);
      expect(manifestExists).toBe(true);

      // 4. Check that the output is minified (very few line breaks)
      const jsContentRaw = await fs.readFile(path.join(distDir, 'index.js'));
      const jsContent = jsContentRaw.toString();
      expect(jsContent.split('\n').length).toBeLessThan(10);
    });
  }, 40000);
});
