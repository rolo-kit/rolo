import {
  exec,
  spawn,
  ChildProcess,
  ExecOptions,
  SpawnOptions,
} from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

/**
 * Represents the result of a command execution
 */
export interface CommandResult {
  /** Standard output from the command */
  stdout: string;
  /** Standard error output from the command */
  stderr: string;
  /** Exit code of the command (0 for success) */
  code: number | null;
}

/**
 * Options for interactive command execution
 */
export interface InteractiveCommandOptions extends SpawnOptions {
  /** Callback function for stdout data */
  onStdout?: (data: string) => void;
  /** Callback function for stderr data */
  onStderr?: (data: string) => void;
  /** Callback function when process closes */
  onClose?: (code: number | null) => void;
}

/**
 * Executes a shell command synchronously and returns the result
 * @param command The command to execute
 * @param options Optional exec options
 * @returns An object containing stdout, stderr, and exit code
 */
export function executeCommand(
  command: string,
  options?: ExecOptions
): CommandResult {
  try {
    const { stdout, stderr } = exec(command, options);
    return {
      stdout: stdout.toString(),
      stderr: stderr.toString(),
      code: 0,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout ? error.stdout.toString() : '',
      stderr: error.stderr ? error.stderr.toString() : error.message,
      code: error.code || 1,
    };
  }
}

/**
 * Executes a shell command asynchronously
 * @param command The command to execute
 * @param options Optional exec options
 * @returns Promise resolving to an object containing stdout, stderr, and exit code
 */
export async function executeCommandAsync(
  command: string,
  options?: ExecOptions
): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execPromise(command, options);
    return {
      stdout: stdout,
      stderr: stderr,
      code: 0,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout ? error.stdout.toString() : '',
      stderr: error.stderr ? error.stderr.toString() : error.message,
      code: error.code || 1,
    };
  }
}

/**
 * Spawns an interactive command process with stdio streams
 * @param command The command to execute
 * @param args The command arguments
 * @param options Optional spawn and callback options
 * @returns The spawned child process
 */
export function spawnInteractiveCommand(
  command: string,
  args: string[] = [],
  options: InteractiveCommandOptions = {}
): ChildProcess {
  const { onStdout, onStderr, onClose, ...spawnOptions } = options;

  // Default to pipe for stdio if not specified
  const defaultedOptions: SpawnOptions = {
    stdio: ['pipe', 'pipe', 'pipe'],
    ...spawnOptions,
  };

  const child = spawn(command, args, defaultedOptions);

  let stdout = '';
  let stderr = '';

  if (child.stdout) {
    child.stdout.on('data', (data: Buffer) => {
      const str = data.toString();
      stdout += str;
      if (onStdout) onStdout(str);
    });
  }

  if (child.stderr) {
    child.stderr.on('data', (data: Buffer) => {
      const str = data.toString();
      stderr += str;
      if (onStderr) onStderr(str);
    });
  }

  child.on('close', (code: number | null) => {
    if (onClose) onClose(code);

    // Clean up streams to avoid open handles
    cleanupChildProcess(child);
  });

  return child;
}

/**
 * Cleans up a child process resources to avoid memory leaks
 * @param child The child process to clean up
 */
export function cleanupChildProcess(child: ChildProcess): void {
  if (child.stdin && !child.stdin.destroyed) child.stdin.destroy();
  if (child.stdout && !child.stdout.destroyed) child.stdout.destroy();
  if (child.stderr && !child.stderr.destroyed) child.stderr.destroy();
}

/**
 * Wraps spawnInteractiveCommand in a Promise for easier async usage
 * @param command The command to execute
 * @param args The command arguments
 * @param options Optional spawn options
 * @returns Promise resolving to command result
 */
export function spawnCommandAsync(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {}
): Promise<CommandResult> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const child = spawnInteractiveCommand(command, args, {
      ...options,
      onStdout: (data) => {
        stdout += data;
      },
      onStderr: (data) => {
        stderr += data;
      },
      onClose: (code) => {
        resolve({ stdout, stderr, code });
      },
    });
  });
}

