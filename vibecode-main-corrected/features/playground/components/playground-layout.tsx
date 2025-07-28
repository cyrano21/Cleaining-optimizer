"use client"

import { usePlayground } from "../hooks/usePlayground"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoadingStep from "@/components/ui/loader"
import { PlaygroundEditor } from "./playground-editor"
import { PlaygroundHeader } from "./playground-header"

export function PlaygroundLayout({ id }: { id: string }) {
  const { playgroundData, templateData, isLoading, error } = usePlayground(id)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Try Again
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6 text-center">Loading Playground</h2>
          <div className="mb-8">
            <LoadingStep currentStep={1} step={1} label="Loading playground metadata" />
            <LoadingStep currentStep={2} step={2} label="Loading template structure" />
            <LoadingStep currentStep={3} step={3} label="Ready to explore" />
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!templateData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Loading template data...</h2>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <PlaygroundHeader id={id} />
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">Playground Editor</p>
          <p className="text-sm">Template data loaded successfully</p>
        </div>
      </div>
    </div>
  )
}