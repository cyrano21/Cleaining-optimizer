// Git Components
export { GitExplorer } from './components/git-explorer';
export { GitDiffViewer } from './components/git-diff-viewer';

// Git Hooks
export { useGitOperations } from './hooks/useGitOperations';

// Types
export type {
  GitFile,
  GitStatus,
  GitCommit,
  GitBranch
} from './hooks/useGitOperations';

// Re-export default components
export { default as GitExplorerDefault } from './components/git-explorer';
export { default as GitDiffViewerDefault } from './components/git-diff-viewer';
export { default as useGitOperationsDefault } from './hooks/useGitOperations';