import fs from 'fs-extra';
import path from 'path';
import { executeCommandInteractive } from './executeCommand';
import { describe, test, expect, afterAll } from '@jest/globals';
import { spawn } from 'child_process';

// Helper to wait for a file or directory to exist
async function waitForExists(filePath: string, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (fs.existsSync(filePath)) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

// Helper to touch a file (simulate change)
async function touchFile(filePath: string) {
  const time = new Date();
  await fs.utimes(filePath, time, time);
}

describe('CLI dev command (HMR & build)', () => {
  const testProject = 'test-extension-dev';
  const cliBin = path.resolve(__dirname, '../dist/bin/rolo.js');
  const projectDir = path.resolve(__dirname, './', testProject);
  const distDir = path.join(projectDir, 'dist');
  const srcFile = path.join(projectDir, 'src', 'index.js');

  afterAll(async () => {
    if (await fs.pathExists(projectDir)) {
      await fs.remove(projectDir);
    }
  });

  test('dev command builds and triggers HMR on file change', async () => {
    // 1. Create a new project using the init command
    await executeCommandInteractive(
      cliBin,
      ['init', testProject, '--template', 'vanilla'],
      () => undefined
    );

    // 2. Start the dev command as a background process
    const devProcess = spawn('node', [cliBin, 'dev'], {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CI: '1' },
    });

    // Collect output for debugging
    let devStdout = '';
    let devStderr = '';
    devProcess.stdout.on('data', (data) => {
      devStdout += data.toString();
    });
    devProcess.stderr.on('data', (data) => {
      devStderr += data.toString();
    });

    // 3. Wait for dist/index.js to be created (initial build)
    const buildReady = await waitForExists(
      path.join(distDir, 'index.js'),
      20000 // Increase timeout to 30 seconds
    );
    console.log('DEV STDOUT:', devStdout);
    console.log('DEV STDERR:', devStderr);
    expect(buildReady).toBe(true);

    // 4. Listen for HMR/reload message in stdout
    let hmrTriggered = false;
    devProcess.stdout.on('data', (data) => {
      const str = data.toString();
      if (
        str.includes('Reloading extension') ||
        str.includes('Build complete')
      ) {
        hmrTriggered = true;
      }
    });

    // 5. Touch the src/index.js file to trigger HMR
    await new Promise((r) => setTimeout(r, 1000)); // Wait a bit before triggering
    await touchFile(srcFile);

    // 6. Wait for HMR to be triggered
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('HMR not triggered in time')),
        10000
      );
      (function check() {
        if (hmrTriggered) {
          clearTimeout(timeout);
          resolve(true);
        } else {
          setTimeout(check, 300);
        }
      })();
    });

    // 7. Cleanup: kill the dev process
    devProcess.kill();
  }, 20000);
});
