'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Code,
  Copy,
  Download,
  Eye,
  FileText,
  Settings,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import type { VisualComponent, CodeGenerationOptions } from '../types/visual-editor.types'

interface CodeGeneratorProps {
  components: VisualComponent[]
  selectedComponent?: VisualComponent | null
  onCodeGenerate?: (code: string, format: string) => void
  onCodeCopy?: (code: string) => void
  onCodeDownload?: (code: string, filename: string) => void
  className?: string
  showPreview?: boolean
  defaultFormat?: string
}

type CodeFormat = 'react' | 'html' | 'vue' | 'angular' | 'svelte'
type CodeStyle = 'functional' | 'class' | 'hooks'
type CSSFramework = 'tailwind' | 'bootstrap' | 'material' | 'custom'

const CODE_FORMATS: Record<CodeFormat, { name: string; extension: string; icon: string }> = {
  react: { name: 'React', extension: 'jsx', icon: '⚛️' },
  html: { name: 'HTML', extension: 'html', icon: '🌐' },
  vue: { name: 'Vue', extension: 'vue', icon: '💚' },
  angular: { name: 'Angular', extension: 'ts', icon: '🅰️' },
  svelte: { name: 'Svelte', extension: 'svelte', icon: '🧡' }
}

const CSS_FRAMEWORKS: Record<CSSFramework, { name: string; prefix: string }> = {
  tailwind: { name: 'Tailwind CSS', prefix: 'tw-' },
  bootstrap: { name: 'Bootstrap', prefix: 'bs-' },
  material: { name: 'Material UI', prefix: 'mui-' },
  custom: { name: 'Custom CSS', prefix: '' }
}

class CodeGenerator {
  private options: CodeGenerationOptions
  
  constructor(options: CodeGenerationOptions) {
    this.options = options
  }
  
  generateReactCode(components: VisualComponent[]): string {
    const imports = this.generateImports()
    const componentCode = this.generateReactComponent(components)
    const styles = this.generateStyles(components)
    
    return `${imports}\n\n${componentCode}\n\n${styles}`
  }
  
