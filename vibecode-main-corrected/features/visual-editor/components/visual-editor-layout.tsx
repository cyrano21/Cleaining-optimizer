'use client'

import React, { useState, useCallback } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Layout,
  Palette,
  Code,
  Eye,
  Settings,
  Layers,
  Package,
  Save,
  Undo,
  Redo,
  Play,
  Square,
  MoreHorizontal,
  Maximize2,
  Minimize2
} from 'lucide-react'

import { VisualEditor } from './visual-editor'
import { ComponentLibrary } from './component-library'
import { PropertyPanel } from './property-panel'
import { LivePreview } from './live-preview'
import { CodeGeneratorComponent } from './code-generator'
import { useVisualEditor } from '../hooks/useVisualEditor'
import type { 
  VisualComponent, 
  ComponentLibraryItem, 
  DevicePreset,
  VisualEditorState 
} from '../types/visual-editor.types'

interface VisualEditorLayoutProps {
  initialState?: Partial<VisualEditorState>
  onSave?: (state: VisualEditorState) => void
  onExport?: (code: string, format: string) => void
  className?: string
  showCodeGenerator?: boolean
  showComponentLibrary?: boolean
  showPropertyPanel?: boolean
  showLivePreview?: boolean
  readOnly?: boolean
}

const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'mobile',
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: 'smartphone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'tablet',
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'desktop',
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: 'monitor',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
]

