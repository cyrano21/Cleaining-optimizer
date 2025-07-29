import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type {
  VisualComponent,
  VisualEditorState,
  VisualEditorAction,
  CodeGenerationOptions
} from '../types/visual-editor.types'

interface UseVisualEditorOptions {
  maxHistorySize?: number
  autoSave?: boolean
  autoSaveInterval?: number
  onStateChange?: (state: VisualEditorState) => void
  initialState?: Partial<VisualEditorState>
}

const DEFAULT_OPTIONS: UseVisualEditorOptions = {
  maxHistorySize: 50,
  autoSave: false,
  autoSaveInterval: 5000
}

export function useVisualEditor(
  initialCode: string = '',
  options: UseVisualEditorOptions = {}
) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options])
  
  const [editorState, setEditorState] = useState<VisualEditorState>(() => {
    const defaultState: VisualEditorState = {
      components: [],
      selectedComponentId: null,
      history: {
        past: [],
        present: [],
        future: []
      },
      canvas: {
        zoom: 100,
        device: 'desktop',
        gridVisible: true
      },
      mode: 'design'
    }
    
    // Merge with initialState if provided
    if (opts.initialState) {
      return {
        ...defaultState,
        ...opts.initialState,
        components: opts.initialState.components || [],
        canvas: {
          ...defaultState.canvas,
          ...opts.initialState.canvas
        },
        history: {
          ...defaultState.history,
          ...opts.initialState.history
        }
      }
    }
    
    return defaultState
  })
  
  const actionHistory = useRef<VisualEditorAction[]>([])
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize from code if provided
  useEffect(() => {
    if (initialCode && editorState.components.length === 0) {
      const components = parseCodeToComponents(initialCode)
      setEditorState(prev => ({
        ...prev,
        components,
        history: {
          past: [],
          present: components,
          future: []
        }
      }))
    }
  }, [initialCode, editorState.components.length])
  
  // Auto-save functionality
  useEffect(() => {
    if (opts.autoSave) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      autoSaveTimer.current = setTimeout(() => {
        // Implement auto-save logic here
        console.log('Auto-saving visual editor state...')
      }, opts.autoSaveInterval)
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [editorState, opts.autoSave, opts.autoSaveInterval])
  
  // Notify state changes
  useEffect(() => {
    opts.onStateChange?.(editorState)
  }, [editorState, opts])
  
  const addToHistory = useCallback((action: VisualEditorAction) => {
    actionHistory.current.push(action)
    if (actionHistory.current.length > opts.maxHistorySize!) {
      actionHistory.current.shift()
    }
  }, [opts.maxHistorySize])
  
  const updateHistory = useCallback((newComponents: VisualComponent[]) => {
    setEditorState(prev => {
      const newHistory = {
        past: [...prev.history.past, prev.history.present].slice(-opts.maxHistorySize!),
        present: newComponents,
        future: []
      }
      
      return {
        ...prev,
        components: newComponents,
        history: newHistory
      }
    })
  }, [opts.maxHistorySize])
  
  const addComponent = useCallback((component: VisualComponent) => {
    const newComponents = [...editorState.components, component]
    updateHistory(newComponents)
    
    addToHistory({
      type: 'ADD_COMPONENT',
      payload: component,
      timestamp: Date.now()
    })
  }, [editorState.components, updateHistory, addToHistory])
  
  const updateComponent = useCallback((id: string, updates: Partial<VisualComponent>) => {
    const newComponents = editorState.components.map(comp =>
      comp.id === id ? { ...comp, ...updates } : comp
    )
    updateHistory(newComponents)
    
    addToHistory({
      type: 'UPDATE_COMPONENT',
      payload: { id, updates },
      timestamp: Date.now()
    })
  }, [editorState.components, updateHistory, addToHistory])
  
  const deleteComponent = useCallback((id: string) => {
    const componentToDelete = editorState.components.find(comp => comp.id === id)
    const newComponents = editorState.components.filter(comp => comp.id !== id)
    updateHistory(newComponents)
    
    // Clear selection if deleted component was selected
    if (editorState.selectedComponentId === id) {
      setEditorState(prev => ({
        ...prev,
        selectedComponentId: null
      }))
    }
    
    addToHistory({
      type: 'DELETE_COMPONENT',
      payload: componentToDelete,
      timestamp: Date.now()
    })
  }, [editorState.components, editorState.selectedComponentId, updateHistory, addToHistory])
  
  const selectComponent = useCallback((id: string | null) => {
    setEditorState(prev => ({
      ...prev,
      selectedComponentId: id
    }))
    
    addToHistory({
      type: 'SELECT_COMPONENT',
      payload: id,
      timestamp: Date.now()
    })
  }, [addToHistory])
  
  const moveComponent = useCallback((id: string, position: { x: number; y: number }) => {
    updateComponent(id, { position })
    
    addToHistory({
      type: 'MOVE_COMPONENT',
      payload: { id, position },
      timestamp: Date.now()
    })
  }, [updateComponent, addToHistory])
  
  const resizeComponent = useCallback((id: string, size: { width: number; height: number }) => {
    updateComponent(id, { size })
    
    addToHistory({
      type: 'RESIZE_COMPONENT',
      payload: { id, size },
      timestamp: Date.now()
    })
  }, [updateComponent, addToHistory])
  
  const undo = useCallback(() => {
    if (editorState.history.past.length === 0) return
    
    setEditorState(prev => {
      const previous = prev.history.past[prev.history.past.length - 1]
      const newPast = prev.history.past.slice(0, -1)
      
      return {
        ...prev,
        components: previous,
        history: {
          past: newPast,
          present: previous,
          future: [prev.history.present, ...prev.history.future]
        }
      }
    })
    
    addToHistory({
      type: 'UNDO',
      timestamp: Date.now()
    })
  }, [editorState.history.past.length, addToHistory])
  
  const redo = useCallback(() => {
    if (editorState.history.future.length === 0) return
    
    setEditorState(prev => {
      const next = prev.history.future[0]
      const newFuture = prev.history.future.slice(1)
      
      return {
        ...prev,
        components: next,
        history: {
          past: [...prev.history.past, prev.history.present],
          present: next,
          future: newFuture
        }
      }
    })
    
    addToHistory({
      type: 'REDO',
      timestamp: Date.now()
    })
  }, [editorState.history.future.length, addToHistory])
  
  const clearHistory = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      history: {
        past: [],
        present: prev.components,
        future: []
      }
    }))
    
    actionHistory.current = []
    
    addToHistory({
      type: 'CLEAR_HISTORY',
      timestamp: Date.now()
    })
  }, [addToHistory])
  
  const generateCode = useCallback((options: Partial<CodeGenerationOptions> = {}) => {
    const opts: CodeGenerationOptions = {
      framework: 'react',
      typescript: true,
      cssFramework: 'tailwind',
      formatting: {
        indentSize: 2,
        useTabs: false,
        semicolons: true,
        quotes: 'single'
      },
      ...options
    }
    
    return generateCodeFromComponents(editorState.components, opts)
  }, [editorState.components])
  
  const importCode = useCallback((code: string) => {
    const components = parseCodeToComponents(code)
    updateHistory(components)
  }, [updateHistory])
  
  const duplicateComponent = useCallback((id: string) => {
    const component = editorState.components.find(comp => comp.id === id)
    if (!component) return
    
    const duplicated: VisualComponent = {
      ...component,
      id: `${component.id}-copy-${Date.now()}`,
      position: {
        x: component.position.x + 20,
        y: component.position.y + 20
      }
    }
    
    addComponent(duplicated)
  }, [editorState.components, addComponent])
  
  const getComponentById = useCallback((id: string) => {
    return editorState.components.find(comp => comp.id === id)
  }, [editorState.components])
  
  const getSelectedComponent = useCallback(() => {
    if (!editorState.selectedComponentId) return null
    return getComponentById(editorState.selectedComponentId)
  }, [editorState.selectedComponentId, getComponentById])
  
  const canUndo = editorState.history.past.length > 0
  const canRedo = editorState.history.future.length > 0
  
  return {
    // State
    editorState,
    components: editorState.components,
    selectedComponent: getSelectedComponent(),
    history: actionHistory.current,
    
    // Actions
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    resizeComponent,
    duplicateComponent,
    
    // History
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    
    // Code generation
    generateCode,
    importCode,
    
    // Utilities
    getComponentById,
    getSelectedComponent
  }
}

