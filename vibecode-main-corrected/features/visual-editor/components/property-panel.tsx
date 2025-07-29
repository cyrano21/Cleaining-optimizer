'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Palette,
  Layout,
  Type,
  MousePointer,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Move,
  RotateCcw,
  Layers,
  Code,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react'
import type { VisualComponent, CSSProperty, ResponsiveBreakpoint } from '../types/visual-editor.types'

interface PropertyPanelProps {
  selectedComponent?: VisualComponent | null
  onPropertyChange?: (componentId: string, property: string, value: any) => void
  onStyleChange?: (componentId: string, property: string, value: string) => void
  onComponentDelete?: (componentId: string) => void
  onComponentDuplicate?: (componentId: string) => void
  onComponentToggleVisibility?: (componentId: string) => void
  className?: string
  showAdvancedProperties?: boolean
  responsiveBreakpoints?: ResponsiveBreakpoint[]
}

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoint[] = [
  { id: 'mobile', name: 'Mobile', minWidth: 0, maxWidth: 767, icon: 'smartphone' },
  { id: 'tablet', name: 'Tablet', minWidth: 768, maxWidth: 1023, icon: 'tablet' },
  { id: 'desktop', name: 'Desktop', minWidth: 1024, maxWidth: null, icon: 'monitor' }
]