export function VisualEditorLayout({
  initialState,
  onSave,
  onExport,
  className = '',
  showCodeGenerator = true,
  showComponentLibrary = true,
  showPropertyPanel = true,
  showLivePreview = true,
  readOnly = false
}: VisualEditorLayoutProps) {
  const {
    state,
    selectedComponent,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    duplicateComponent,
    undo,
    redo,
    canUndo,
    canRedo,
    generateCode,
    saveState,
    loadState
  } = useVisualEditor('', { initialState })
  
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[2]) // Desktop by default
  const [activePanel, setActivePanel] = useState<'library' | 'properties' | 'code'>('library')
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  
  // Component Library Handlers
  const handleComponentSelect = useCallback((component: ComponentLibraryItem) => {
    const newComponent: VisualComponent = {
      id: `${component.id}_${Date.now()}`,
      type: component.template.type,
      name: component.name,
      props: component.template.props || {},
      children: component.template.children || [],
      styles: {},
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      visible: true,
      locked: false,
      zIndex: state?.components?.length || 0
    }
    
    addComponent(newComponent)
  }, [addComponent, state?.components?.length])
  
  const handleComponentDrag = useCallback((component: ComponentLibraryItem, event: React.DragEvent) => {
    // Handle drag start for component library items
    event.dataTransfer.setData('application/json', JSON.stringify(component))
    event.dataTransfer.effectAllowed = 'copy'
  }, [])
  
  // Property Panel Handlers
  const handlePropertyChange = useCallback((componentId: string, property: string, value: any) => {
    updateComponent(componentId, { [property]: value })
  }, [updateComponent])
  
  const handleStyleChange = useCallback((componentId: string, property: string, value: string) => {
    const component = state?.components?.find(c => c.id === componentId)
    if (component) {
      const newStyles = { ...component.styles, [property]: value }
      updateComponent(componentId, { styles: newStyles })
    }
  }, [state?.components, updateComponent])
  
  const handleComponentDelete = useCallback((componentId: string) => {
    deleteComponent(componentId)
  }, [deleteComponent])
  
  const handleComponentDuplicate = useCallback((componentId: string) => {
    duplicateComponent(componentId)
  }, [duplicateComponent])
  
  const handleComponentToggleVisibility = useCallback((componentId: string) => {
    const component = state?.components?.find(c => c.id === componentId)
    if (component) {
      updateComponent(componentId, { visible: !component.visible })
    }
  }, [state?.components, updateComponent])
  
  // Code Generator Handlers
  const handleCodeGenerate = useCallback((code: string, format: string) => {
    onExport?.(code, format)
  }, [onExport])
  
  const handleCodeCopy = useCallback((code: string) => {
    // Handle code copy (could show toast notification)
    console.log('Code copied to clipboard')
  }, [])
  
  const handleCodeDownload = useCallback((code: string, filename: string) => {
    // Handle code download (could show toast notification)
    console.log(`Code downloaded as ${filename}`)
  }, [])
  
  // Visual Editor Handlers
  const handleCanvasDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    
    try {
      const componentData = JSON.parse(event.dataTransfer.getData('application/json'))
      
      if (componentData && componentData.template) {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        const newComponent: VisualComponent = {
          id: `${componentData.id}_${Date.now()}`,
          type: componentData.template.type,
          name: componentData.name,
          props: componentData.template.props || {},
          children: componentData.template.children || [],
          styles: {},
          position: { x, y },
          size: { width: 200, height: 100 },
          visible: true,
          locked: false,
          zIndex: state?.components?.length || 0
        }
        
        addComponent(newComponent)
      }
    } catch (error) {
      console.error('Failed to parse dropped component:', error)
    }
  }, [addComponent, state?.components?.length])
  
  const handleSave = useCallback(() => {
    saveState()
    onSave?.(state)
  }, [saveState, onSave, state])
  
  const handleDeviceChange = useCallback((device: DevicePreset) => {
    setSelectedDevice(device)
  }, [])
  
  const generatedCode = generateCode('react')
  
  return (
    <div className={`h-screen flex flex-col bg-gray-50 ${className}`}>
      {/* Header Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Visual Editor</span>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo || readOnly}
              className="h-8 w-8 p-0"
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo || readOnly}
              className="h-8 w-8 p-0"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {state?.components?.length || 0} component{(state?.components?.length || 0) !== 1 ? 's' : ''}
            </Badge>
            
            {selectedComponent && (
              <Badge variant="outline" className="text-xs">
                {selectedComponent.name || selectedComponent.type}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="h-8"
          >
            <Package className="h-4 w-4" />
            <span className="ml-1 text-xs">Library</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="h-8"
          >
            <Settings className="h-4 w-4" />
            <span className="ml-1 text-xs">Properties</span>
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
            className="h-8"
          >
            {isPreviewMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={readOnly}
            className="h-8"
          >
            <Save className="h-4 w-4" />
            <span className="ml-1 text-xs">Save</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="h-8"
          >
            <Play className="h-4 w-4" />
            <span className="ml-1 text-xs">Preview</span>
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Component Library */}
          {showComponentLibrary && !leftPanelCollapsed && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="h-full bg-white border-r border-gray-200">
                  <ComponentLibrary
                    onComponentSelect={handleComponentSelect}
                    onComponentDrag={handleComponentDrag}
                    showCategories={true}
                    showPreview={true}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}
          
          {/* Center Panel - Visual Editor and Preview */}
          <ResizablePanel defaultSize={isPreviewMaximized ? 100 : 50} minSize={30}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Visual Editor Canvas */}
              <ResizablePanel defaultSize={showLivePreview && !isPreviewMaximized ? 60 : 100} minSize={30}>
                <div className="h-full bg-white">
                  <VisualEditor
                    components={state?.components || []}
                    selectedComponent={selectedComponent}
                    onComponentSelect={selectComponent}
                    onComponentUpdate={updateComponent}
                    onComponentMove={moveComponent}
                    onComponentDelete={deleteComponent}
                    onCanvasDrop={handleCanvasDrop}
                    readOnly={readOnly}
                    showGrid={true}
                    showRulers={true}
                    snapToGrid={true}
                    gridSize={10}
                  />
                </div>
              </ResizablePanel>
              
              {/* Live Preview */}
              {showLivePreview && !isPreviewMaximized && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="h-full bg-gray-50">
                      <LivePreview
                        code={generatedCode}
                        selectedDevice={selectedDevice}
                        onDeviceChange={handleDeviceChange}
                        showDeviceSelector={true}
                        showRefreshButton={true}
                        autoRefresh={true}
                        refreshDelay={1000}
                      />
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
          
          {/* Right Panel - Properties and Code */}
          {(showPropertyPanel || showCodeGenerator) && !rightPanelCollapsed && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full bg-white border-l border-gray-200">
                  <ResizablePanelGroup direction="vertical" className="h-full">
                    {/* Property Panel */}
                    {showPropertyPanel && (
                      <ResizablePanel defaultSize={showCodeGenerator ? 60 : 100} minSize={30}>
                        <PropertyPanel
                          selectedComponent={selectedComponent}
                          onPropertyChange={handlePropertyChange}
                          onStyleChange={handleStyleChange}
                          onComponentDelete={handleComponentDelete}
                          onComponentDuplicate={handleComponentDuplicate}
                          onComponentToggleVisibility={handleComponentToggleVisibility}
                          showAdvancedProperties={true}
                        />
                      </ResizablePanel>
                    )}
                    
                    {/* Code Generator */}
                    {showCodeGenerator && showPropertyPanel && (
                      <>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={40} minSize={20}>
                          <CodeGeneratorComponent
                            components={state?.components || []}
                            selectedComponent={selectedComponent}
                            onCodeGenerate={handleCodeGenerate}
                            onCodeCopy={handleCodeCopy}
                            onCodeDownload={handleCodeDownload}
                            showPreview={false}
                            defaultFormat="react"
                          />
                        </ResizablePanel>
                      </>
                    )}
                    
                    {/* Code Generator Only */}
                    {showCodeGenerator && !showPropertyPanel && (
                      <ResizablePanel defaultSize={100}>
                        <CodeGeneratorComponent
                          components={state?.components || []}
                          selectedComponent={selectedComponent}
                          onCodeGenerate={handleCodeGenerate}
                          onCodeCopy={handleCodeCopy}
                          onCodeDownload={handleCodeDownload}
                          showPreview={true}
                          defaultFormat="react"
                        />
                      </ResizablePanel>
                    )}
                  </ResizablePanelGroup>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
      
      {/* Status Bar */}
      <div className="h-8 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>•</span>
          <span>{state?.components?.length || 0} components</span>
          {selectedComponent && (
            <>
              <span>•</span>
              <span>Selected: {selectedComponent.name || selectedComponent.type}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span>Device: {selectedDevice.name}</span>
          <span>•</span>
          <span>Zoom: 100%</span>
          <span>•</span>
          <span>Grid: 10px</span>
        </div>
      </div>
    </div>
  )
}

export default VisualEditorLayout