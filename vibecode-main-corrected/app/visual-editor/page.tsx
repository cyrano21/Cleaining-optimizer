'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { VisualEditorLayout } from '@/features/visual-editor/components/visual-editor-layout'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Share,
  Download,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import type { VisualEditorState } from '@/features/visual-editor/types/visual-editor.types'

export default function VisualEditorPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [projectName, setProjectName] = useState('Untitled Project')
  
  const handleSave = useCallback(async (state: VisualEditorState) => {
    setIsSaving(true)
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would typically save to your backend
      console.log('Saving visual editor state:', state)
      
      setLastSaved(new Date())
      
      // You could also save to localStorage for persistence
      localStorage.setItem('visual-editor-state', JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }, [])
  
  const handleExport = useCallback((code: string, format: string) => {
    console.log(`Exporting code in ${format} format:`, code)
    
    // Here you could integrate with your existing playground or file system
    // For example, create a new playground with the generated code
  }, [])
  
  const handleShare = useCallback(() => {
    // Implement sharing functionality
    console.log('Sharing project...')
  }, [])
  
  const handleDownload = useCallback(() => {
    // Implement download functionality
    console.log('Downloading project...')
  }, [])
  
  const [initialState, setInitialState] = useState<Partial<VisualEditorState>>({
    components: [],
    selectedComponentId: null,
    canvas: {
      zoom: 1,
      device: 'desktop' as const,
      gridVisible: true
    },
    mode: 'design' as const
  })
  
  // Load initial state from localStorage on client side only
  useEffect(() => {
    try {
      const saved = localStorage.getItem('visual-editor-state')
      if (saved) {
        const parsedState = JSON.parse(saved)
        setInitialState(parsedState)
      }
    } catch (error) {
      console.error('Failed to load saved state:', error)
    }
  }, [])
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/playground">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Playground
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h1 className="text-lg font-semibold text-gray-900">
                Visual Editor
              </h1>
            </div>
            
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-600">Project:</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-sm font-medium bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-300 focus:rounded px-2 py-1"
              aria-label="Project name"
              placeholder="Enter project name"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSave(initialState as VisualEditorState)}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      
      {/* Visual Editor */}
      <div className="flex-1 overflow-hidden">
        <VisualEditorLayout
          initialState={initialState}
          onSave={handleSave}
          onExport={handleExport}
          showCodeGenerator={true}
          showComponentLibrary={true}
          showPropertyPanel={true}
          showLivePreview={true}
          readOnly={false}
        />
      </div>
      
      {/* Welcome Modal for First-Time Users */}
      {/* You could add a welcome modal here to guide new users */}
    </div>
  )
}