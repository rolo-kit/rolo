// import { exec, spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { executeCommandInteractive } from './executeCommand';
import { describe, test, expect, afterAll, afterEach } from '@jest/globals';

describe('CLI Commands', () => {
  const testProject = 'test-extension-init';
  const cliBin = path.resolve(__dirname, '../dist/bin/rolo.js');
  const projectDir = path.resolve(__dirname, './', testProject);

  afterEach(async () => {
    if (await fs.pathExists(projectDir)) {
      await fs.remove(projectDir);
    }
  });

  test('init command creates a new vanilla JS project via parameters', async () => {
    const responses = ['test-extension-init', 'vanilla'];
    // Pass parameters directly to the CLI to avoid interactive prompts
    const result = await executeCommandInteractive(
      cliBin,
      ['init', responses[0], '--template', responses[1]],
      () => undefined // No prompt handler needed
    );
    // Check that the project directory and subfolders were created
    expect(fs.existsSync(projectDir)).toBe(true);
    expect(fs.existsSync(path.join(projectDir, 'src'))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, 'public'))).toBe(true);
  });

  test('init command also creates a new React project via parameters', async () => {
    const responses = ['test-extension-init', 'react'];
    // Pass parameters directly to the CLI to avoid interactive prompts
    const result = await executeCommandInteractive(
      cliBin,
      ['init', responses[0], '--template', responses[1]],
      () => undefined // No prompt handler needed
    );
    // Check that the project directory and subfolders were created
    expect(fs.existsSync(projectDir)).toBe(true);
    expect(fs.existsSync(path.join(projectDir, 'src'))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, 'public'))).toBe(true);
  });
});
