import type {
  VisualComponent,
  ComponentTemplate,
  ComponentValidation,
  ResponsiveBreakpoint,
  ResponsiveStyles
} from '../types/visual-editor.types'

// Component ID generation
export const generateComponentId = (): string => {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Component creation utilities
export const createComponent = (
  type: string,
  props: Record<string, any> = {},
  styles: Record<string, any> = {},
  position: { x: number; y: number } = { x: 0, y: 0 },
  size: { width: number; height: number } = { width: 100, height: 50 }
): VisualComponent => {
  return {
    id: generateComponentId(),
    type,
    props,
    styles,
    position,
    size,
    children: [],
    parentId: null,
    content: '',
    locked: false,
    visible: true,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    }
  }
}

// Component templates
export const getComponentTemplate = (type: string): ComponentTemplate => {
  const templates: Record<string, ComponentTemplate> = {
    Button: {
      id: 'button-template',
      name: 'Button',
      category: 'Form',
      description: 'Interactive button component',
      icon: 'Mouse',
      defaultProps: {
        children: 'Click me',
        variant: 'primary',
        size: 'medium',
        disabled: false
      },
      defaultStyles: {
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: '#3b82f6',
        color: '#ffffff'
      },
      defaultSize: { width: 120, height: 40 },
      allowedChildren: [],
      requiredProps: [],
      validation: {
        rules: [
          {
            field: 'children',
            type: 'required',
            message: 'Button text is required'
          }
        ],
        isValid: true,
        errors: []
      }
    },
    Input: {
      id: 'input-template',
      name: 'Input',
      category: 'Form',
      description: 'Text input field',
      icon: 'Type',
      defaultProps: {
        type: 'text',
        placeholder: 'Enter text...',
        disabled: false,
        required: false
      },
      defaultStyles: {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%'
      },
      defaultSize: { width: 200, height: 40 },
      allowedChildren: [],
      requiredProps: [],
      validation: {
        rules: [],
        isValid: true,
        errors: []
      }
    },
    Container: {
      id: 'container-template',
      name: 'Container',
      category: 'Layout',
      description: 'Flexible container for other components',
      icon: 'Square',
      defaultProps: {},
      defaultStyles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      },
      defaultSize: { width: 300, height: 200 },
      allowedChildren: ['*'],
      requiredProps: [],
      validation: {
        rules: [],
        isValid: true,
        errors: []
      }
    },
    Text: {
      id: 'text-template',
      name: 'Text',
      category: 'Typography',
      description: 'Text content',
      icon: 'Type',
      defaultProps: {
        children: 'Sample text'
      },
      defaultStyles: {
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.5'
      },
      defaultSize: { width: 150, height: 24 },
      allowedChildren: [],
      requiredProps: ['children'],
      validation: {
        rules: [
          {
            field: 'children',
            type: 'required',
            message: 'Text content is required'
          }
        ],
        isValid: true,
        errors: []
      }
    },
    Heading: {
      id: 'heading-template',
      name: 'Heading',
      category: 'Typography',
      description: 'Heading text',
      icon: 'Heading',
      defaultProps: {
        children: 'Heading',
        level: 1
      },
      defaultStyles: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        margin: '0 0 16px 0'
      },
      defaultSize: { width: 200, height: 32 },
      allowedChildren: [],
      requiredProps: ['children'],
      validation: {
        rules: [
          {
            field: 'children',
            type: 'required',
            message: 'Heading text is required'
          },
          {
            field: 'level',
            type: 'range',
            min: 1,
            max: 6,
            message: 'Heading level must be between 1 and 6'
          }
        ],
        isValid: true,
        errors: []
      }
    },
    Image: {
      id: 'image-template',
      name: 'Image',
      category: 'Media',
      description: 'Image component',
      icon: 'Image',
      defaultProps: {
        src: 'https://via.placeholder.com/300x200',
        alt: 'Placeholder image'
      },
      defaultStyles: {
        width: '100%',
        height: 'auto',
        borderRadius: '4px'
      },
      defaultSize: { width: 300, height: 200 },
      allowedChildren: [],
      requiredProps: ['src', 'alt'],
      validation: {
        rules: [
          {
            field: 'src',
            type: 'required',
            message: 'Image source is required'
          },
          {
            field: 'alt',
            type: 'required',
            message: 'Alt text is required for accessibility'
          }
        ],
        isValid: true,
        errors: []
      }
    },
    Card: {
      id: 'card-template',
      name: 'Card',
      category: 'Layout',
      description: 'Card container with shadow',
      icon: 'Square',
      defaultProps: {},
      defaultStyles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      defaultSize: { width: 320, height: 240 },
      allowedChildren: ['*'],
      requiredProps: [],
      validation: {
        rules: [],
        isValid: true,
        errors: []
      }
    },
    Grid: {
      id: 'grid-template',
      name: 'Grid',
      category: 'Layout',
      description: 'CSS Grid layout container',
      icon: 'Grid3X3',
      defaultProps: {
        columns: 3,
        gap: 16
      },
      defaultStyles: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        padding: '16px'
      },
      defaultSize: { width: 400, height: 300 },
      allowedChildren: ['*'],
      requiredProps: [],
      validation: {
        rules: [],
        isValid: true,
        errors: []
      }
    },
    Flex: {
      id: 'flex-template',
      name: 'Flex',
      category: 'Layout',
      description: 'Flexbox layout container',
      icon: 'AlignJustify',
      defaultProps: {
        direction: 'row',
        justify: 'flex-start',
        align: 'flex-start',
        gap: 8
      },
      defaultStyles: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '16px'
      },
      defaultSize: { width: 400, height: 200 },
      allowedChildren: ['*'],
      requiredProps: [],
      validation: {
        rules: [],
        isValid: true,
        errors: []
      }
    }
  }

  return templates[type] || templates.Container
}

