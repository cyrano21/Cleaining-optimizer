"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AIChatSidePanel } from "./ai-chat-sidepanel"
import { ClineAgent } from "./cline-agent"
import { Bot, MessageSquare, Terminal } from "lucide-react"

interface AIChatWithAgentProps {
  isOpen: boolean
  onClose: () => void
  onInsertCode?: (code: string, fileName?: string, position?: { line: number; column: number }) => void
  onRunCode?: (code: string, language: string) => void
  activeFileName?: string
  activeFileContent?: string
  activeFileLanguage?: string
  cursorPosition?: { line: number; column: number }
  theme?: "dark" | "light"
}

export function AIChatWithAgent({
  isOpen,
  onClose,
  onInsertCode,
  onRunCode,
  activeFileName,
  activeFileContent,
  activeFileLanguage,
  cursorPosition,
  theme = "dark"
}: AIChatWithAgentProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "agent">("chat")

  useEffect(() => {
    console.log("🔄 AIChatWithAgent Component Debug:");
    console.log("- Component mounted:", true);
    console.log("- isOpen:", isOpen);
    console.log("- activeTab:", activeTab);
    console.log("- activeFileName:", activeFileName);
    console.log("- theme:", theme);
  }, [isOpen, activeTab, activeFileName, theme]);

  // Component state management

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full max-w-6xl bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <Tabs value={activeTab} onValueChange={(value) => {
        console.log("🔀 Switching tab to:", value);
        setActiveTab(value as "chat" | "agent")
      }} className="h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                <Bot className="h-6 w-6 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  AI Assistant & Cline Agent
                </h2>
                <p className="text-sm text-zinc-400">
                  {activeFileName
                    ? `Working on ${activeFileName}`
                    : "Ready to help with your code"}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-2 max-w-md bg-zinc-800 border border-zinc-700">
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-2 text-zinc-100 data-[state=active]:bg-zinc-700 data-[state=active]:text-white hover:bg-zinc-700/50 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger 
                value="agent" 
                className="flex items-center gap-2 text-zinc-100 data-[state=active]:bg-zinc-700 data-[state=active]:text-white hover:bg-zinc-700/50 transition-colors"
              >
                <Terminal className="h-4 w-4" />
                Cline Agent
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0">
            <AIChatSidePanel
              isOpen={true}
              onClose={onClose}
              onInsertCode={onInsertCode}
              onRunCode={onRunCode}
              activeFileName={activeFileName}
              activeFileContent={activeFileContent}
              activeFileLanguage={activeFileLanguage}
              cursorPosition={cursorPosition}
              theme={theme}
            />
          </TabsContent>
          
          <TabsContent value="agent" className="h-full m-0">
            <div className="h-full p-4 bg-zinc-950">
              <ClineAgent
                currentFile={activeFileName}
                projectStructure={{
                  name: "current-project",
                  files: activeFileName ? [activeFileName] : []
                }}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