  generateHTMLCode(components: VisualComponent[]): string {
    const html = this.generateHTMLStructure(components)
    const css = this.generateCSS(components)
    
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n  <style>\n${css}\n  </style>\n</head>\n<body>\n${html}\n</body>\n</html>`
  }
  
  generateVueCode(components: VisualComponent[]): string {
    const template = this.generateVueTemplate(components)
    const script = this.generateVueScript()
    const styles = this.generateVueStyles(components)
    
    return `<template>\n${template}\n</template>\n\n<script>\n${script}\n</script>\n\n<style scoped>\n${styles}\n</style>`
  }
  
  private generateImports(): string {
    const imports = ['import React from \'react\'\n']
    
    if (this.options.cssFramework === 'tailwind') {
      // Tailwind is usually imported globally
    } else if (this.options.cssFramework === 'bootstrap') {
      imports.push('import \'bootstrap/dist/css/bootstrap.min.css\'\n')
    } else if (this.options.cssFramework === 'material') {
      imports.push('import { ThemeProvider, createTheme } from \'@mui/material/styles\'\n')
    }
    
    return imports.join('')
  }
  
  private generateReactComponent(components: VisualComponent[]): string {
    const componentName = this.options.componentName || 'GeneratedComponent'
    const componentBody = this.generateComponentBody(components)
    
    if (this.options.codeStyle === 'functional') {
      return `export function ${componentName}() {\n  return (\n${componentBody}\n  )\n}`
    } else {
      return `export class ${componentName} extends React.Component {\n  render() {\n    return (\n${componentBody}\n    )\n  }\n}`
    }
  }
  
  private generateComponentBody(components: VisualComponent[], indent = 4): string {
    return components.map(component => this.generateComponentJSX(component, indent)).join('\n')
  }
  
  private generateComponentJSX(component: VisualComponent, indent = 4): string {
    const spaces = ' '.repeat(indent)
    const tag = component.type
    const props = this.generateProps(component)
    const styles = this.generateInlineStyles(component)
    const className = this.generateClassName(component)
    
    let attributes = ''
    if (className) attributes += ` className="${className}"`
    if (props) attributes += ` ${props}`
    if (styles) attributes += ` style={${styles}}`
    
    if (component.children && component.children.length > 0) {
      const childrenCode = component.children
        .map(child => this.generateComponentJSX(child, indent + 2))
        .join('\n')
      
      return `${spaces}<${tag}${attributes}>\n${childrenCode}\n${spaces}</${tag}>`
    } else if (component.content) {
      return `${spaces}<${tag}${attributes}>${component.content}</${tag}>`
    } else {
      return `${spaces}<${tag}${attributes} />`
    }
  }
  
  private generateProps(component: VisualComponent): string {
    if (!component.props) return ''
    
    return Object.entries(component.props)
      .filter(([key]) => key !== 'className' && key !== 'style')
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`
        } else {
          return `${key}={${JSON.stringify(value)}}`
        }
      })
      .join(' ')
  }
  
  private generateClassName(component: VisualComponent): string {
    const classes = []
    
    if (component.className) {
      classes.push(component.className)
    }
    
    if (component.styles && this.options.cssFramework === 'tailwind') {
      // Convert styles to Tailwind classes
      const tailwindClasses = this.convertStylesToTailwind(component.styles)
      classes.push(...tailwindClasses)
    }
    
    return classes.join(' ')
  }
  
  private generateInlineStyles(component: VisualComponent): string {
    if (!component.styles || this.options.cssFramework === 'tailwind') {
      return ''
    }
    
    const styleEntries = Object.entries(component.styles)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(', ')
    
    return `{${styleEntries}}`
  }
  
  private convertStylesToTailwind(styles: Record<string, string>): string[] {
    const classes: string[] = []
    
    // Basic style to Tailwind mapping
    const styleMap: Record<string, (value: string) => string | null> = {
      backgroundColor: (value) => {
        const colorMap: Record<string, string> = {
          '#ffffff': 'bg-white',
          '#000000': 'bg-black',
          '#ef4444': 'bg-red-500',
          '#3b82f6': 'bg-blue-500',
          '#10b981': 'bg-green-500'
        }
        return colorMap[value] || null
      },
      color: (value) => {
        const colorMap: Record<string, string> = {
          '#ffffff': 'text-white',
          '#000000': 'text-black',
          '#ef4444': 'text-red-500',
          '#3b82f6': 'text-blue-500'
        }
        return colorMap[value] || null
      },
      fontSize: (value) => {
        const sizeMap: Record<string, string> = {
          '12px': 'text-xs',
          '14px': 'text-sm',
          '16px': 'text-base',
          '18px': 'text-lg',
          '20px': 'text-xl',
          '24px': 'text-2xl'
        }
        return sizeMap[value] || null
      },
      fontWeight: (value) => {
        const weightMap: Record<string, string> = {
          '400': 'font-normal',
          '500': 'font-medium',
          '600': 'font-semibold',
          '700': 'font-bold'
        }
        return weightMap[value] || null
      },
      textAlign: (value) => {
        const alignMap: Record<string, string> = {
          'left': 'text-left',
          'center': 'text-center',
          'right': 'text-right'
        }
        return alignMap[value] || null
      },
      display: (value) => {
        const displayMap: Record<string, string> = {
          'flex': 'flex',
          'block': 'block',
          'inline': 'inline',
          'none': 'hidden'
        }
        return displayMap[value] || null
      }
    }
    
    Object.entries(styles).forEach(([property, value]) => {
      const converter = styleMap[property]
      if (converter) {
        const tailwindClass = converter(value)
        if (tailwindClass) {
          classes.push(tailwindClass)
        }
      }
    })
    
    return classes
  }
  
  private generateHTMLStructure(components: VisualComponent[]): string {
    return components.map(component => this.generateHTMLElement(component, 2)).join('\n')
  }
  
  private generateHTMLElement(component: VisualComponent, indent = 0): string {
    const spaces = ' '.repeat(indent)
    const tag = component.type
    const attributes = this.generateHTMLAttributes(component)
    
    if (component.children && component.children.length > 0) {
      const childrenHTML = component.children
        .map(child => this.generateHTMLElement(child, indent + 2))
        .join('\n')
      
      return `${spaces}<${tag}${attributes}>\n${childrenHTML}\n${spaces}</${tag}>`
    } else if (component.content) {
      return `${spaces}<${tag}${attributes}>${component.content}</${tag}>`
    } else {
      return `${spaces}<${tag}${attributes}></${tag}>`
    }
  }
  
  private generateHTMLAttributes(component: VisualComponent): string {
    const attributes = []
    
    if (component.id) {
      attributes.push(`id="${component.id}"`)
    }
    
    const className = this.generateClassName(component)
    if (className) {
      attributes.push(`class="${className}"`)
    }
    
    if (component.props) {
      Object.entries(component.props).forEach(([key, value]) => {
        if (key !== 'className' && key !== 'style') {
          attributes.push(`${key}="${value}"`)
        }
      })
    }
    
    return attributes.length > 0 ? ' ' + attributes.join(' ') : ''
  }
  
  private generateCSS(components: VisualComponent[]): string {
    const cssRules: string[] = []
    
    components.forEach(component => {
      this.collectCSSRules(component, cssRules)
    })
    
    return cssRules.join('\n\n')
  }
  
  private collectCSSRules(component: VisualComponent, rules: string[]): void {
    if (component.styles && Object.keys(component.styles).length > 0) {
      const selector = component.id ? `#${component.id}` : `.${component.className || component.type}`
      const properties = Object.entries(component.styles)
        .map(([key, value]) => `  ${this.camelToKebab(key)}: ${value};`)
        .join('\n')
      
      rules.push(`${selector} {\n${properties}\n}`)
    }
    
    if (component.children) {
      component.children.forEach(child => this.collectCSSRules(child, rules))
    }
  }
  
  private generateVueTemplate(components: VisualComponent[]): string {
    return components.map(component => this.generateVueElement(component, 2)).join('\n')
  }
  
  private generateVueElement(component: VisualComponent, indent = 0): string {
    // Similar to HTML generation but with Vue-specific syntax
    return this.generateHTMLElement(component, indent)
  }
  
  private generateVueScript(): string {
    return `export default {\n  name: '${this.options.componentName || 'GeneratedComponent'}',\n  data() {\n    return {}\n  }\n}`
  }
  
  private generateVueStyles(components: VisualComponent[]): string {
    return this.generateCSS(components)
  }
  
  private generateStyles(components: VisualComponent[]): string {
    if (this.options.cssFramework === 'tailwind') {
      return '// Styles are handled by Tailwind CSS classes'
    }
    
    return `const styles = {\n${this.generateStyleObject(components)}\n}`
  }
  
  private generateStyleObject(components: VisualComponent[]): string {
    const styles: string[] = []
    
    components.forEach(component => {
      this.collectStyleObjects(component, styles)
    })
    
    return styles.join(',\n')
  }
  
  private collectStyleObjects(component: VisualComponent, styles: string[]): void {
    if (component.styles && Object.keys(component.styles).length > 0) {
      const styleName = component.id || component.className || component.type
      const properties = Object.entries(component.styles)
        .map(([key, value]) => `    ${key}: '${value}'`)
        .join(',\n')
      
      styles.push(`  ${styleName}: {\n${properties}\n  }`)
    }
    
    if (component.children) {
      component.children.forEach(child => this.collectStyleObjects(child, styles))
    }
  }
  
  private camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
  }
}

