import type {
  VisualComponent,
  CodeGenerationOptions,
  ComponentTemplate
} from '../types/visual-editor.types'

export interface CodeGeneratorConfig {
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'html'
  cssFramework: 'tailwind' | 'bootstrap' | 'material' | 'custom'
  typescript: boolean
  includeComments: boolean
  formatCode: boolean
  exportType: 'component' | 'page' | 'snippet'
}

export class CodeGenerator {
  private config: CodeGeneratorConfig

  constructor(config: CodeGeneratorConfig) {
    this.config = config
  }

  generateCode(components: VisualComponent[], options?: CodeGenerationOptions): string {
    switch (this.config.framework) {
      case 'react':
        return this.generateReactCode(components, options)
      case 'vue':
        return this.generateVueCode(components, options)
      case 'angular':
        return this.generateAngularCode(components, options)
      case 'svelte':
        return this.generateSvelteCode(components, options)
      case 'html':
        return this.generateHTMLCode(components, options)
      default:
        throw new Error(`Unsupported framework: ${this.config.framework}`)
    }
  }

  private generateReactCode(components: VisualComponent[], options?: CodeGenerationOptions): string {
    const imports = this.generateReactImports(components)
    const componentCode = this.generateReactComponent(components, options)
    const exports = this.generateReactExports(options)

    return `${imports}\n\n${componentCode}\n\n${exports}`
  }

  private generateReactImports(components: VisualComponent[]): string {
    const imports = new Set(['React'])
    
    // Add framework-specific imports
    if (this.config.cssFramework === 'material') {
      imports.add('{ ThemeProvider, createTheme }')
    }
    
    // Add component-specific imports
    components.forEach(component => {
      if (component.type === 'Button' && this.config.cssFramework === 'material') {
        imports.add('{ Button }')
      }
      if (component.type === 'Input' && this.config.cssFramework === 'material') {
        imports.add('{ TextField }')
      }
    })

    const reactImport = this.config.typescript 
      ? `import React from 'react'`
      : `import React from 'react'`
    
    const frameworkImports = this.generateFrameworkImports()
    
    return [reactImport, ...frameworkImports].join('\n')
  }

  private generateFrameworkImports(): string[] {
    switch (this.config.cssFramework) {
      case 'material':
        return [
          `import { ThemeProvider, createTheme } from '@mui/material/styles'`,
          `import CssBaseline from '@mui/material/CssBaseline'`
        ]
      case 'bootstrap':
        return [`import 'bootstrap/dist/css/bootstrap.min.css'`]
      case 'tailwind':
        return [] // Tailwind is typically imported globally
      default:
        return []
    }
  }

  private generateReactComponent(components: VisualComponent[], options?: CodeGenerationOptions): string {
    const componentName = options?.componentName || 'GeneratedComponent'
    const typeAnnotation = this.config.typescript ? ': React.FC' : ''
    
    const componentBody = this.generateComponentBody(components)
    
    if (this.config.includeComments) {
      return `/**\n * Generated component from Visual Editor\n * Created: ${new Date().toISOString()}\n */\nconst ${componentName}${typeAnnotation} = () => {\n  return (\n${componentBody}\n  )\n}`
    }
    
    return `const ${componentName}${typeAnnotation} = () => {\n  return (\n${componentBody}\n  )\n}`
  }

  private generateComponentBody(components: VisualComponent[]): string {
    if (components.length === 0) {
      return '    <div>Empty component</div>'
    }

    const rootComponents = components.filter(c => !c.parentId)
    return rootComponents.map(component => this.generateComponentJSX(component, components, 2)).join('\n')
  }