/**
 * Execute an NPM command in a specific directory
 * @param command NPM command to run (e.g., 'install', 'run build')
 * @param cwd Working directory where to run the command
 * @param options Additional spawn options
 * @returns Promise with command result
 */
export function executeNpmCommand(
  command: string,
  cwd: string,
  options: SpawnOptions = {}
): Promise<CommandResult> {
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  const args = command.split(' ');

  return spawnCommandAsync(npmCmd, args, {
    cwd,
    ...options,
  });
}

/**
 * Represents a prompt response pattern for interactive commands
 */
export interface PromptResponse {
  /** Pattern to detect in the output */
  pattern: string | RegExp;
  /** Response to write to stdin when pattern is detected */
  response: string;
  /** Whether to end stdin after sending this response */
  endAfter?: boolean;
  /** Custom handler function called when the pattern is detected */
  handler?: (child: ChildProcess, str: string) => void;
}

/**
 * Options for running interactive command with automated prompt responses
 */
export interface InteractivePromptOptions extends SpawnOptions {
  /** Array of prompt responses in the order they should be handled */
  prompts: PromptResponse[];
  /** Log all stdout for debugging purposes */
  debug?: boolean;
  /** Optional callback when the command completes */
  onComplete?: (result: CommandResult) => void;
}

/**
 * Executes a command that expects interactive prompts and responds automatically
 * Based on the pattern used in cli-init.test.ts
 *
 * @param command The command to execute
 * @param args Command arguments
 * @param options Options including prompt responses and debug mode
 * @returns Promise resolving to command result
 */
export function executeWithPrompts(
  command: string,
  args: string[] = [],
  options: InteractivePromptOptions
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const { prompts, debug = false, onComplete, ...spawnOptions } = options;

    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      ...spawnOptions,
    });

    let output = '';
    let errorOutput = '';
    let promptNo = 0;

    child.stdout?.on('data', (data) => {
      const str = data.toString();
      output += str;

      if (debug) {
        console.log(`[DEBUG] STDOUT: ${str.trim()}`);
      }

      // Check if current output matches any prompt pattern
      if (promptNo < prompts.length) {
        const currentPrompt = prompts[promptNo];
        const pattern = currentPrompt.pattern;

        const matched =
          typeof pattern === 'string'
            ? str.includes(pattern)
            : pattern.test(str);

        if (matched) {
          if (currentPrompt.handler) {
            currentPrompt.handler(child, str);
          } else {
            child.stdin?.write(`${currentPrompt.response}\n`);
            if (debug) {
              console.log(`[DEBUG] Responding with: ${currentPrompt.response}`);
            }
          }

          if (currentPrompt.endAfter) {
            child.stdin?.end();
          }

          promptNo++;
        }
      }
    });

    child.stderr?.on('data', (data) => {
      const str = data.toString();
      errorOutput += str;

      if (debug) {
        console.error(`[DEBUG] STDERR: ${str.trim()}`);
      }
    });

    child.on('close', (code) => {
      // Clean up streams to avoid open handles
      cleanupChildProcess(child);

      if (code !== 0 && debug) {
        console.error('Command exited with code:', code);
        console.error('STDOUT:', output);
        console.error('STDERR:', errorOutput);
      }

      const result = {
        stdout: output,
        stderr: errorOutput,
        code,
      };

      if (onComplete) {
        onComplete(result);
      }

      resolve(result);
    });
  });
}

/**
 * Simplified version for common CLI interactions that follows the pattern from cli-init.test.ts
 *
 * @param command Command to execute (e.g., 'node')
 * @param args Command arguments (e.g., ['script.js', 'init'])
 * @param promptPatterns Array of [pattern, response] tuples in expected order
 * @param options Additional spawn options
 * @returns Promise resolving to command result
 */
export function executeCliWithPrompts(
  command: string,
  args: string[],
  promptPatterns: Array<[string | RegExp, string, boolean?]>,
  options: SpawnOptions = {}
): Promise<CommandResult> {
  const prompts = promptPatterns.map(
    ([pattern, response, endAfter = false]) => ({
      pattern,
      response,
      endAfter,
    })
  );

  return executeWithPrompts(command, args, { prompts, ...options });
}