export function CodeGeneratorComponent({
  components,
  selectedComponent,
  onCodeGenerate,
  onCodeCopy,
  onCodeDownload,
  className = '',
  showPreview = true,
  defaultFormat = 'react'
}: CodeGeneratorProps) {
  const [format, setFormat] = useState<CodeFormat>(defaultFormat as CodeFormat)
  const [codeStyle, setCodeStyle] = useState<CodeStyle>('functional')
  const [cssFramework, setCssFramework] = useState<CSSFramework>('tailwind')
  const [componentName, setComponentName] = useState('GeneratedComponent')
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  
  const generationOptions: CodeGenerationOptions = {
    format,
    codeStyle,
    cssFramework,
    componentName,
    includeComments: true,
    minify: false,
    typescript: format === 'angular'
  }
  
  const generatedCode = useMemo(() => {
    if (!components.length) return ''
    
    const generator = new CodeGenerator(generationOptions)
    
    switch (format) {
      case 'react':
        return generator.generateReactCode(components)
      case 'html':
        return generator.generateHTMLCode(components)
      case 'vue':
        return generator.generateVueCode(components)
      case 'angular':
        return generator.generateReactCode(components) // Placeholder
      case 'svelte':
        return generator.generateReactCode(components) // Placeholder
      default:
        return generator.generateReactCode(components)
    }
  }, [components, generationOptions])
  
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onCodeGenerate?.(generatedCode, format)
      setLastGenerated(new Date())
    } catch (error) {
      console.error('Code generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [generatedCode, format, onCodeGenerate])
  
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      onCodeCopy?.(generatedCode)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }, [generatedCode, onCodeCopy])
  
  const handleDownload = useCallback(() => {
    const formatInfo = CODE_FORMATS[format]
    const filename = `${componentName}.${formatInfo.extension}`
    
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    onCodeDownload?.(generatedCode, filename)
  }, [generatedCode, format, componentName, onCodeDownload])
  
  const openInCodeSandbox = useCallback(() => {
    // Create CodeSandbox configuration
    const files = {
      [`src/${componentName}.${CODE_FORMATS[format].extension}`]: {
        content: generatedCode
      },
      'package.json': {
        content: JSON.stringify({
          name: componentName.toLowerCase(),
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0'
          }
        }, null, 2)
      }
    }
    
    const parameters = btoa(JSON.stringify({ files }))
    const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`
    
    window.open(url, '_blank')
  }, [generatedCode, format, componentName])
  
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Generator
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating || !components.length}
              className="h-8"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">Generate</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!generatedCode}
              className="h-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={!generatedCode}
              className="h-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Generation Options */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Format
            </label>
            <Select value={format} onValueChange={(value: CodeFormat) => setFormat(value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CODE_FORMATS).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      {info.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              CSS Framework
            </label>
            <Select value={cssFramework} onValueChange={(value: CSSFramework) => setCssFramework(value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CSS_FRAMEWORKS).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {components.length > 0 ? (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {components.length} component{components.length !== 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                No components
              </Badge>
            )}
            
            {lastGenerated && (
              <span className="text-xs text-gray-500">
                Generated {lastGenerated.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {generatedCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openInCodeSandbox}
              className="h-6 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              CodeSandbox
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs defaultValue="code" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-6">
            <TabsTrigger value="code" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs" disabled={!showPreview}>
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1">
            <TabsContent value="code" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {generatedCode ? (
                    <pre className="text-xs bg-gray-50 border rounded-lg p-4 overflow-x-auto">
                      <code>{generatedCode}</code>
                    </pre>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No code generated</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Add components to generate code
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="preview" className="h-full m-0">
              <div className="h-full p-6">
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Preview coming soon</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Live preview of generated code
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default CodeGeneratorComponent