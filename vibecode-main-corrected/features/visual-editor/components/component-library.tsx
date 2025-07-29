'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Plus,
  Grid3X3,
  Type,
  Image,
  Square,
  Circle,
  MousePointer,
  Layout,
  Layers,
  Palette,
  Code,
  Smartphone,
  Monitor,
  Package,
  Star,
  Download,
  Eye,
  Copy
} from 'lucide-react'
import type { ComponentLibraryItem, ComponentTemplate } from '../types/visual-editor.types'

interface ComponentLibraryProps {
  onComponentSelect?: (component: ComponentLibraryItem) => void
  onComponentDrag?: (component: ComponentLibraryItem, event: React.DragEvent) => void
  className?: string
  searchPlaceholder?: string
  showCategories?: boolean
  showPreview?: boolean
  allowCustomComponents?: boolean
}

const COMPONENT_CATEGORIES = [
  { id: 'layout', name: 'Layout', icon: Layout, color: 'bg-blue-100 text-blue-700' },
  { id: 'typography', name: 'Typography', icon: Type, color: 'bg-green-100 text-green-700' },
  { id: 'forms', name: 'Forms', icon: Square, color: 'bg-purple-100 text-purple-700' },
  { id: 'navigation', name: 'Navigation', icon: MousePointer, color: 'bg-orange-100 text-orange-700' },
  { id: 'media', name: 'Media', icon: Image, color: 'bg-pink-100 text-pink-700' },
  { id: 'feedback', name: 'Feedback', icon: Circle, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'data', name: 'Data Display', icon: Grid3X3, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'custom', name: 'Custom', icon: Package, color: 'bg-gray-100 text-gray-700' }
]

