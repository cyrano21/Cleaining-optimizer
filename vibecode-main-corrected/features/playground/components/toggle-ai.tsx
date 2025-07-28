"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { 
  Bot, 
  Code,
  FileText, 
  Import,
  Loader2,
  Power,
  PowerOff,
  X
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { AIChatWithAgent } from "@/features/ai-chat/components/ai-chat-with-agent";
import { useFileExplorer } from "@/features/playground/hooks/useFileExplorer";


interface ToggleAIProps {
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
  
  suggestionLoading: boolean;
  loadingProgress?: number;
  activeFeature?: string;
}

const ToggleAI: React.FC<ToggleAIProps> = ({
  isEnabled,
  onToggle,

  suggestionLoading,
  loadingProgress = 0,
  activeFeature,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    console.log("🔍 ToggleAI Component Debug:");
    console.log("- Component mounted:", true);
    console.log("- isEnabled:", isEnabled);
    console.log("- suggestionLoading:", suggestionLoading);
    console.log("- loadingProgress:", loadingProgress);
    console.log("- isChatOpen:", isChatOpen);
    console.log("- AIChatWithAgent component available:", !!AIChatWithAgent);
  }, [isEnabled, suggestionLoading, loadingProgress, isChatOpen]);

  // Dummy handler for code insertion from AI chat panel
  const handleInsertCode = (code: string, fileName?: string, position?: { line: number; column: number }) => {
    // TODO: Implement actual code insertion logic
    // For now, just log the code and info
    console.log("Insert code:", { code, fileName, position });
    // You can add your integration with the editor here
  };

  // Dummy handler for running code from AI chat panel
  const handleRunCode = (code: string, language: string) => {
    console.log("Run code:", { code, language });
  };

  // Get the actual active file from the file explorer state
  const { openFiles, activeFileId, editorContent } = useFileExplorer();
  const activeFile = openFiles.find(file => file.id === activeFileId);
  const cursorPosition = { line: 1, column: 1 };
  
  // Prepare file data for AI chat
  const activeFileData = activeFile ? {
    name: `${activeFile.filename}.${activeFile.fileExtension}`,
    content: activeFile.content || editorContent
  } : null;

  return (
    <Drawer open={isChatOpen} onOpenChange={setIsChatOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm" 
            variant={isEnabled ? "default" : "outline"}
            className={cn(
              "relative gap-2 h-8 px-3 text-sm font-medium transition-all duration-200",
              isEnabled 
                ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-50 border-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200" 
                : "bg-background hover:bg-accent text-foreground border-border",
              suggestionLoading && "opacity-75"
            )}
            onClick={(e) => e.preventDefault()}
          >
            {suggestionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            <span>AI</span>
            {isEnabled ? (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                isEnabled 
                  ? "bg-zinc-900 text-zinc-50 border-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-200" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isEnabled ? "Active" : "Inactive"}
            </Badge>
          </DropdownMenuLabel>
          
          {suggestionLoading && activeFeature && (
            <div className="px-3 pb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{activeFeature}</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <Progress 
                  value={loadingProgress} 
                  className="h-1.5"
                />
              </div>
            </div>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => onToggle(!isEnabled)}
            className="py-2.5 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {isEnabled ? (
                  <Power className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <PowerOff className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <div className="text-sm font-medium">
                    {isEnabled ? "Disable" : "Enable"} AI
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Toggle AI assistance
                  </div>
                </div>
              </div>
              <div className={cn(
                "w-8 h-4 rounded-full border transition-all duration-200 relative",
                isEnabled 
                  ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-50 dark:border-zinc-50" 
                  : "bg-muted border-border"
              )}>
                <div className={cn(
                  "w-3 h-3 rounded-full bg-background transition-all duration-200 absolute top-0.5",
                  isEnabled ? "left-4" : "left-0.5"
                )} />
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => {
              console.log("🚀 Opening AI Chat Panel");
              setIsChatOpen(true);
            }}
            className="py-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Open Chat</div>
                <div className="text-xs text-muted-foreground">
                  Chat with AI assistant
                </div>
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1">
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 h-8"
                onClick={() => console.log("🎯 Quick Chat Access")}
              >
                <Bot className="h-4 w-4" />
                Quick Chat
              </Button>
            </DrawerTrigger>
          </div>
          
          <DropdownMenuItem 
            onClick={() => {
              console.log("💻 Generate Code Snippet");
              // TODO: Implement code generation feature
            }}
            className="py-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <Code className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Generate Code</div>
                <div className="text-xs text-muted-foreground">
                  AI code generation
                </div>
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              console.log("📥 Import AI Suggestions");
              // TODO: Implement import suggestions feature
            }}
            className="py-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <Import className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Import Suggestions</div>
                <div className="text-xs text-muted-foreground">
                  Smart import recommendations
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant Chat
                </DrawerTitle>
                <DrawerDescription>
                  Interact with your AI coding assistant
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 overflow-hidden">
            <AIChatWithAgent
              isOpen={isChatOpen}
              onClose={() => {
                console.log("❌ Closing AI Chat Panel");
                setIsChatOpen(false);
              }}
              onInsertCode={handleInsertCode}
              onRunCode={handleRunCode}
              activeFileName={activeFileData?.name}
              activeFileContent={activeFileData?.content}
              activeFileLanguage="TypeScript"
              cursorPosition={cursorPosition}
              theme="dark"
            />
          </div>
          
          <DrawerFooter className="border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>AI Assistant • Powered by Claude</span>
              <DrawerClose asChild>
                <Button variant="outline" size="sm">
                  Close Chat
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
    </Drawer>
  );
};

export default ToggleAI;