// Helper functions
function parseCodeToComponents(code: string): VisualComponent[] {
  // This is a simplified parser - in a real implementation,
  // you would use a proper AST parser like @babel/parser
  const components: VisualComponent[] = []
  
  // Basic regex-based parsing for demonstration
  const componentRegex = /<(\w+)([^>]*)>([^<]*)<\/\1>/g
  let match
  let index = 0
  
  while ((match = componentRegex.exec(code)) !== null) {
    const [fullMatch, tagName, attributes] = match
    
    // Parse attributes
    const props: Record<string, string | number | boolean> = {}
    const styles: Record<string, string | number> = {}
    
    const attrRegex = /(\w+)=["']([^"']*)["']/g
    let attrMatch
    
    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      const [, attrName, attrValue] = attrMatch
      
      if (attrName === 'className') {
        // Parse Tailwind classes into styles
        const classes = attrValue.split(' ')
        classes.forEach(cls => {
          // This is a simplified mapping - you'd want a complete Tailwind parser
          if (cls.startsWith('bg-')) {
            styles.backgroundColor = cls
          } else if (cls.startsWith('text-')) {
            styles.color = cls
          }
          // Add more mappings as needed
        })
      } else {
        props[attrName] = attrValue
      }
    }
    
    components.push({
      id: `component-${index++}`,
      type: tagName.toLowerCase(),
      name: tagName,
      template: fullMatch,
      position: { x: index * 50, y: index * 50 },
      size: { width: 200, height: 100 },
      styles,
      props
    })
  }
  
  return components
}

