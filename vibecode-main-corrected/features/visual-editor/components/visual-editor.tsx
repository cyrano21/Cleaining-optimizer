"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import {
  Palette,
  Code,
  Eye,
  Layers,
  MousePointer,
  Square,
  Type,
  Image,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Undo,
  Redo,
  Save,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ComponentBuilder } from './component-builder'
import { CSSVisualEditor } from './css-visual-editor'
import { LivePreviewSync } from './live-preview-sync'
import { useVisualEditor } from '../hooks/useVisualEditor'
import { useLivePreview } from '../hooks/useLivePreview'
import type { VisualComponent, VisualEditorState } from '../types/visual-editor.types'

interface VisualEditorProps {
  initialCode?: string
  onCodeChange?: (code: string) => void
  className?: string
}

const DEVICE_PRESETS = {
  mobile: { width: 375, height: 667, name: 'Mobile', icon: Smartphone },
  tablet: { width: 768, height: 1024, name: 'Tablet', icon: Tablet },
  desktop: { width: 1200, height: 800, name: 'Desktop', icon: Monitor }
}

const COMPONENT_LIBRARY = [
  {
    id: 'button',
    name: 'Button',
    icon: Square,
    category: 'Basic',
    template: `<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">\n  Click me\n</button>`
  },
  {
    id: 'card',
    name: 'Card',
    icon: Layout,
    category: 'Layout',
    template: `<div className="bg-white rounded-lg shadow-md p-6">\n  <h3 className="text-lg font-semibold mb-2">Card Title</h3>\n  <p className="text-gray-600">Card content goes here.</p>\n</div>`
  },
  {
    id: 'text',
    name: 'Text',
    icon: Type,
    category: 'Basic',
    template: `<p className="text-gray-800">Your text here</p>`
  },
  {
    id: 'image',
    name: 'Image',
    icon: Image,
    category: 'Media',
    template: `<img src="https://via.placeholder.com/300x200" alt="Placeholder" className="rounded-lg" />`
  },
  {
    id: 'container',
    name: 'Container',
    icon: Layout,
    category: 'Layout',
    template: `<div className="container mx-auto px-4">\n  <!-- Content goes here -->\n</div>`
  },
  {
    id: 'grid',
    name: 'Grid',
    icon: Layers,
    category: 'Layout',
    template: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n  <!-- Grid items go here -->\n</div>`
  }
]

export function VisualEditor({ initialCode = '', onCodeChange, className }: VisualEditorProps) {
  const [activeDevice, setActiveDevice] = useState<keyof typeof DEVICE_PRESETS>('desktop')
  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'preview'>('design')
  const [selectedComponent, setSelectedComponent] = useState<VisualComponent | null>(null)
  const [isGridVisible, setIsGridVisible] = useState(true)
  const [zoom, setZoom] = useState(100)
  
  const {
    editorState,
    components,
    history,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    undo,
    redo,
    canUndo,
    canRedo,
    generateCode,
    importCode
  } = useVisualEditor(initialCode)
  
  const {
    previewRef,
    isPreviewLoading,
    previewError,
    refreshPreview,
    syncWithCode
  } = useLivePreview()
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null)
  
  // Sync code changes with parent component
  useEffect(() => {
    const code = generateCode()
    onCodeChange?.(code)
  }, [components, generateCode, onCodeChange])
  
  // Handle component drag and drop
  const handleDragStart = useCallback((componentId: string) => {
    setDraggedComponent(componentId)
    setIsDragging(true)
  }, [])
  
  const handleDragEnd = useCallback(() => {
    setDraggedComponent(null)
    setIsDragging(false)
  }, [])
  
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    if (!draggedComponent || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const componentTemplate = COMPONENT_LIBRARY.find(c => c.id === draggedComponent)
    if (componentTemplate) {
      addComponent({
        id: `${draggedComponent}-${Date.now()}`,
        type: draggedComponent,
        name: componentTemplate.name,
        template: componentTemplate.template,
        position: { x, y },
        size: { width: 200, height: 100 },
        styles: {},
        props: {}
      })
    }
    
    handleDragEnd()
  }, [draggedComponent, addComponent, handleDragEnd])
  
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])
  
  const currentDevice = DEVICE_PRESETS[activeDevice]
  
  return (
    <div className={cn('h-full flex flex-col bg-gray-50', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-500" />
            Visual Editor
          </h2>
          
          {/* Device Selector */}
          <div className="flex items-center space-x-2">
            {Object.entries(DEVICE_PRESETS).map(([key, device]) => {
              const Icon = device.icon
              return (
                <Button
                  key={key}
                  variant={activeDevice === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveDevice(key as keyof typeof DEVICE_PRESETS)}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-4 w-4" />
                  {device.name}
                </Button>
              )
            })}
          </div>
          
          {/* Zoom Control */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              disabled={zoom <= 25}
            >
              -
            </Button>
            <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              disabled={zoom >= 200}
            >
              +
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* History Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-1"
          >
            <Undo className="h-4 w-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center gap-1"
          >
            <Redo className="h-4 w-4" />
            Redo
          </Button>
          
          {/* View Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGridVisible(!isGridVisible)}
            className={cn('flex items-center gap-1', isGridVisible && 'bg-blue-50')}
          >
            <Layers className="h-4 w-4" />
            Grid
          </Button>
          
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const code = generateCode()
              navigator.clipboard.writeText(code)
              // toast.success('Code copied to clipboard!')
            }}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Component Library */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full bg-white border-r">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm text-gray-700">Components</h3>
              </div>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-4 space-y-4">
                  {Object.entries(
                    COMPONENT_LIBRARY.reduce((acc, component) => {
                      if (!acc[component.category]) acc[component.category] = []
                      acc[component.category].push(component)
                      return acc
                    }, {} as Record<string, typeof COMPONENT_LIBRARY>)
                  ).map(([category, components]) => (
                    <div key={category}>
                      <h4 className="text-xs font-medium text-gray-500 mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {components.map((component) => {
                          const Icon = component.icon
                          return (
                            <div
                              key={component.id}
                              draggable
                              onDragStart={() => handleDragStart(component.id)}
                              onDragEnd={handleDragEnd}
                              className="p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                            >
                              <Icon className="h-6 w-6 text-gray-600 mb-1" />
                              <span className="text-xs text-gray-700">{component.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Canvas Area */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full bg-gray-100 relative">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full">
                <div className="flex items-center justify-between p-4 bg-white border-b">
                  <TabsList>
                    <TabsTrigger value="design" className="flex items-center gap-1">
                      <MousePointer className="h-4 w-4" />
                      Design
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  
                  <Badge variant="outline">
                    {currentDevice.width} × {currentDevice.height}
                  </Badge>
                </div>
                
                <TabsContent value="design" className="h-[calc(100%-80px)] m-0">
                  <div className="h-full flex items-center justify-center p-8">
                    <div
                      ref={canvasRef}
                      className={cn(
                        'bg-white rounded-lg shadow-lg relative overflow-hidden',
                        isGridVisible && 'bg-grid-pattern'
                      )}
                      style={{
                        width: currentDevice.width * (zoom / 100),
                        height: currentDevice.height * (zoom / 100),
                        transform: `scale(${zoom / 100})`
                      }}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <ComponentBuilder
                        components={components}
                        selectedComponent={selectedComponent}
                        onSelectComponent={setSelectedComponent}
                        onUpdateComponent={updateComponent}
                        onDeleteComponent={deleteComponent}
                        zoom={zoom}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="code" className="h-[calc(100%-80px)] m-0">
                  <div className="h-full p-4">
                    <div className="h-full bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-auto">
                      <pre>{generateCode()}</pre>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="h-[calc(100%-80px)] m-0">
                  <LivePreviewSync
                    ref={previewRef}
                    code={generateCode()}
                    isLoading={isPreviewLoading}
                    error={previewError}
                    onRefresh={refreshPreview}
                    deviceSize={currentDevice}
                    zoom={zoom}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Properties Panel */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full bg-white border-l">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm text-gray-700">
                  {selectedComponent ? 'Properties' : 'No Selection'}
                </h3>
              </div>
              {selectedComponent && (
                <ScrollArea className="h-[calc(100%-60px)]">
                  <CSSVisualEditor
                    component={selectedComponent}
                    onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
                  />
                </ScrollArea>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default VisualEditor