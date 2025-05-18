import { spawn } from 'child_process';
import path from 'path';
import stripAnsi from 'strip-ansi';

type PromptHandler = (
  promptNo: number,
  promptText: string
) => string | void | Promise<string | void>;

export function executeCommandInteractive(
  bin: string,
  args: string[],
  onPrompt: PromptHandler
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise(async (resolve, reject) => {
    const child = spawn('node', [bin, ...args], {
      cwd: path.resolve(__dirname, './'),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, CI: '1' },
    });
    let stdout = '';
    let stderr = '';
    let promptNo = 0;

    child.stdout.on('data', async (data) => {
      const str = data.toString();
      stdout += str;
      // Remove ANSI escape codes
      const cleanStr = stripAnsi(str);
      const clean = cleanStr;
      // Only respond to finalized prompt (contains checkmark or template selection)
      // if (clean.includes('✔')) {
      // try {
      const response = await onPrompt(promptNo, clean.trim());
      if (typeof response === 'string') {
        child.stdin.write(response + '\n');
      } else {
        await child.stdin.end();
      }
      promptNo++;
      // }
      // }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code: number) => {
      // Clean up streams to avoid open handles
      if (child.stdin && !child.stdin.destroyed) child.stdin.destroy();
      if (child.stdout && !child.stdout.destroyed) child.stdout.destroy();
      if (child.stderr && !child.stderr.destroyed) child.stderr.destroy();
      // Remove all listeners
      child.removeAllListeners();
      setImmediate(() => resolve({ stdout, stderr, code }));
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}
