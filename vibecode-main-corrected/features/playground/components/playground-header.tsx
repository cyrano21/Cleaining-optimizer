"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Save, Settings, FolderOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePlayground } from "../hooks/usePlayground"

export function PlaygroundHeader({ id }: { id?: string }) {
  const { playgroundData } = usePlayground(id || '')
  
  // Placeholder values for now
  const activeFileId = null
  const openFiles: Array<{ id: string; filename: string; fileExtension?: string; hasUnsavedChanges: boolean }> = []
  const handleSave = () => {}
  const handleSaveAll = () => {}
  const [isAISuggestionsEnabled, setIsAISuggestionsEnabled] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [isTerminalVisible, setIsTerminalVisible] = useState(false)

  const selectedFile = activeFileId ? openFiles.find((f) => f.id === activeFileId) : null
  const hasUnsavedChanges = openFiles.some((f) => f.hasUnsavedChanges)

  return (
    <header className="h-14 border-b flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="mr-2" />
        <h1 className="text-lg font-semibold">{playgroundData?.title || "Code Editor"}</h1>
        {playgroundData?.localPath && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            Projet local
          </Badge>
        )}
      </div>

      {selectedFile && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedFile.fileExtension ? `${selectedFile.filename}.${selectedFile.fileExtension}` : selectedFile.filename}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSave()}
            disabled={!selectedFile.hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button size="sm" variant="outline" onClick={handleSaveAll} disabled={!hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
                {isPreviewVisible ? "Hide" : "Show"} Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsTerminalVisible(!isTerminalVisible)}>
                {isTerminalVisible ? "Hide" : "Show"} Terminal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsAISuggestionsEnabled(!isAISuggestionsEnabled)}>
                {isAISuggestionsEnabled ? "Disable" : "Enable"} AI Suggestions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  )
}