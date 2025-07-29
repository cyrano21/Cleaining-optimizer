"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Plus, 
  Minus, 
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'header';
  content: string;
  lineNumber?: {
    old?: number;
    new?: number;
  };
}

interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  lines: DiffLine[];
  oldPath?: string; // For renamed files
}

interface GitDiffViewerProps {
  className?: string;
  filePath?: string;
  staged?: boolean;
  projectPath?: string;
  onStageFile?: (filePath: string) => void;
  onUnstageFile?: (filePath: string) => void;
}

export const GitDiffViewer: React.FC<GitDiffViewerProps> = ({
  className = "",
  filePath,
  staged = false,
  projectPath,
  onStageFile,
  onUnstageFile
}) => {
  const [diff, setDiff] = useState<FileDiff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  const fetchDiff = async () => {
    if (!filePath) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const args = staged 
        ? ['diff', '--cached', filePath]
        : ['diff', filePath];
      
      if (showWhitespace) {
        args.splice(-1, 0, '--ignore-all-space');
      }
      
      const response = await fetch('/api/git/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'diff',
          args: args.slice(1), // Remove 'diff' from args since it's the command
          cwd: projectPath || '/'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch diff: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      const parsedDiff = parseDiffOutput(result.output || '', filePath);
      setDiff(parsedDiff);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diff');
    } finally {
      setLoading(false);
    }
  };

  const parseDiffOutput = (diffOutput: string, path: string): FileDiff => {
    const lines = diffOutput.split('\n');
    const diffLines: DiffLine[] = [];
    let additions = 0;
    let deletions = 0;
    let oldLineNum = 0;
    let newLineNum = 0;
    let status: FileDiff['status'] = 'modified';
    let oldPath: string | undefined;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('diff --git')) {
        // Parse file paths from diff header
        const match = line.match(/diff --git a\/(.*) b\/(.*)/);
        if (match) {
          oldPath = match[1];
          if (oldPath !== match[2]) {
            status = 'renamed';
          }
        }
        continue;
      }
      
      if (line.startsWith('new file mode')) {
        status = 'added';
        continue;
      }
      
      if (line.startsWith('deleted file mode')) {
        status = 'deleted';
        continue;
      }
      
      if (line.startsWith('@@')) {
        // Parse hunk header
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@(.*)/);
        if (match) {
          oldLineNum = parseInt(match[1]) - 1;
          newLineNum = parseInt(match[2]) - 1;
          diffLines.push({
            type: 'header',
            content: line,
          });
        }
        continue;
      }
      
      if (line.startsWith('+')) {
        additions++;
        newLineNum++;
        diffLines.push({
          type: 'added',
          content: line.substring(1),
          lineNumber: { new: newLineNum }
        });
      } else if (line.startsWith('-')) {
        deletions++;
        oldLineNum++;
        diffLines.push({
          type: 'removed',
          content: line.substring(1),
          lineNumber: { old: oldLineNum }
        });
      } else if (line.startsWith(' ')) {
        oldLineNum++;
        newLineNum++;
        diffLines.push({
          type: 'context',
          content: line.substring(1),
          lineNumber: { old: oldLineNum, new: newLineNum }
        });
      }
    }

    return {
      path,
      status,
      additions,
      deletions,
      lines: diffLines,
      oldPath
    };
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLineTypeColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'context':
        return 'bg-gray-50';
      case 'header':
        return 'bg-blue-100 font-medium text-blue-900';
      default:
        return '';
    }
  };

  const toggleSection = (index: number) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index);
    } else {
      newCollapsed.add(index);
    }
    setCollapsedSections(newCollapsed);
  };

  useEffect(() => {
    fetchDiff();
  }, [filePath, staged, showWhitespace, projectPath]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading diff...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading diff</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button onClick={fetchDiff} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!diff || diff.lines.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No changes to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-mono text-sm">
              {diff.oldPath && diff.oldPath !== diff.path 
                ? `${diff.oldPath} → ${diff.path}`
                : diff.path
              }
            </span>
            <Badge className={getStatusColor(diff.status)}>
              {diff.status}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowWhitespace(!showWhitespace)}
            >
              {showWhitespace ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Whitespace
            </Button>
            {onStageFile && onUnstageFile && (
              <Button
                size="sm"
                onClick={() => staged ? onUnstageFile(diff.path) : onStageFile(diff.path)}
              >
                {staged ? (
                  <>
                    <Minus className="h-4 w-4 mr-1" />
                    Unstage
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Stage
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Plus className="h-3 w-3 text-green-600" />
            {diff.additions} additions
          </span>
          <span className="flex items-center gap-1">
            <Minus className="h-3 w-3 text-red-600" />
            {diff.deletions} deletions
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="font-mono text-sm">
            {diff.lines.map((line, index) => {
              const isHeader = line.type === 'header';
              const isCollapsed = collapsedSections.has(index);
              
              return (
                <div key={index}>
                  {isHeader && (
                    <div 
                      className="flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSection(index)}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      <span className="text-blue-700">{line.content}</span>
                    </div>
                  )}
                  
                  {!isHeader && !isCollapsed && (
                    <div className={`flex ${getLineTypeColor(line.type)}`}>
                      <div className="flex-shrink-0 w-16 px-2 py-1 text-xs text-gray-500 text-right border-r">
                        {line.lineNumber?.old || ''}
                      </div>
                      <div className="flex-shrink-0 w-16 px-2 py-1 text-xs text-gray-500 text-right border-r">
                        {line.lineNumber?.new || ''}
                      </div>
                      <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                        {line.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GitDiffViewer;