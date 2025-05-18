import { ChildProcess } from 'child_process';
import { executeWithPrompts, PromptResponse } from './commandExecute';

/**
 * A utility class for creating interactive CLI prompts with automated responses
 * Inspired by the prompt handling pattern in cli-init.test.ts
 */
export class CommandPromptBuilder {
  private command: string;
  private args: string[];
  private prompts: PromptResponse[] = [];
  private debugMode: boolean = false;
  private workingDir?: string;
  private env?: NodeJS.ProcessEnv;

  /**
   * Create a new command prompt builder
   * @param command The command to execute
   * @param args Optional command arguments
   */
  constructor(command: string, args: string[] = []) {
    this.command = command;
    this.args = args;
  }

  /**
   * Add a prompt response pattern
   * @param pattern String or RegExp to match in the output
   * @param response Response to send when pattern is matched
   * @param endAfter Whether to end stdin after this response
   */
  addPrompt(
    pattern: string | RegExp,
    response: string,
    endAfter: boolean = false
  ): this {
    this.prompts.push({
      pattern,
      response,
      endAfter,
    });
    return this;
  }

  /**
   * Add a custom prompt handler with a callback function
   * @param pattern String or RegExp to match in the output
   * @param handler Handler function to call when the pattern is matched
   */
  addCustomPromptHandler(
    pattern: string | RegExp,
    handler: (child: ChildProcess, str: string) => void
  ): this {
    this.prompts.push({
      pattern,
      response: '',
      handler,
    });
    return this;
  }

  /**
   * Set the working directory for the command
   * @param cwd Working directory path
   */
  withWorkingDir(cwd: string): this {
    this.workingDir = cwd;
    return this;
  }

  /**
   * Set environment variables for the command
   * @param env Environment variables
   */
  withEnv(env: NodeJS.ProcessEnv): this {
    this.env = env;
    return this;
  }

  /**
   * Enable debug mode to log all stdout/stderr
   */
  withDebug(): this {
    this.debugMode = true;
    return this;
  }

  /**
   * Execute the command with all configured prompts
   * @returns Promise resolving to command result
   */
  async execute() {
    return executeWithPrompts(this.command, this.args, {
      prompts: this.prompts,
      debug: this.debugMode,
      cwd: this.workingDir,
      env: this.env,
    });
  }

  /**
   * Create a builder for a Node.js script
   * @param scriptPath Path to the script
   * @param args Additional arguments
   */
  static forNodeScript(scriptPath: string, ...args: string[]) {
    return new CommandPromptBuilder('node', [scriptPath, ...args]);
  }

  /**
   * Create a builder for an npm command
   * @param npmCommand npm command (e.g., 'install', 'start')
   * @param args Additional arguments
   */
  static forNpm(npmCommand: string, ...args: string[]) {
    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    return new CommandPromptBuilder(npmCmd, [npmCommand, ...args]);
  }
}

/**
 * Execute a command with a series of yes/no confirmations
 * @param command Command to execute
 * @param args Command arguments
 * @param confirmations Array of confirmation patterns
 * @param yesForAll Whether to answer "yes" to all confirmations
 */
export async function executeWithConfirmations(
  command: string,
  args: string[] = [],
  confirmations: string[],
  yesForAll: boolean = true
) {
  const builder = new CommandPromptBuilder(command, args);

  for (const pattern of confirmations) {
    builder.addPrompt(pattern, yesForAll ? 'y' : 'n');
  }

  return builder.execute();
}
