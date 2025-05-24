import fs from 'fs-extra';
import path from 'path';
import { executeCommandInteractive } from './executeCommand';
import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { cwd } from 'process';

describe('rolo config command', () => {
  const cliBin = path.resolve(__dirname, '../dist/bin/rolo.js');
  const testProject = 'test-extension-build';
  const projectDir = path.resolve(__dirname, './', testProject);
  const configPath = path.join(projectDir, 'rolo.config.json');
  // const distDir = path.join(projectDir, 'dist');

  beforeEach(async () => {
    if (await fs.pathExists(projectDir)) {
      await fs.remove(projectDir);
    }
    // Initialise a new project using rolo init
    await executeCommandInteractive(
      cliBin,
      ['init', testProject, '--template', 'vanilla'],
      () => undefined
    );
  });

  afterAll(async () => {
    if (await fs.pathExists(projectDir)) {
      await fs.remove(projectDir);
    }
  });

  test('sets a new key', async () => {
    await executeCommandInteractive(
      cliBin,
      ['config', '-k', 'name', '-v', 'Test Extension'],
      (promptNo, promptText) => {
        console.log('Setting name to Test Extension');
      },
      projectDir
    );
    const config = await fs.readJson(configPath);
    expect(config.name).toBe('Test Extension');
  }, 20000);

  test('removes a key', async () => {
    await executeCommandInteractive(
      cliBin,
      ['config', '-r', '-k', 'foo'],
      (promptNo, promptText) => {
        console.log('Setting name to Test Extension');
      },
      projectDir
    );
    const config = await fs.readJson(configPath);
    expect(config.foo).toBeUndefined();
  });

  test('merges objects when setting existing object key', async () => {
    await executeCommandInteractive(
      cliBin,
      ['config', '-k', 'foo', '-v', '{"baz":2}'],
      (promptNo, promptText) => {
        console.log('Setting name to Test Extension');
      },
      projectDir
    );
    const config = await fs.readJson(configPath);
    expect(config.foo.baz).toBe(2);
  });

  test('overwrites non-object key', async () => {
    await executeCommandInteractive(
      cliBin,
      ['config', '-k', 'arr', '-v', '[3,4]'],
      (promptNo, promptText) => {
        console.log('Setting name to Test Extension');
      },
      projectDir
    );
    const config = await fs.readJson(configPath);
    expect(config.arr).toEqual([3, 4]);
  });

  test('appends to array and deduplicates with --add', async () => {
    // Set initial array
    await executeCommandInteractive(
      cliBin,
      ['config', '-k', 'arr', '-v', '[1,2,3]'],
      () => undefined,
      projectDir
    );
    // Append values (including duplicate)
    await executeCommandInteractive(
      cliBin,
      ['config', '-k', 'arr', '-v', '[2,3,4]', '--add'],
      () => undefined,
      projectDir
    );
    const config = await fs.readJson(configPath);
    // Should deduplicate and append
    expect(config.arr.sort()).toEqual([1, 2, 3, 4]);
  });

  test('appending to string key with --add just overwrites', async () => {
    await executeCommandInteractive(
      cliBin,
      ['config', '-k', 'foo', '-v', 'bar'],
      () => undefined,
      projectDir
    );
    await executeCommandInteractive(
      cliBin,
      ['config', '-k', 'foo', '-v', 'baz', '--add'],
      () => undefined,
      projectDir
    );
    const config = await fs.readJson(configPath);
    expect(config.foo).toBe('baz');
  });

  test('parses value robustly (malformed JSON falls back to string)', async () => {
    await executeCommandInteractive(
      cliBin,
      ['config', '-k', 'foo', '-v', '{notjson}'],
      () => undefined,
      projectDir
    );
    const config = await fs.readJson(configPath);
    expect(config.foo).toBe('{notjson}');
  });
});
