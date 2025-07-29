"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Palette,
  Type,
  Layout,
  Spacing,
  BorderAll,
  Shadow,
  Move,
  RotateCcw,
  Eye,
  Code
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VisualComponent, CSSProperty, CSSGroup } from '../types/visual-editor.types'

interface CSSVisualEditorProps {
  selectedComponent: VisualComponent | null
  onUpdateComponent: (id: string, updates: Partial<VisualComponent>) => void
  className?: string
}

interface CSSPropertyEditorProps {
  property: CSSProperty
  value: any
  onChange: (value: any) => void
}

function CSSPropertyEditor({ property, value, onChange }: CSSPropertyEditorProps) {
  const handleChange = useCallback((newValue: any) => {
    onChange(newValue)
  }, [onChange])

  switch (property.type) {
    case 'text':
      return (
        <Input
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${property.name}`}
          className="h-8"
        />
      )
    
    case 'number':
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            min={property.min}
            max={property.max}
            step={property.step}
            className="h-8 flex-1"
          />
          {property.unit && (
            <span className="text-xs text-gray-500 min-w-fit">{property.unit}</span>
          )}
        </div>
      )
    
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleChange(e.target.value)}
            className="h-8 w-12 p-1 border rounded"
          />
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="#000000"
            className="h-8 flex-1 font-mono text-xs"
          />
        </div>
      )
    
    case 'select':
      return (
        <Select value={value || ''} onValueChange={handleChange}>
          <SelectTrigger className="h-8">
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
    
    case 'boolean':
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleChange(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">{value ? 'Enabled' : 'Disabled'}</span>
        </div>
      )
    
    case 'spacing':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={value?.top || ''}
            onChange={(e) => handleChange({ ...value, top: e.target.value })}
            placeholder="Top"
            className="h-8"
          />
          <Input
            type="number"
            value={value?.right || ''}
            onChange={(e) => handleChange({ ...value, right: e.target.value })}
            placeholder="Right"
            className="h-8"
          />
          <Input
            type="number"
            value={value?.bottom || ''}
            onChange={(e) => handleChange({ ...value, bottom: e.target.value })}
            placeholder="Bottom"
            className="h-8"
          />
          <Input
            type="number"
            value={value?.left || ''}
            onChange={(e) => handleChange({ ...value, left: e.target.value })}
            placeholder="Left"
            className="h-8"
          />
        </div>
      )
    
    case 'size':
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value?.width || ''}
            onChange={(e) => handleChange({ ...value, width: e.target.value })}
            placeholder="Width"
            className="h-8 flex-1"
          />
          <span className="text-xs text-gray-500">×</span>
          <Input
            type="number"
            value={value?.height || ''}
            onChange={(e) => handleChange({ ...value, height: e.target.value })}
            placeholder="Height"
            className="h-8 flex-1"
          />
        </div>
      )
    
    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="h-8"
        />
      )
  }
}

const CSS_GROUPS: CSSGroup[] = [
  {
    name: 'Layout',
    properties: [
      { name: 'display', type: 'select', options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] },
      { name: 'position', type: 'select', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'] },
      { name: 'top', type: 'number', unit: 'px' },
      { name: 'right', type: 'number', unit: 'px' },
      { name: 'bottom', type: 'number', unit: 'px' },
      { name: 'left', type: 'number', unit: 'px' },
      { name: 'z-index', type: 'number' },
    ],
    expanded: true
  },
  {
    name: 'Dimensions',
    properties: [
      { name: 'width', type: 'number', unit: 'px' },
      { name: 'height', type: 'number', unit: 'px' },
      { name: 'min-width', type: 'number', unit: 'px' },
      { name: 'min-height', type: 'number', unit: 'px' },
      { name: 'max-width', type: 'number', unit: 'px' },
      { name: 'max-height', type: 'number', unit: 'px' },
    ],
    expanded: false
  },
  {
    name: 'Spacing',
    properties: [
      { name: 'margin', type: 'spacing' },
      { name: 'padding', type: 'spacing' },
    ],
    expanded: false
  },
  {
    name: 'Typography',
    properties: [
      { name: 'font-family', type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New'] },
      { name: 'font-size', type: 'number', unit: 'px' },
      { name: 'font-weight', type: 'select', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
      { name: 'line-height', type: 'number' },
      { name: 'text-align', type: 'select', options: ['left', 'center', 'right', 'justify'] },
      { name: 'text-decoration', type: 'select', options: ['none', 'underline', 'overline', 'line-through'] },
      { name: 'color', type: 'color' },
    ],
    expanded: false
  },
  {
    name: 'Background',
    properties: [
      { name: 'background-color', type: 'color' },
      { name: 'background-image', type: 'text' },
      { name: 'background-size', type: 'select', options: ['auto', 'cover', 'contain'] },
      { name: 'background-position', type: 'select', options: ['center', 'top', 'bottom', 'left', 'right'] },
      { name: 'background-repeat', type: 'select', options: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'] },
    ],
    expanded: false
  },
  {
    name: 'Border',
    properties: [
      { name: 'border-width', type: 'number', unit: 'px' },
      { name: 'border-style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted', 'double'] },
      { name: 'border-color', type: 'color' },
      { name: 'border-radius', type: 'number', unit: 'px' },
    ],
    expanded: false
  },
  {
    name: 'Effects',
    properties: [
      { name: 'opacity', type: 'number', min: 0, max: 1, step: 0.1 },
      { name: 'box-shadow', type: 'text' },
      { name: 'transform', type: 'text' },
      { name: 'transition', type: 'text' },
    ],
    expanded: false
  },
  {
    name: 'Flexbox',
    properties: [
      { name: 'flex-direction', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
      { name: 'justify-content', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
      { name: 'align-items', type: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
      { name: 'flex-wrap', type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
      { name: 'gap', type: 'number', unit: 'px' },
    ],
    expanded: false
  }
]

export function CSSVisualEditor({ selectedComponent, onUpdateComponent, className }: CSSVisualEditorProps) {
  const [activeTab, setActiveTab] = useState('visual')
  const [cssText, setCssText] = useState('')

  useEffect(() => {
    if (selectedComponent?.styles) {
      const cssString = Object.entries(selectedComponent.styles)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n')
      setCssText(cssString)
    } else {
      setCssText('')
    }
  }, [selectedComponent])

  const handleStyleChange = useCallback((property: string, value: any) => {
    if (!selectedComponent) return

    const updatedStyles = {
      ...selectedComponent.styles,
      [property]: value
    }

    onUpdateComponent(selectedComponent.id, { styles: updatedStyles })
  }, [selectedComponent, onUpdateComponent])

  const handleCssTextChange = useCallback((newCssText: string) => {
    setCssText(newCssText)
    
    if (!selectedComponent) return

    try {
      const styles: Record<string, any> = {}
      const lines = newCssText.split('\n')
      
      lines.forEach(line => {
        const [property, value] = line.split(':').map(s => s.trim())
        if (property && value) {
          styles[property] = value.replace(';', '')
        }
      })

      onUpdateComponent(selectedComponent.id, { styles })
    } catch (error) {
      console.error('Error parsing CSS:', error)
    }
  }, [selectedComponent, onUpdateComponent])

  const resetStyles = useCallback(() => {
    if (!selectedComponent) return
    onUpdateComponent(selectedComponent.id, { styles: {} })
  }, [selectedComponent, onUpdateComponent])

  if (!selectedComponent) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            CSS Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
            <Eye className="h-8 w-8 mb-2 opacity-50" />
            <p>Select a component to edit its styles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            CSS Editor
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={resetStyles}
            className="h-7"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedComponent.name}</Badge>
          <Badge variant="outline">{selectedComponent.type}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4">
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Layout className="h-3 w-3" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-3 w-3" />
              Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="flex-1 m-0">
            <ScrollArea className="h-full px-4 pb-4">
              <Accordion type="multiple" defaultValue={['layout']} className="w-full">
                {CSS_GROUPS.map((group) => (
                  <AccordionItem key={group.name} value={group.name.toLowerCase()}>
                    <AccordionTrigger className="text-sm font-medium">
                      {group.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {group.properties.map((property) => (
                          <div key={property.name} className="space-y-1">
                            <Label className="text-xs font-medium text-gray-600">
                              {property.name}
                            </Label>
                            <CSSPropertyEditor
                              property={property}
                              value={selectedComponent.styles?.[property.name]}
                              onChange={(value) => handleStyleChange(property.name, value)}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="code" className="flex-1 m-0 p-4">
            <div className="h-full">
              <Label className="text-sm font-medium mb-2 block">CSS Properties</Label>
              <textarea
                value={cssText}
                onChange={(e) => handleCssTextChange(e.target.value)}
                className="w-full h-full min-h-[300px] p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="property: value;\nanother-property: value;"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default CSSVisualEditor