  private generateComponentJSX(component: VisualComponent, allComponents: VisualComponent[], indent: number): string {
    const indentStr = '  '.repeat(indent)
    const props = this.generateComponentProps(component)
    const children = allComponents.filter(c => c.parentId === component.id)
    
    const tagName = this.getJSXTagName(component.type)
    
    if (children.length === 0 && !component.content) {
      return `${indentStr}<${tagName}${props} />`
    }
    
    const childrenJSX = children.map(child => 
      this.generateComponentJSX(child, allComponents, indent + 1)
    ).join('\n')
    
    const content = component.content ? component.content : ''
    const innerContent = childrenJSX || content
    
    return `${indentStr}<${tagName}${props}>\n${innerContent}\n${indentStr}</${tagName}>`
  }

  private generateComponentProps(component: VisualComponent): string {
    const props: string[] = []
    
    // Add className
    const className = this.generateClassName(component)
    if (className) {
      props.push(`className="${className}"`)
    }
    
    // Add component-specific props
    Object.entries(component.props || {}).forEach(([key, value]) => {
      if (key !== 'className' && key !== 'style') {
        if (typeof value === 'string') {
          props.push(`${key}="${value}"`)
        } else {
          props.push(`${key}={${JSON.stringify(value)}}`)
        }
      }
    })
    
    // Add inline styles if not using CSS framework
    if (this.config.cssFramework === 'custom' && component.styles) {
      const styleObj = this.generateInlineStyles(component.styles)
      if (styleObj) {
        props.push(`style={${styleObj}}`)
      }
    }
    
    return props.length > 0 ? ' ' + props.join(' ') : ''
  }

  private generateClassName(component: VisualComponent): string {
    switch (this.config.cssFramework) {
      case 'tailwind':
        return this.generateTailwindClasses(component)
      case 'bootstrap':
        return this.generateBootstrapClasses(component)
      case 'material':
        return this.generateMaterialClasses(component)
      default:
        return component.props?.className || ''
    }
  }

  private generateTailwindClasses(component: VisualComponent): string {
    const classes: string[] = []
    
    // Layout classes
    if (component.styles?.display) {
      switch (component.styles.display) {
        case 'flex':
          classes.push('flex')
          break
        case 'grid':
          classes.push('grid')
          break
        case 'block':
          classes.push('block')
          break
        case 'inline-block':
          classes.push('inline-block')
          break
      }
    }
    
    // Spacing classes
    if (component.styles?.padding) {
      classes.push(`p-${this.convertToTailwindSpacing(component.styles.padding)}`)
    }
    if (component.styles?.margin) {
      classes.push(`m-${this.convertToTailwindSpacing(component.styles.margin)}`)
    }
    
    // Color classes
    if (component.styles?.backgroundColor) {
      classes.push(this.convertToTailwindColor(component.styles.backgroundColor, 'bg'))
    }
    if (component.styles?.color) {
      classes.push(this.convertToTailwindColor(component.styles.color, 'text'))
    }
    
    // Typography classes
    if (component.styles?.fontSize) {
      classes.push(this.convertToTailwindFontSize(component.styles.fontSize))
    }
    if (component.styles?.fontWeight) {
      classes.push(this.convertToTailwindFontWeight(component.styles.fontWeight))
    }
    
    // Border classes
    if (component.styles?.border) {
      classes.push('border')
    }
    if (component.styles?.borderRadius) {
      classes.push(this.convertToTailwindBorderRadius(component.styles.borderRadius))
    }
    
    return classes.join(' ')
  }

  private generateBootstrapClasses(component: VisualComponent): string {
    const classes: string[] = []
    
    // Component-specific Bootstrap classes
    switch (component.type) {
      case 'Button':
        classes.push('btn', 'btn-primary')
        break
      case 'Input':
        classes.push('form-control')
        break
      case 'Container':
        classes.push('container')
        break
      case 'Row':
        classes.push('row')
        break
      case 'Column':
        classes.push('col')
        break
    }
    
    return classes.join(' ')
  }

  private generateMaterialClasses(component: VisualComponent): string {
    // Material-UI typically uses sx prop or styled components
    return ''
  }

