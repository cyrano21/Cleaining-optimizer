"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  Move,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { VisualComponent } from '../types/visual-editor.types'

interface ComponentBuilderProps {
  components: VisualComponent[]
  selectedComponent: VisualComponent | null
  onSelectComponent: (component: VisualComponent | null) => void
  onUpdateComponent: (id: string, updates: Partial<VisualComponent>) => void
  onDeleteComponent: (id: string) => void
  zoom: number
}

interface ComponentItemProps {
  component: VisualComponent
  isSelected: boolean
  zoom: number
  onSelect: () => void
  onUpdate: (updates: Partial<VisualComponent>) => void
  onDelete: () => void
  onDuplicate: () => void
}

function ComponentItem({
  component,
  isSelected,
  zoom,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate
}: ComponentItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', component.id)
    e.dataTransfer.effectAllowed = 'move'
  }, [component.id])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLocked) {
      onSelect()
    }
  }, [isLocked, onSelect])

  const toggleVisibility = useCallback(() => {
    const newVisibility = !isVisible
    setIsVisible(newVisibility)
    onUpdate({ 
      styles: { 
        ...component.styles, 
        display: newVisibility ? 'block' : 'none' 
      } 
    })
  }, [isVisible, onUpdate, component.styles])

  const toggleLock = useCallback(() => {
    setIsLocked(!isLocked)
  }, [isLocked])

  const componentStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
    left: component.position.x * zoom,
    top: component.position.y * zoom,
    width: component.size.width,
    height: component.size.height,
    opacity: isDragging ? 0.5 : 1,
    display: isVisible ? 'block' : 'none',
    ...component.styles
  }

  return (
    <div
      ref={dragRef}
      className={cn(
        "absolute border-2 border-dashed border-transparent cursor-pointer transition-all duration-200",
        isSelected && "border-blue-500 bg-blue-50/20",
        isDragging && "z-50",
        isLocked && "cursor-not-allowed"
      )}
      style={componentStyle}
      draggable={!isLocked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      {/* Component Content */}
      <div 
        className="w-full h-full relative"
        dangerouslySetInnerHTML={{ __html: component.template }}
      />
      
      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Selection Handles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full" />
          
          {/* Component Info */}
          <div className="absolute -top-8 left-0 flex items-center gap-1">
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {component.name}
            </Badge>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleVisibility()
                }}
              >
                {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLock()
                }}
              >
                {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32">
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-3 w-3 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ComponentBuilder({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  zoom
}: ComponentBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not on a component
    if (e.target === e.currentTarget) {
      onSelectComponent(null)
    }
  }, [onSelectComponent])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const componentId = e.dataTransfer.getData('text/plain')
    const rect = canvasRef.current?.getBoundingClientRect()
    
    if (rect && componentId) {
      const x = (e.clientX - rect.left) / zoom
      const y = (e.clientY - rect.top) / zoom
      
      onUpdateComponent(componentId, {
        position: { x, y }
      })
    }
  }, [zoom, onUpdateComponent])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDuplicateComponent = useCallback((component: VisualComponent) => {
    const duplicatedComponent: VisualComponent = {
      ...component,
      id: `${component.id}_copy_${Date.now()}`,
      position: {
        x: component.position.x + 20,
        y: component.position.y + 20
      }
    }
    
    // This would need to be handled by the parent component
    // For now, we'll just update the position of the original
    onUpdateComponent(component.id, {
      position: {
        x: component.position.x + 20,
        y: component.position.y + 20
      }
    })
  }, [onUpdateComponent])

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-white overflow-hidden"
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`
        }}
      />
      
      {/* Components */}
      {components.map((component) => (
        <ComponentItem
          key={component.id}
          component={component}
          isSelected={selectedComponent?.id === component.id}
          zoom={zoom}
          onSelect={() => onSelectComponent(component)}
          onUpdate={(updates) => onUpdateComponent(component.id, updates)}
          onDelete={() => onDeleteComponent(component.id)}
          onDuplicate={() => handleDuplicateComponent(component)}
        />
      ))}
      
      {/* Drop Zone Indicator */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          {components.length === 0 && (
            <div className="text-center text-gray-500">
              <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Drag components here to start building</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComponentBuilder