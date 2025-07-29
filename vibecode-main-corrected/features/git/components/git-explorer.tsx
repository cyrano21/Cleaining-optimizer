"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Plus, 
  Minus, 
  FileText, 
  RefreshCw,
  Clock,
  User
} from 'lucide-react';
import { useGitOperations } from '../hooks/useGitOperations';

interface GitFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked';
  additions?: number;
  deletions?: number;
}

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: GitFile[];
}

interface GitBranch {
  name: string;
  current: boolean;
  lastCommit?: string;
}

interface GitExplorerProps {
  className?: string;
  projectPath?: string;
}

export const GitExplorer: React.FC<GitExplorerProps> = ({ 
  className = "", 
  projectPath 
}) => {
  const [activeTab, setActiveTab] = useState<'changes' | 'history' | 'branches'>('changes');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [showNewBranchInput, setShowNewBranchInput] = useState(false);
  
  const {
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
    switchBranch
  } = useGitOperations(projectPath);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'modified':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'deleted':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'renamed':
        return <GitMerge className="h-4 w-4 text-purple-500" />;
      case 'untracked':
        return <Plus className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'bg-green-100 text-green-800';
      case 'modified':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'renamed':
        return 'bg-purple-100 text-purple-800';
      case 'untracked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileToggle = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const handleStageSelected = async () => {
    for (const filePath of selectedFiles) {
      await stageFile(filePath);
    }
    setSelectedFiles(new Set());
    refreshStatus();
  };

  const handleCommit = async () => {
    if (commitMessage.trim()) {
      await commitChanges(commitMessage);
      setCommitMessage('');
      refreshStatus();
    }
  };

  const handleCreateBranch = async () => {
    if (newBranchName.trim()) {
      try {
        await createBranch(newBranchName.trim());
        setNewBranchName('');
        setShowNewBranchInput(false);
        refreshStatus();
      } catch (error) {
        console.error('Failed to create branch:', error);
      }
    }
  };

  const handleNewBranchClick = () => {
    setShowNewBranchInput(true);
  };

  const renderChangesTab = () => (
    <div className="space-y-4">
      {/* Staging Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Staged Changes</h3>
          <Button 
            size="sm" 
            variant="outline"
            onClick={refreshStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <ScrollArea className="h-32 border rounded-md p-2">
          {status?.staged && status.staged.length > 0 ? (
            status.staged.map((file) => (
              <div key={file.path} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(file.status)}
                  <span className="text-sm">{file.path}</span>
                  <Badge className={getStatusColor(file.status)}>
                    {file.status}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => unstageFile(file.path)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No staged changes</p>
          )}
        </ScrollArea>
      </div>

      <Separator />

      {/* Working Directory */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Working Directory</h3>
          {selectedFiles.size > 0 && (
            <Button size="sm" onClick={handleStageSelected}>
              Stage Selected ({selectedFiles.size})
            </Button>
          )}
        </div>
        <ScrollArea className="h-48 border rounded-md p-2">
          {status?.unstaged?.length ? (
            status.unstaged.map((file) => (
              <div key={file.path} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.path)}
                    onChange={() => handleFileToggle(file.path)}
                    className="rounded"
                    aria-label={`Select ${file.path}`}
                  />
                  {getStatusIcon(file.status)}
                  <span className="text-sm">{file.path}</span>
                  <Badge className={getStatusColor(file.status)}>
                    {file.status}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => stageFile(file.path)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No changes</p>
          )}
        </ScrollArea>
      </div>

      {/* Commit Section */}
      {status?.staged && status.staged.length > 0 && (
        <div className="space-y-2">
          <Separator />
          <div>
            <label className="text-sm font-medium">Commit Message</label>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter commit message..."
              className="w-full mt-1 p-2 border rounded-md text-sm"
              rows={3}
            />
            <Button 
              onClick={handleCommit}
              disabled={!commitMessage.trim()}
              className="mt-2 w-full"
            >
              <GitCommit className="h-4 w-4 mr-2" />
              Commit Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <ScrollArea className="h-96">
      <div className="space-y-2">
        {commits?.map((commit) => (
          <Card key={commit.hash} className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{commit.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{commit.author}</span>
                  <Clock className="h-3 w-3" />
                  <span>{commit.date}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {commit.hash.substring(0, 7)}
                  </Badge>
                  {commit.files && (
                    <span className="text-xs text-muted-foreground">
                      {commit.files.length} file(s) changed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )) || (
          <p className="text-sm text-muted-foreground text-center py-8">
            No commit history available
          </p>
        )}
      </div>
    </ScrollArea>
  );

  const renderBranchesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Branches</h3>
        <Button size="sm" variant="outline" onClick={handleNewBranchClick}>
          <Plus className="h-4 w-4 mr-1" />
          New Branch
        </Button>
      </div>
      {showNewBranchInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="Enter branch name"
            className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateBranch();
              } else if (e.key === 'Escape') {
                setShowNewBranchInput(false);
                setNewBranchName('');
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleCreateBranch} disabled={!newBranchName.trim()}>
            Create
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setShowNewBranchInput(false);
              setNewBranchName('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      <ScrollArea className="h-64">
        <div className="space-y-1">
          {branches?.map((branch) => (
            <div 
              key={branch.name}
              className={`flex items-center justify-between p-2 rounded-md ${
                branch.current ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <GitBranch className={`h-4 w-4 ${
                  branch.current ? 'text-blue-600' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  branch.current ? 'font-medium text-blue-900' : ''
                }`}>
                  {branch.name}
                </span>
                {branch.current && (
                  <Badge className="bg-blue-100 text-blue-800">current</Badge>
                )}
              </div>
              {!branch.current && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => switchBranch(branch.name)}
                >
                  Switch
                </Button>
              )}
            </div>
          )) || (
            <p className="text-sm text-muted-foreground text-center py-8">
              No branches available
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading Git information</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button onClick={refreshStatus} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Git Explorer
          {currentBranch && (
            <Badge variant="outline">{currentBranch}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          {[
            { key: 'changes', label: 'Changes', icon: GitCommit },
            { key: 'history', label: 'History', icon: Clock },
            { key: 'branches', label: 'Branches', icon: GitBranch }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'changes' | 'history' | 'branches')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'changes' && renderChangesTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'branches' && renderBranchesTab()}
      </CardContent>
    </Card>
  );
};

export default GitExplorer;