  private generateInlineStyles(styles: Record<string, any>): string {
    const styleEntries = Object.entries(styles)
      .filter(([key, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${this.camelToKebab(key)}: '${value}'`)
    
    if (styleEntries.length === 0) return ''
    
    return `{ ${styleEntries.join(', ')} }`
  }

  private getJSXTagName(componentType: string): string {
    const tagMap: Record<string, string> = {
      'Container': 'div',
      'Text': 'span',
      'Heading': 'h1',
      'Button': 'button',
      'Input': 'input',
      'Image': 'img',
      'Link': 'a',
      'List': 'ul',
      'ListItem': 'li'
    }
    
    return tagMap[componentType] || 'div'
  }

  private generateReactExports(options?: CodeGenerationOptions): string {
    const componentName = options?.componentName || 'GeneratedComponent'
    return `export default ${componentName}`
  }

  private generateVueCode(components: VisualComponent[], options?: CodeGenerationOptions): string {
    // Vue.js code generation implementation
    return `<template>\n  <!-- Vue component -->\n</template>\n\n<script>\nexport default {\n  name: '${options?.componentName || 'GeneratedComponent'}'\n}\n</script>`
  }

  private generateAngularCode(components: VisualComponent[], options?: CodeGenerationOptions): string {
    // Angular code generation implementation
    return `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-generated',\n  template: \`\n    <!-- Angular component -->\n  \`\n})\nexport class GeneratedComponent { }`
  }

  private generateSvelteCode(components: VisualComponent[], options?: CodeGenerationOptions): string {
    // Svelte code generation implementation
    return `<script>\n  // Svelte component\n</script>\n\n<!-- Svelte template -->`
  }

  private generateHTMLCode(components: VisualComponent[], options?: CodeGenerationOptions): string {
    const head = this.generateHTMLHead()
    const body = this.generateHTMLBody(components)
    
    return `<!DOCTYPE html>\n<html lang="en">\n${head}\n${body}\n</html>`
  }

  private generateHTMLHead(): string {
    const cssLinks = this.generateCSSLinks()
    return `<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Page</title>\n${cssLinks}\n</head>`
  }

  private generateCSSLinks(): string {
    switch (this.config.cssFramework) {
      case 'bootstrap':
        return '  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">'
      case 'tailwind':
        return '  <script src="https://cdn.tailwindcss.com"></script>'
      case 'material':
        return '  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet">'
      default:
        return ''
    }
  }

  private generateHTMLBody(components: VisualComponent[]): string {
    const bodyContent = this.generateHTMLElements(components)
    return `<body>\n${bodyContent}\n</body>`
  }

  private generateHTMLElements(components: VisualComponent[]): string {
    const rootComponents = components.filter(c => !c.parentId)
    return rootComponents.map(component => this.generateHTMLElement(component, components, 1)).join('\n')
  }

  private generateHTMLElement(component: VisualComponent, allComponents: VisualComponent[], indent: number): string {
    const indentStr = '  '.repeat(indent)
    const tagName = this.getHTMLTagName(component.type)
    const attributes = this.generateHTMLAttributes(component)
    const children = allComponents.filter(c => c.parentId === component.id)
    
    if (children.length === 0 && !component.content) {
      return `${indentStr}<${tagName}${attributes} />`
    }
    
    const childrenHTML = children.map(child => 
      this.generateHTMLElement(child, allComponents, indent + 1)
    ).join('\n')
    
    const content = component.content || ''
    const innerContent = childrenHTML || content
    
    return `${indentStr}<${tagName}${attributes}>\n${innerContent}\n${indentStr}</${tagName}>`
  }

  private generateHTMLAttributes(component: VisualComponent): string {
    const attrs: string[] = []
    
    const className = this.generateClassName(component)
    if (className) {
      attrs.push(`class="${className}"`)
    }
    
    Object.entries(component.props || {}).forEach(([key, value]) => {
      if (key !== 'className' && key !== 'style') {
        attrs.push(`${key}="${value}"`)
      }
    })
    
    return attrs.length > 0 ? ' ' + attrs.join(' ') : ''
  }

  private getHTMLTagName(componentType: string): string {
    const tagMap: Record<string, string> = {
      'Container': 'div',
      'Text': 'span',
      'Heading': 'h1',
      'Button': 'button',
      'Input': 'input',
      'Image': 'img',
      'Link': 'a',
      'List': 'ul',
      'ListItem': 'li'
    }
    
    return tagMap[componentType] || 'div'
  }

  // Utility methods for Tailwind CSS conversion
  private convertToTailwindSpacing(value: string): string {
    const numValue = parseInt(value)
    if (numValue <= 4) return '1'
    if (numValue <= 8) return '2'
    if (numValue <= 12) return '3'
    if (numValue <= 16) return '4'
    if (numValue <= 20) return '5'
    if (numValue <= 24) return '6'
    return '8'
  }

  private convertToTailwindColor(color: string, prefix: string): string {
    const colorMap: Record<string, string> = {
      '#ffffff': 'white',
      '#000000': 'black',
      '#ef4444': 'red-500',
      '#3b82f6': 'blue-500',
      '#10b981': 'green-500',
      '#f59e0b': 'yellow-500',
      '#8b5cf6': 'purple-500'
    }
    
    return `${prefix}-${colorMap[color.toLowerCase()] || 'gray-500'}`
  }

  private convertToTailwindFontSize(fontSize: string): string {
    const sizeMap: Record<string, string> = {
      '12px': 'text-xs',
      '14px': 'text-sm',
      '16px': 'text-base',
      '18px': 'text-lg',
      '20px': 'text-xl',
      '24px': 'text-2xl',
      '30px': 'text-3xl'
    }
    
    return sizeMap[fontSize] || 'text-base'
  }

  private convertToTailwindFontWeight(fontWeight: string): string {
    const weightMap: Record<string, string> = {
      '300': 'font-light',
      '400': 'font-normal',
      '500': 'font-medium',
      '600': 'font-semibold',
      '700': 'font-bold',
      '800': 'font-extrabold'
    }
    
    return weightMap[fontWeight] || 'font-normal'
  }

  private convertToTailwindBorderRadius(borderRadius: string): string {
    const radiusMap: Record<string, string> = {
      '0px': 'rounded-none',
      '2px': 'rounded-sm',
      '4px': 'rounded',
      '6px': 'rounded-md',
      '8px': 'rounded-lg',
      '12px': 'rounded-xl',
      '16px': 'rounded-2xl'
    }
    
    return radiusMap[borderRadius] || 'rounded'
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }
}

// Export utility functions
export const generateReactCode = (components: VisualComponent[], config: CodeGeneratorConfig, options?: CodeGenerationOptions): string => {
  const generator = new CodeGenerator(config)
  return generator.generateCode(components, options)
}

export const generateVueCode = (components: VisualComponent[], config: CodeGeneratorConfig, options?: CodeGenerationOptions): string => {
  const generator = new CodeGenerator({ ...config, framework: 'vue' })
  return generator.generateCode(components, options)
}

export const generateAngularCode = (components: VisualComponent[], config: CodeGeneratorConfig, options?: CodeGenerationOptions): string => {
  const generator = new CodeGenerator({ ...config, framework: 'angular' })
  return generator.generateCode(components, options)
}

export const generateSvelteCode = (components: VisualComponent[], config: CodeGeneratorConfig, options?: CodeGenerationOptions): string => {
  const generator = new CodeGenerator({ ...config, framework: 'svelte' })
  return generator.generateCode(components, options)
}

export const generateHTMLCode = (components: VisualComponent[], config: CodeGeneratorConfig, options?: CodeGenerationOptions): string => {
  const generator = new CodeGenerator({ ...config, framework: 'html' })
  return generator.generateCode(components, options)
}