const CSS_PROPERTIES: Record<string, CSSProperty[]> = {
  layout: [
    { name: 'display', type: 'select', options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] },
    { name: 'position', type: 'select', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'] },
    { name: 'width', type: 'text', unit: 'px' },
    { name: 'height', type: 'text', unit: 'px' },
    { name: 'margin', type: 'spacing' },
    { name: 'padding', type: 'spacing' },
    { name: 'overflow', type: 'select', options: ['visible', 'hidden', 'scroll', 'auto'] }
  ],
  typography: [
    { name: 'fontSize', type: 'slider', min: 8, max: 72, unit: 'px' },
    { name: 'fontWeight', type: 'select', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
    { name: 'fontFamily', type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana'] },
    { name: 'lineHeight', type: 'slider', min: 0.8, max: 3, step: 0.1 },
    { name: 'textAlign', type: 'select', options: ['left', 'center', 'right', 'justify'] },
    { name: 'color', type: 'color' },
    { name: 'textDecoration', type: 'select', options: ['none', 'underline', 'overline', 'line-through'] }
  ],
  appearance: [
    { name: 'backgroundColor', type: 'color' },
    { name: 'borderRadius', type: 'slider', min: 0, max: 50, unit: 'px' },
    { name: 'borderWidth', type: 'slider', min: 0, max: 10, unit: 'px' },
    { name: 'borderColor', type: 'color' },
    { name: 'borderStyle', type: 'select', options: ['none', 'solid', 'dashed', 'dotted', 'double'] },
    { name: 'boxShadow', type: 'text' },
    { name: 'opacity', type: 'slider', min: 0, max: 1, step: 0.1 }
  ],
  flexbox: [
    { name: 'flexDirection', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
    { name: 'justifyContent', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
    { name: 'alignItems', type: 'select', options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
    { name: 'flexWrap', type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
    { name: 'gap', type: 'slider', min: 0, max: 50, unit: 'px' }
  ]
}

const BreakpointIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'smartphone':
      return <Smartphone className="h-4 w-4" />
    case 'tablet':
      return <Tablet className="h-4 w-4" />
    case 'monitor':
      return <Monitor className="h-4 w-4" />
    default:
      return <Monitor className="h-4 w-4" />
  }
}

const PropertyInput = ({ 
  property, 
  value, 
  onChange 
}: { 
  property: CSSProperty
  value: any
  onChange: (value: any) => void 
}) => {
  switch (property.type) {
    case 'text':
      return (
        <div className="flex gap-2">
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${property.name}`}
            className="flex-1"
          />
          {property.unit && (
            <div className="flex items-center px-2 bg-gray-100 rounded text-xs text-gray-600">
              {property.unit}
            </div>
          )}
        </div>
      )
    
    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${property.name}`} />
          </SelectTrigger>
          <SelectContent>
            {property.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    
    case 'slider':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{property.min}</span>
            <span className="text-xs font-medium">
              {value || property.min}{property.unit}
            </span>
            <span className="text-xs text-gray-600">{property.max}</span>
          </div>
          <Slider
            value={[value || property.min || 0]}
            onValueChange={([newValue]) => onChange(newValue)}
            min={property.min || 0}
            max={property.max || 100}
            step={property.step || 1}
            className="w-full"
          />
        </div>
      )
    
    case 'color':
      return (
        <div className="flex gap-2">
          <Input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-8 p-1 border rounded"
          />
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      )
    
    case 'spacing':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Top"
            className="text-xs"
          />
          <Input
            placeholder="Right"
            className="text-xs"
          />
          <Input
            placeholder="Bottom"
            className="text-xs"
          />
          <Input
            placeholder="Left"
            className="text-xs"
          />
        </div>
      )
    
    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${property.name}`}
        />
      )
  }
}

export function PropertyPanel({
  selectedComponent,
  onPropertyChange,
  onStyleChange,
  onComponentDelete,
  onComponentDuplicate,
  onComponentToggleVisibility,
  className = '',
  showAdvancedProperties = true,
  responsiveBreakpoints = DEFAULT_BREAKPOINTS
}: PropertyPanelProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState(responsiveBreakpoints[0]?.id || 'desktop')
  const [activeTab, setActiveTab] = useState('properties')
  
  const handlePropertyChange = useCallback((property: string, value: any) => {
    if (selectedComponent && onPropertyChange) {
      onPropertyChange(selectedComponent.id, property, value)
    }
  }, [selectedComponent, onPropertyChange])
  
  const handleStyleChange = useCallback((property: string, value: string) => {
    if (selectedComponent && onStyleChange) {
      onStyleChange(selectedComponent.id, property, value)
    }
  }, [selectedComponent, onStyleChange])
  
  const handleDelete = useCallback(() => {
    if (selectedComponent && onComponentDelete) {
      onComponentDelete(selectedComponent.id)
    }
  }, [selectedComponent, onComponentDelete])
  
  const handleDuplicate = useCallback(() => {
    if (selectedComponent && onComponentDuplicate) {
      onComponentDuplicate(selectedComponent.id)
    }
  }, [selectedComponent, onComponentDuplicate])
  
  const handleToggleVisibility = useCallback(() => {
    if (selectedComponent && onComponentToggleVisibility) {
      onComponentToggleVisibility(selectedComponent.id)
    }
  }, [selectedComponent, onComponentToggleVisibility])
  
  if (!selectedComponent) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No component selected</p>
            <p className="text-xs text-gray-400 mt-1">
              Select a component to edit its properties
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Properties
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleVisibility}
              className="h-8 w-8 p-0"
            >
              {selectedComponent.visible !== false ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDuplicate}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Component Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedComponent.type}
            </Badge>
            <span className="text-sm font-medium text-gray-900">
              {selectedComponent.name || selectedComponent.id}
            </span>
          </div>
          
          {selectedComponent.className && (
            <div className="text-xs text-gray-600">
              Classes: {selectedComponent.className}
            </div>
          )}
        </div>
        
        {/* Responsive Breakpoints */}
        <div className="flex items-center gap-1 mt-3">
          <span className="text-xs text-gray-600 mr-2">Breakpoint:</span>
          {responsiveBreakpoints.map((breakpoint) => (
            <Button
              key={breakpoint.id}
              variant={activeBreakpoint === breakpoint.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveBreakpoint(breakpoint.id)}
              className="h-7 px-2"
            >
              <BreakpointIcon icon={breakpoint.icon} />
              <span className="ml-1 text-xs">{breakpoint.name}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-6">
            <TabsTrigger value="properties" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Props
            </TabsTrigger>
            <TabsTrigger value="styles" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Styles
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Code
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1">
            <ScrollArea className="h-full px-6 pb-6">
              <TabsContent value="properties" className="mt-4 space-y-4">
                {/* Basic Properties */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="component-id" className="text-xs font-medium text-gray-700">
                      ID
                    </Label>
                    <Input
                      id="component-id"
                      value={selectedComponent.id}
                      onChange={(e) => handlePropertyChange('id', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="component-name" className="text-xs font-medium text-gray-700">
                      Name
                    </Label>
                    <Input
                      id="component-name"
                      value={selectedComponent.name || ''}
                      onChange={(e) => handlePropertyChange('name', e.target.value)}
                      placeholder="Component name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="component-className" className="text-xs font-medium text-gray-700">
                      CSS Classes
                    </Label>
                    <Input
                      id="component-className"
                      value={selectedComponent.className || ''}
                      onChange={(e) => handlePropertyChange('className', e.target.value)}
                      placeholder="CSS classes"
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Component-specific properties */}
                  {selectedComponent.type === 'text' && (
                    <div>
                      <Label htmlFor="text-content" className="text-xs font-medium text-gray-700">
                        Text Content
                      </Label>
                      <Textarea
                        id="text-content"
                        value={selectedComponent.content || ''}
                        onChange={(e) => handlePropertyChange('content', e.target.value)}
                        placeholder="Enter text content"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {selectedComponent.type === 'img' && (
                    <>
                      <div>
                        <Label htmlFor="img-src" className="text-xs font-medium text-gray-700">
                          Image Source
                        </Label>
                        <Input
                          id="img-src"
                          value={selectedComponent.props?.src || ''}
                          onChange={(e) => handlePropertyChange('src', e.target.value)}
                          placeholder="Image URL"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="img-alt" className="text-xs font-medium text-gray-700">
                          Alt Text
                        </Label>
                        <Input
                          id="img-alt"
                          value={selectedComponent.props?.alt || ''}
                          onChange={(e) => handlePropertyChange('alt', e.target.value)}
                          placeholder="Alternative text"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedComponent.type === 'a' && (
                    <div>
                      <Label htmlFor="link-href" className="text-xs font-medium text-gray-700">
                        Link URL
                      </Label>
                      <Input
                        id="link-href"
                        value={selectedComponent.props?.href || ''}
                        onChange={(e) => handlePropertyChange('href', e.target.value)}
                        placeholder="https://example.com"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="styles" className="mt-4 space-y-4">
                {Object.entries(CSS_PROPERTIES).map(([category, properties]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-gray-200 flex-1" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        {category}
                      </span>
                      <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    
                    {properties.map((property) => (
                      <div key={property.name}>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">
                          {property.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <PropertyInput
                          property={property}
                          value={selectedComponent.styles?.[property.name]}
                          onChange={(value) => handleStyleChange(property.name, value)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-4 space-y-4">
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">
                    Custom CSS
                  </Label>
                  <Textarea
                    value={selectedComponent.customCSS || ''}
                    onChange={(e) => handlePropertyChange('customCSS', e.target.value)}
                    placeholder="/* Custom CSS styles */"
                    className="font-mono text-xs"
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">
                    Custom Attributes
                  </Label>
                  <Textarea
                    value={JSON.stringify(selectedComponent.props || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const props = JSON.parse(e.target.value)
                        handlePropertyChange('props', props)
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder='{\n  "data-testid": "my-component",\n  "aria-label": "Description"\n}'
                    className="font-mono text-xs"
                    rows={6}
                  />
                </div>
                
                {showAdvancedProperties && (
                  <>
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">Advanced Options</h4>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-700">Visible</Label>
                        <Switch
                          checked={selectedComponent.visible !== false}
                          onCheckedChange={(checked) => handlePropertyChange('visible', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-700">Locked</Label>
                        <Switch
                          checked={selectedComponent.locked || false}
                          onCheckedChange={(checked) => handlePropertyChange('locked', checked)}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">
                          Z-Index
                        </Label>
                        <Input
                          type="number"
                          value={selectedComponent.zIndex || 0}
                          onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value) || 0)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default PropertyPanel