// Component validation
export const validateComponent = (component: VisualComponent): ComponentValidation => {
  const template = getComponentTemplate(component.type)
  const validation: ComponentValidation = {
    rules: template.validation?.rules || [],
    isValid: true,
    errors: []
  }

  // Validate required props
  template.requiredProps?.forEach(prop => {
    if (!component.props?.[prop] && !component.content) {
      validation.errors.push({
        field: prop,
        message: `${prop} is required`,
        type: 'required'
      })
    }
  })

  // Validate custom rules
  template.validation?.rules.forEach(rule => {
    const value = component.props?.[rule.field] || component.content
    
    switch (rule.type) {
      case 'required':
        if (!value) {
          validation.errors.push({
            field: rule.field,
            message: rule.message,
            type: 'required'
          })
        }
        break
      
      case 'range':
        if (rule.min !== undefined && value < rule.min) {
          validation.errors.push({
            field: rule.field,
            message: rule.message,
            type: 'range'
          })
        }
        if (rule.max !== undefined && value > rule.max) {
          validation.errors.push({
            field: rule.field,
            message: rule.message,
            type: 'range'
          })
        }
        break
      
      case 'pattern':
        if (rule.pattern && !new RegExp(rule.pattern).test(String(value))) {
          validation.errors.push({
            field: rule.field,
            message: rule.message,
            type: 'pattern'
          })
        }
        break
    }
  })

  validation.isValid = validation.errors.length === 0
  return validation
}

// Component hierarchy utilities
export const findComponentById = (components: VisualComponent[], id: string): VisualComponent | null => {
  return components.find(component => component.id === id) || null
}

export const getComponentChildren = (components: VisualComponent[], parentId: string): VisualComponent[] => {
  return components.filter(component => component.parentId === parentId)
}

export const getComponentParent = (components: VisualComponent[], childId: string): VisualComponent | null => {
  const child = findComponentById(components, childId)
  if (!child?.parentId) return null
  return findComponentById(components, child.parentId)
}

export const getComponentAncestors = (components: VisualComponent[], componentId: string): VisualComponent[] => {
  const ancestors: VisualComponent[] = []
  let current = findComponentById(components, componentId)
  
  while (current?.parentId) {
    const parent = findComponentById(components, current.parentId)
    if (parent) {
      ancestors.unshift(parent)
      current = parent
    } else {
      break
    }
  }
  
  return ancestors
}

export const getComponentDescendants = (components: VisualComponent[], parentId: string): VisualComponent[] => {
  const descendants: VisualComponent[] = []
  const children = getComponentChildren(components, parentId)
  
  children.forEach(child => {
    descendants.push(child)
    descendants.push(...getComponentDescendants(components, child.id))
  })
  
  return descendants
}

// Component positioning utilities
export const isComponentInside = (child: VisualComponent, parent: VisualComponent): boolean => {
  return (
    child.position.x >= parent.position.x &&
    child.position.y >= parent.position.y &&
    child.position.x + child.size.width <= parent.position.x + parent.size.width &&
    child.position.y + child.size.height <= parent.position.y + parent.size.height
  )
}

export const getComponentBounds = (component: VisualComponent) => {
  return {
    left: component.position.x,
    top: component.position.y,
    right: component.position.x + component.size.width,
    bottom: component.position.y + component.size.height,
    width: component.size.width,
    height: component.size.height
  }
}

