import { useState, useEffect, useCallback } from 'react';

interface GitFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked';
  additions?: number;
  deletions?: number;
}

interface GitStatus {
  staged: GitFile[];
  unstaged: GitFile[];
  untracked: GitFile[];
}

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  files?: GitFile[];
}

interface GitBranch {
  name: string;
  current: boolean;
  lastCommit?: string;
}

interface UseGitOperationsReturn {
  status: GitStatus | null;
  branches: GitBranch[] | null;
  commits: GitCommit[] | null;
  currentBranch: string | null;
  loading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  stageFile: (filePath: string) => Promise<void>;
  unstageFile: (filePath: string) => Promise<void>;
  commitChanges: (message: string) => Promise<void>;
  createBranch: (branchName: string) => Promise<void>;
  switchBranch: (branchName: string) => Promise<void>;
  mergeBranch: (branchName: string) => Promise<void>;
}

export const useGitOperations = (projectPath?: string): UseGitOperationsReturn => {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [branches, setBranches] = useState<GitBranch[] | null>(null);
  const [commits, setCommits] = useState<GitCommit[] | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeGitCommand = useCallback(async (command: string, args: string[] = []): Promise<any> => {
    try {
      const response = await fetch('/api/git/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          args,
          cwd: projectPath || '/'
        })
      });

      if (!response.ok) {
        throw new Error(`Git command failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.error && !result.success) {
        // Handle Windows permission errors specifically
        if (result.error.includes('System Volume Information') && result.error.includes('Permission denied')) {
          console.warn('Git: System directory permission warning:', result.error);
          // Return a successful result with empty output instead of throwing
          return {
            success: true,
            output: '',
            error: null,
            warning: 'System directories skipped due to permissions'
          };
        }
        throw new Error(result.error);
      }

      // Log warnings if present (e.g., Windows permission issues)
      if (result.warning) {
        console.warn('Git command warning:', result.warning);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Handle Windows permission errors in network/parsing errors too
      if (errorMessage.includes('System Volume Information') && errorMessage.includes('Permission denied')) {
        console.warn('Git: System directory permission warning:', errorMessage);
        return {
          success: true,
          output: '',
          error: null,
          warning: 'System directories skipped due to permissions'
        };
      }
      
      console.error('Git command error:', err);
      throw err;
    }
  }, [projectPath]);

  const parseGitStatus = (statusOutput: string): GitStatus => {
    const lines = statusOutput.split('\n').filter(line => line.trim());
    const staged: GitFile[] = [];
    const unstaged: GitFile[] = [];
    const untracked: GitFile[] = [];

    lines.forEach(line => {
      if (line.length < 3) return;
      
      const stagedStatus = line[0];
      const unstagedStatus = line[1];
      const filePath = line.substring(3);

      // Parse staged changes
      if (stagedStatus !== ' ' && stagedStatus !== '?') {
        let status: GitFile['status'] = 'modified';
        if (stagedStatus === 'A') status = 'added';
        else if (stagedStatus === 'D') status = 'deleted';
        else if (stagedStatus === 'R') status = 'renamed';
        else if (stagedStatus === 'M') status = 'modified';
        
        staged.push({ path: filePath, status });
      }

      // Parse unstaged changes
      if (unstagedStatus !== ' ') {
        if (unstagedStatus === '?') {
          untracked.push({ path: filePath, status: 'untracked' });
        } else {
          let status: GitFile['status'] = 'modified';
          if (unstagedStatus === 'M') status = 'modified';
          else if (unstagedStatus === 'D') status = 'deleted';
          
          unstaged.push({ path: filePath, status });
        }
      }
    });

    return { staged, unstaged, untracked };
  };

  const parseBranches = (branchOutput: string): GitBranch[] => {
    const lines = branchOutput.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const current = line.startsWith('*');
      const name = line.replace(/^\*?\s+/, '');
      return { name, current };
    });
  };

  const parseCommits = (logOutput: string): GitCommit[] => {
    const commits: GitCommit[] = [];
    const commitBlocks = logOutput.split('\n\n').filter(block => block.trim());
    
    commitBlocks.forEach(block => {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const hash = lines[0].replace('commit ', '');
        const author = lines[1].replace('Author: ', '');
        const date = lines[2].replace('Date: ', '');
        const message = lines.slice(3).join(' ').trim();
        
        commits.push({ hash, author, date, message });
      }
    });
    
    return commits;
  };

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get git status with error handling for Windows permission issues
      const statusResult = await executeGitCommand('status', ['--porcelain']);
      const parsedStatus = parseGitStatus(statusResult.output || '');
      setStatus(parsedStatus);
      
      // Clear any previous errors if status was successful
      if (statusResult.success !== false) {
        setError(null);
      }

      // Get current branch
      const branchResult = await executeGitCommand('branch', ['--show-current']);
      setCurrentBranch(branchResult.output?.trim() || null);

      // Get all branches
      const branchesResult = await executeGitCommand('branch', []);
      const parsedBranches = parseBranches(branchesResult.output || '');
      setBranches(parsedBranches);

      // Get commit history
      const logResult = await executeGitCommand('log', ['--oneline', '-10']);
      const parsedCommits = parseCommits(logResult.output || '');
      setCommits(parsedCommits);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Handle Windows permission errors gracefully
      if (errorMessage.includes('System Volume Information') && errorMessage.includes('Permission denied')) {
        console.warn('Git: Skipping system directories due to permission restrictions');
        // Don't set this as an error, just log it as a warning
        setError(null);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [executeGitCommand]);

  const stageFile = useCallback(async (filePath: string) => {
    try {
      await executeGitCommand('add', [filePath]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stage file');
      throw err;
    }
  }, [executeGitCommand]);

  const unstageFile = useCallback(async (filePath: string) => {
    try {
      await executeGitCommand('reset', ['HEAD', filePath]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unstage file');
      throw err;
    }
  }, [executeGitCommand]);

  const commitChanges = useCallback(async (message: string) => {
    try {
      await executeGitCommand('commit', ['-m', message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit changes');
      throw err;
    }
  }, [executeGitCommand]);

  const createBranch = useCallback(async (branchName: string) => {
    try {
      await executeGitCommand('checkout', ['-b', branchName]);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch');
      throw err;
    }
  }, [executeGitCommand, refreshStatus]);

  const switchBranch = useCallback(async (branchName: string) => {
    try {
      await executeGitCommand('checkout', [branchName]);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch branch');
      throw err;
    }
  }, [executeGitCommand, refreshStatus]);

  const mergeBranch = useCallback(async (branchName: string) => {
    try {
      await executeGitCommand('merge', [branchName]);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge branch');
      throw err;
    }
  }, [executeGitCommand, refreshStatus]);

  // Initialize on mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    status,
    branches,
    commits,
    currentBranch,
    loading,
    error,
    refreshStatus,
    stageFile,
    unstageFile,
    commitChanges,
    createBranch,
    switchBranch,
    mergeBranch
  };
};

export default useGitOperations;