function generateCodeFromComponents(
  components: VisualComponent[],
  options: CodeGenerationOptions
): string {
  const { framework, typescript, cssFramework, formatting } = options
  const { indentSize, useTabs, quotes } = formatting
  
  const indent = useTabs ? '\t' : ' '.repeat(indentSize)
  const quote = quotes === 'single' ? "'" : '"'
  
  if (framework === 'react') {
    let code = ''
    
    // Generate code that works in Babel script context (no import/export)
    const typeAnnotation = typescript ? ': React.FC' : ''
    code += `function GeneratedComponent()${typeAnnotation} {\n`
    code += indent + 'return React.createElement(' + quote + 'div' + quote + ', { className: ' + quote + 'generated-component' + quote + ' }, [\n'
    
    components.forEach((component, index) => {
      const componentCode = generateComponentCode(component, cssFramework, indent.repeat(2), quote)
      code += componentCode
      if (index < components.length - 1) {
        code += ',\n'
      } else {
        code += '\n'
      }
    })
    
    code += indent + ']);\n'
    code += '}\n\n'
    
    // Render the component directly
    code += 'ReactDOM.render(React.createElement(GeneratedComponent), document.getElementById(' + quote + 'generated-content' + quote + '));\n'
    
    return code
  }
  
  // Add support for other frameworks (Vue, Angular, etc.)
  return '// Framework not supported yet'
}

function generateComponentCode(
  component: VisualComponent,
  cssFramework: string,
  indent: string,
  quote: string
): string {
  if (cssFramework === 'tailwind') {
    // Generate Tailwind classes from styles
    const classes = generateTailwindClasses(component.styles)
    
    // Build props object
    const props: string[] = []
    
    // Add className if we have classes
    if (classes.length > 0) {
      props.push(`className: ${quote}${classes.join(' ')}${quote}`)
    }
    
    // Add other props
    Object.entries(component.props).forEach(([key, value]) => {
      if (key !== 'children') {
        props.push(`${key}: ${quote}${value}${quote}`)
      }
    })
    
    const propsStr = props.length > 0 ? `{ ${props.join(', ')} }` : 'null'
    const children = component.props.children ? `${quote}${component.props.children}${quote}` : 'null'
    
    return `${indent}React.createElement(${quote}${component.type}${quote}, ${propsStr}, ${children})`
  }
  
  return `${indent}React.createElement(${quote}div${quote}, null, ${quote}Component: ${component.name}${quote})`
}

function generateTailwindClasses(styles: Record<string, string | number>): string[] {
  const classes: string[] = []
  
  // This is a simplified mapping - you'd want a complete style-to-Tailwind converter
  Object.entries(styles).forEach(([property, value]) => {
    switch (property) {
      case 'backgroundColor':
        if (typeof value === 'string' && value.startsWith('bg-')) {
          classes.push(value)
        }
        break
      case 'color':
        if (typeof value === 'string' && value.startsWith('text-')) {
          classes.push(value)
        }
        break
      case 'padding':
        classes.push(`p-${value}`)
        break
      case 'margin':
        classes.push(`m-${value}`)
        break
      // Add more mappings as needed
    }
  })
  
  return classes
}