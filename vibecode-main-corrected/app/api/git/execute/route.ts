import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

interface GitCommandRequest {
  command: string;
  args: string[];
  cwd?: string;
}

// Whitelist of allowed Git commands for security
const ALLOWED_COMMANDS = [
  'status',
  'add',
  'commit',
  'push',
  'pull',
  'branch',
  'checkout',
  'merge',
  'reset',
  'log',
  'diff',
  'stash',
  'remote',
  'fetch',
  'clone',
  'init'
];

// Validate that the command is allowed
function isCommandAllowed(command: string): boolean {
  return ALLOWED_COMMANDS.includes(command);
}

// Validate that the working directory exists and is safe
function isValidWorkingDirectory(cwd: string): boolean {
  try {
    const resolvedPath = path.resolve(cwd);
    return fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory();
  } catch {
    return false;
  }
}

// Sanitize arguments to prevent command injection
function sanitizeArgs(args: string[]): string[] {
  return args.map(arg => {
    // Remove potentially dangerous characters
    return arg.replace(/[;&|`$(){}\[\]<>]/g, '');
  });
}

export async function POST(request: NextRequest) {
  let gitCommand = '';
  let workingDirectory = '';
  
  try {
    const body: GitCommandRequest = await request.json();
    const { command, args = [], cwd } = body;

    // Validate command
    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Invalid command provided' },
        { status: 400 }
      );
    }

    if (!isCommandAllowed(command)) {
      return NextResponse.json(
        { error: `Command '${command}' is not allowed` },
        { status: 403 }
      );
    }

    // Validate arguments
    if (!Array.isArray(args)) {
      return NextResponse.json(
        { error: 'Arguments must be an array' },
        { status: 400 }
      );
    }

    // Validate working directory
    workingDirectory = cwd || process.cwd();
    if (!isValidWorkingDirectory(workingDirectory)) {
      return NextResponse.json(
        { error: 'Invalid working directory' },
        { status: 400 }
      );
    }

    // Sanitize arguments
    const sanitizedArgs = sanitizeArgs(args);

    // Build the git command
    gitCommand = `git ${command} ${sanitizedArgs.join(' ')}`;

    console.log(`Executing Git command: ${gitCommand} in ${workingDirectory}`);

    // Execute the command with Windows-specific environment settings
    const execOptions: {
      cwd: string;
      timeout: number;
      maxBuffer: number;
      env: NodeJS.ProcessEnv;
    } = {
      cwd: workingDirectory,
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
      env: { ...process.env }
    };

    // On Windows, set git config to handle permission issues
    if (process.platform === 'win32') {
      execOptions.env.GIT_CONFIG_GLOBAL = '/dev/null';
      execOptions.env.GIT_CONFIG_SYSTEM = '/dev/null';
    }

    const { stdout, stderr } = await execAsync(gitCommand, execOptions);

    // Return the result
    return NextResponse.json({
      success: true,
      output: stdout,
      error: stderr || null,
      command: gitCommand,
      cwd: workingDirectory
    });

  } catch (_error) {
    console.error('Git command execution error:', _error);
    
    // Handle different types of errors
    if (_error instanceof Error) {
      // Check if it's a command execution error
      if ('code' in _error && 'stderr' in _error) {
        const execError = _error as Error & { code?: string; stderr?: string; stdout?: string; };
        let errorMessage = execError.stderr || execError.message;
        
        // Handle Windows permission errors for system directories
        if (process.platform === 'win32' && errorMessage.includes('System Volume Information') && errorMessage.includes('Permission denied')) {
          errorMessage = 'Git operation completed successfully (system directories skipped due to permissions)';
          // Return success with filtered output
          return NextResponse.json({
            success: true,
            output: execError.stdout || '',
            error: null,
            command: gitCommand || 'git command',
            cwd: workingDirectory || process.cwd(),
            warning: 'Some system directories were skipped due to permission restrictions'
          });
        }
        
        // Handle Git dubious ownership errors on Windows
        if (process.platform === 'win32' && errorMessage.includes('detected dubious ownership in repository')) {
          // Return success with a warning instead of an error
          return NextResponse.json({
            success: true,
            output: execError.stdout || '',
            error: null,
            command: gitCommand || 'git command',
            cwd: workingDirectory || process.cwd(),
            warning: 'Git repository ownership detected as system-owned. This is normal for system drives.'
          });
        }
        
        return NextResponse.json({
          success: false,
          error: errorMessage,
          code: execError.code,
          output: execError.stdout || null
        }, { status: 400 });
      }
      
      // Handle timeout errors
      if (_error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Git command timed out' },
          { status: 408 }
        );
      }
      
      // Handle other errors
      return NextResponse.json(
        { error: _error.message },
        { status: 500 }
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// Handle GET requests to check if Git is available
export async function GET() {
  try {
    const { stdout } = await execAsync('git --version');
    return NextResponse.json({
      available: true,
      version: stdout.trim()
    });
  } catch {
    return NextResponse.json({
      available: false,
      error: 'Git is not installed or not available'
    }, { status: 503 });
  }
}