export const doComponentsOverlap = (comp1: VisualComponent, comp2: VisualComponent): boolean => {
  const bounds1 = getComponentBounds(comp1)
  const bounds2 = getComponentBounds(comp2)
  
  return !(
    bounds1.right <= bounds2.left ||
    bounds2.right <= bounds1.left ||
    bounds1.bottom <= bounds2.top ||
    bounds2.bottom <= bounds1.top
  )
}

// Component transformation utilities
export const moveComponent = (component: VisualComponent, deltaX: number, deltaY: number): VisualComponent => {
  return {
    ...component,
    position: {
      x: component.position.x + deltaX,
      y: component.position.y + deltaY
    },
    metadata: {
      ...component.metadata,
      updatedAt: new Date()
    }
  }
}

export const resizeComponent = (
  component: VisualComponent,
  newWidth: number,
  newHeight: number
): VisualComponent => {
  return {
    ...component,
    size: {
      width: Math.max(10, newWidth), // Minimum size
      height: Math.max(10, newHeight)
    },
    metadata: {
      ...component.metadata,
      updatedAt: new Date()
    }
  }
}

export const cloneComponent = (component: VisualComponent, offsetX = 20, offsetY = 20): VisualComponent => {
  return {
    ...component,
    id: generateComponentId(),
    position: {
      x: component.position.x + offsetX,
      y: component.position.y + offsetY
    },
    parentId: null, // Cloned components start without parent
    metadata: {
      ...component.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

// Component styling utilities
export const mergeStyles = (baseStyles: Record<string, any>, newStyles: Record<string, any>): Record<string, any> => {
  return { ...baseStyles, ...newStyles }
}

export const getResponsiveStyles = (
  component: VisualComponent,
  breakpoint: ResponsiveBreakpoint
): Record<string, any> => {
  const responsiveStyles = component.responsiveStyles?.[breakpoint.name]
  return responsiveStyles ? mergeStyles(component.styles || {}, responsiveStyles) : component.styles || {}
}

export const setResponsiveStyle = (
  component: VisualComponent,
  breakpoint: string,
  property: string,
  value: any
): VisualComponent => {
  const responsiveStyles = component.responsiveStyles || {}
  const breakpointStyles = responsiveStyles[breakpoint] || {}
  
  return {
    ...component,
    responsiveStyles: {
      ...responsiveStyles,
      [breakpoint]: {
        ...breakpointStyles,
        [property]: value
      }
    },
    metadata: {
      ...component.metadata,
      updatedAt: new Date()
    }
  }
}

// Component search and filtering
export const searchComponents = (components: VisualComponent[], query: string): VisualComponent[] => {
  const lowercaseQuery = query.toLowerCase()
  
  return components.filter(component => {
    // Search in component type
    if (component.type.toLowerCase().includes(lowercaseQuery)) {
      return true
    }
    
    // Search in component content
    if (component.content?.toLowerCase().includes(lowercaseQuery)) {
      return true
    }
    
    // Search in component props
    const propsText = Object.values(component.props || {}).join(' ').toLowerCase()
    if (propsText.includes(lowercaseQuery)) {
      return true
    }
    
    return false
  })
}

export const filterComponentsByType = (components: VisualComponent[], types: string[]): VisualComponent[] => {
  return components.filter(component => types.includes(component.type))
}

export const filterVisibleComponents = (components: VisualComponent[]): VisualComponent[] => {
  return components.filter(component => component.visible !== false)
}

export const filterUnlockedComponents = (components: VisualComponent[]): VisualComponent[] => {
  return components.filter(component => component.locked !== true)
}

// Component export utilities
export const exportComponentsAsJSON = (components: VisualComponent[]): string => {
  return JSON.stringify(components, null, 2)
}

export const importComponentsFromJSON = (json: string): VisualComponent[] => {
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      return parsed.map(component => ({
        ...component,
        metadata: {
          ...component.metadata,
          updatedAt: new Date()
        }
      }))
    }
    return []
  } catch (error) {
    console.error('Failed to import components from JSON:', error)
    return []
  }
}

// Component statistics
export const getComponentStats = (components: VisualComponent[]) => {
  const stats = {
    total: components.length,
    byType: {} as Record<string, number>,
    visible: components.filter(c => c.visible !== false).length,
    locked: components.filter(c => c.locked === true).length,
    withChildren: components.filter(c => getComponentChildren(components, c.id).length > 0).length
  }
  
  components.forEach(component => {
    stats.byType[component.type] = (stats.byType[component.type] || 0) + 1
  })
  
  return stats
}