const DEFAULT_COMPONENTS: ComponentLibraryItem[] = [
  // Layout Components
  {
    id: 'container',
    name: 'Container',
    category: 'layout',
    description: 'A responsive container for content',
    icon: 'layout',
    tags: ['layout', 'responsive', 'container'],
    template: {
      type: 'div',
      props: {
        className: 'container mx-auto px-4 py-8'
      },
      children: [
        {
          type: 'text',
          content: 'Container content goes here'
        }
      ]
    },
    preview: '<div class="container mx-auto px-4 py-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg min-h-32 flex items-center justify-center">Container</div>',
    code: `<div className="container mx-auto px-4 py-8">\n  {/* Your content here */}\n</div>`,
    popularity: 95
  },
  {
    id: 'grid',
    name: 'Grid Layout',
    category: 'layout',
    description: 'CSS Grid layout system',
    icon: 'grid',
    tags: ['layout', 'grid', 'responsive'],
    template: {
      type: 'div',
      props: {
        className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      },
      children: [
        { type: 'div', props: { className: 'bg-gray-100 p-4 rounded' }, children: [{ type: 'text', content: 'Grid Item 1' }] },
        { type: 'div', props: { className: 'bg-gray-100 p-4 rounded' }, children: [{ type: 'text', content: 'Grid Item 2' }] },
        { type: 'div', props: { className: 'bg-gray-100 p-4 rounded' }, children: [{ type: 'text', content: 'Grid Item 3' }] }
      ]
    },
    preview: '<div class="grid grid-cols-3 gap-2"><div class="bg-blue-100 p-2 rounded text-xs text-center">1</div><div class="bg-blue-100 p-2 rounded text-xs text-center">2</div><div class="bg-blue-100 p-2 rounded text-xs text-center">3</div></div>',
    code: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n  <div>Item 1</div>\n  <div>Item 2</div>\n  <div>Item 3</div>\n</div>`,
    popularity: 88
  },
  
  // Typography Components
  {
    id: 'heading',
    name: 'Heading',
    category: 'typography',
    description: 'Responsive heading component',
    icon: 'type',
    tags: ['typography', 'heading', 'text'],
    template: {
      type: 'h1',
      props: {
        className: 'text-3xl font-bold text-gray-900 mb-4'
      },
      children: [{ type: 'text', content: 'Your Heading Here' }]
    },
    preview: '<h1 class="text-lg font-bold text-gray-900">Heading</h1>',
    code: `<h1 className="text-3xl font-bold text-gray-900 mb-4">\n  Your Heading Here\n</h1>`,
    popularity: 92
  },
  {
    id: 'paragraph',
    name: 'Paragraph',
    category: 'typography',
    description: 'Styled paragraph text',
    icon: 'type',
    tags: ['typography', 'text', 'paragraph'],
    template: {
      type: 'p',
      props: {
        className: 'text-gray-700 leading-relaxed mb-4'
      },
      children: [{ type: 'text', content: 'Your paragraph text goes here. This is a sample paragraph with some content.' }]
    },
    preview: '<p class="text-sm text-gray-700 leading-relaxed">Sample paragraph text...</p>',
    code: `<p className="text-gray-700 leading-relaxed mb-4">\n  Your paragraph text goes here.\n</p>`,
    popularity: 85
  },
  
  // Form Components
  {
    id: 'button',
    name: 'Button',
    category: 'forms',
    description: 'Interactive button component',
    icon: 'square',
    tags: ['forms', 'button', 'interactive'],
    template: {
      type: 'button',
      props: {
        className: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
      },
      children: [{ type: 'text', content: 'Click me' }]
    },
    preview: '<button class="bg-blue-600 text-white text-xs py-1 px-2 rounded">Button</button>',
    code: `<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">\n  Click me\n</button>`,
    popularity: 98
  },
  {
    id: 'input',
    name: 'Input Field',
    category: 'forms',
    description: 'Text input field',
    icon: 'square',
    tags: ['forms', 'input', 'text'],
    template: {
      type: 'input',
      props: {
        type: 'text',
        placeholder: 'Enter text...',
        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
      }
    },
    preview: '<input class="w-full px-2 py-1 border border-gray-300 rounded text-xs" placeholder="Input field" />',
    code: `<input\n  type="text"\n  placeholder="Enter text..."\n  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"\n/>`,
    popularity: 90
  },
  
  // Navigation Components
  {
    id: 'navbar',
    name: 'Navigation Bar',
    category: 'navigation',
    description: 'Responsive navigation bar',
    icon: 'navigation',
    tags: ['navigation', 'navbar', 'menu'],
    template: {
      type: 'nav',
      props: {
        className: 'bg-white shadow-lg border-b'
      },
      children: [
        {
          type: 'div',
          props: { className: 'container mx-auto px-4' },
          children: [
            {
              type: 'div',
              props: { className: 'flex justify-between items-center py-4' },
              children: [
                { type: 'div', props: { className: 'text-xl font-bold' }, children: [{ type: 'text', content: 'Logo' }] },
                {
                  type: 'div',
                  props: { className: 'hidden md:flex space-x-6' },
                  children: [
                    { type: 'a', props: { href: '#', className: 'text-gray-700 hover:text-blue-600' }, children: [{ type: 'text', content: 'Home' }] },
                    { type: 'a', props: { href: '#', className: 'text-gray-700 hover:text-blue-600' }, children: [{ type: 'text', content: 'About' }] },
                    { type: 'a', props: { href: '#', className: 'text-gray-700 hover:text-blue-600' }, children: [{ type: 'text', content: 'Contact' }] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    preview: '<nav class="bg-white shadow border-b p-2"><div class="flex justify-between items-center"><div class="font-bold text-xs">Logo</div><div class="flex space-x-2 text-xs"><span>Home</span><span>About</span></div></div></nav>',
    code: `<nav className="bg-white shadow-lg border-b">\n  <div className="container mx-auto px-4">\n    <div className="flex justify-between items-center py-4">\n      <div className="text-xl font-bold">Logo</div>\n      <div className="hidden md:flex space-x-6">\n        <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>\n        <a href="#" className="text-gray-700 hover:text-blue-600">About</a>\n        <a href="#" className="text-gray-700 hover:text-blue-600">Contact</a>\n      </div>\n    </div>\n  </div>\n</nav>`,
    popularity: 87
  },
  
  // Media Components
  {
    id: 'image',
    name: 'Image',
    category: 'media',
    description: 'Responsive image component',
    icon: 'image',
    tags: ['media', 'image', 'responsive'],
    template: {
      type: 'img',
      props: {
        src: 'https://via.placeholder.com/400x300',
        alt: 'Placeholder image',
        className: 'w-full h-auto rounded-lg shadow-md'
      }
    },
    preview: '<div class="w-full h-16 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">Image</div>',
    code: `<img\n  src="https://via.placeholder.com/400x300"\n  alt="Placeholder image"\n  className="w-full h-auto rounded-lg shadow-md"\n/>`,
    popularity: 82
  },
  
  // Data Display Components
  {
    id: 'card',
    name: 'Card',
    category: 'data',
    description: 'Content card component',
    icon: 'square',
    tags: ['data', 'card', 'content'],
    template: {
      type: 'div',
      props: {
        className: 'bg-white rounded-lg shadow-md p-6 border'
      },
      children: [
        {
          type: 'h3',
          props: { className: 'text-lg font-semibold mb-2' },
          children: [{ type: 'text', content: 'Card Title' }]
        },
        {
          type: 'p',
          props: { className: 'text-gray-600' },
          children: [{ type: 'text', content: 'Card content goes here. This is a sample card with some content.' }]
        }
      ]
    },
    preview: '<div class="bg-white rounded border p-3 shadow-sm"><div class="font-semibold text-xs mb-1">Card Title</div><div class="text-xs text-gray-600">Card content...</div></div>',
    code: `<div className="bg-white rounded-lg shadow-md p-6 border">\n  <h3 className="text-lg font-semibold mb-2">Card Title</h3>\n  <p className="text-gray-600">Card content goes here.</p>\n</div>`,
    popularity: 94
  }
]

const ComponentIcon = ({ icon }: { icon: string }) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    layout: Layout,
    grid: Grid3X3,
    type: Type,
    square: Square,
    navigation: MousePointer,
    image: Image,
    circle: Circle
  }
  
  const IconComponent = iconMap[icon] || Square
  return <IconComponent className="h-4 w-4" />
}

const ComponentPreview = ({ component }: { component: ComponentLibraryItem }) => {
  return (
    <div 
      className="w-full h-20 bg-gray-50 border border-gray-200 rounded p-2 overflow-hidden"
      dangerouslySetInnerHTML={{ __html: component.preview }}
    />
  )
}

export function ComponentLibrary({
  onComponentSelect,
  onComponentDrag,
  className = '',
  searchPlaceholder = 'Search components...',
  showCategories = true,
  showPreview = true,
  allowCustomComponents = true
}: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [components] = useState<ComponentLibraryItem[]>(DEFAULT_COMPONENTS)
  
  const filteredComponents = useMemo(() => {
    let filtered = components
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(component => 
        component.name.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(component => component.category === selectedCategory)
    }
    
    // Sort by popularity
    return filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
  }, [components, searchQuery, selectedCategory])
  
  const handleComponentClick = (component: ComponentLibraryItem) => {
    onComponentSelect?.(component)
  }
  
  const handleDragStart = (component: ComponentLibraryItem, event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify(component))
    event.dataTransfer.effectAllowed = 'copy'
    onComponentDrag?.(component, event)
  }
  
  const copyComponentCode = async (component: ComponentLibraryItem) => {
    try {
      await navigator.clipboard.writeText(component.code)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }
  
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Component Library
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Categories */}
        {showCategories && (
          <>
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-8"
              >
                All
              </Button>
              {COMPONENT_CATEGORIES.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="h-8"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {filteredComponents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No components found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComponents.map((component) => {
                const categoryInfo = COMPONENT_CATEGORIES.find(cat => cat.id === component.category)
                
                return (
                  <div
                    key={component.id}
                    className="group border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    draggable
                    onDragStart={(e) => handleDragStart(component, e)}
                    onClick={() => handleComponentClick(component)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <ComponentIcon icon={component.icon} />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {component.name}
                          </h4>
                          
                          {categoryInfo && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${categoryInfo.color}`}
                            >
                              {categoryInfo.name}
                            </Badge>
                          )}
                          
                          {component.popularity && component.popularity > 90 && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {component.description}
                        </p>
                        
                        {showPreview && (
                          <div className="mb-2">
                            <ComponentPreview component={component} />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {component.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {component.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{component.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyComponentCode(component)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default ComponentLibrary