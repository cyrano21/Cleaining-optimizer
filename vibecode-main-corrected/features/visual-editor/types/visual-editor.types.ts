export interface VisualComponent {
  id: string
  type: string
  name: string
  template: string
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  styles: Record<string, any>
  props: Record<string, any>
  children?: VisualComponent[]
  parent?: string
}

export interface VisualEditorState {
  components: VisualComponent[]
  selectedComponentId: string | null
  history: {
    past: VisualComponent[][]
    present: VisualComponent[]
    future: VisualComponent[][]
  }
  canvas: {
    zoom: number
    device: 'mobile' | 'tablet' | 'desktop'
    gridVisible: boolean
  }
  mode: 'design' | 'code' | 'preview'
}

export interface ComponentTemplate {
  id: string
  name: string
  category: string
  icon: string
  template: string
  defaultProps?: Record<string, any>
  defaultStyles?: Record<string, any>
  description?: string
  preview?: string
}

export interface CSSProperty {
  name: string
  value: string
  type: 'text' | 'number' | 'color' | 'select' | 'boolean' | 'spacing' | 'size'
  options?: string[]
  unit?: string
  min?: number
  max?: number
  step?: number
}

export interface CSSGroup {
  name: string
  properties: CSSProperty[]
  expanded?: boolean
}

export interface LivePreviewOptions {
  autoRefresh: boolean
  refreshDelay: number
  showErrors: boolean
  enableHotReload: boolean
}

export interface DevicePreset {
  name: string
  width: number
  height: number
  icon: string
  userAgent?: string
}

export interface VisualEditorAction {
  type: 'ADD_COMPONENT' | 'UPDATE_COMPONENT' | 'DELETE_COMPONENT' | 'SELECT_COMPONENT' | 'MOVE_COMPONENT' | 'RESIZE_COMPONENT' | 'UNDO' | 'REDO' | 'CLEAR_HISTORY'
  payload?: any
  timestamp: number
}

export interface ComponentLibraryItem {
  id: string
  name: string
  category: string
  icon: any // React component
  template: string
  description?: string
  tags?: string[]
  complexity?: 'basic' | 'intermediate' | 'advanced'
}

export interface VisualEditorConfig {
  componentLibrary: ComponentLibraryItem[]
  devicePresets: DevicePreset[]
  cssGroups: CSSGroup[]
  livePreview: LivePreviewOptions
  maxHistorySize: number
  autoSave: boolean
  autoSaveInterval: number
}

export interface DragDropContext {
  isDragging: boolean
  draggedComponent: string | null
  dropZone: string | null
  dragOffset: { x: number; y: number }
}

export interface SelectionContext {
  selectedComponents: string[]
  multiSelect: boolean
  selectionBounds?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'angular' | 'html'
  typescript: boolean
  cssFramework: 'tailwind' | 'css' | 'styled-components' | 'emotion'
  formatting: {
    indentSize: number
    useTabs: boolean
    semicolons: boolean
    quotes: 'single' | 'double'
  }
}

export interface PreviewError {
  message: string
  line?: number
  column?: number
  type: 'syntax' | 'runtime' | 'build'
  stack?: string
}

export interface ComponentMetadata {
  id: string
  name: string
  description?: string
  version: string
  author?: string
  tags: string[]
  dependencies?: string[]
  examples?: {
    name: string
    code: string
    description?: string
  }[]
}

export interface VisualEditorTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    border: string
    accent: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

export interface ComponentValidation {
  isValid: boolean
  errors: {
    field: string
    message: string
    severity: 'error' | 'warning' | 'info'
  }[]
  warnings: {
    field: string
    message: string
  }[]
}

export interface VisualEditorPlugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  components?: ComponentLibraryItem[]
  hooks?: {
    beforeComponentAdd?: (component: VisualComponent) => VisualComponent
    afterComponentAdd?: (component: VisualComponent) => void
    beforeComponentUpdate?: (component: VisualComponent, updates: Partial<VisualComponent>) => Partial<VisualComponent>
    afterComponentUpdate?: (component: VisualComponent) => void
    beforeCodeGeneration?: (components: VisualComponent[]) => VisualComponent[]
    afterCodeGeneration?: (code: string) => string
  }
  settings?: {
    name: string
    type: 'text' | 'number' | 'boolean' | 'select'
    defaultValue: any
    options?: any[]
  }[]
}

export interface VisualEditorEvent {
  type: string
  data: any
  timestamp: number
  source: 'user' | 'system' | 'plugin'
}

export interface ComponentSnapshot {
  id: string
  timestamp: number
  components: VisualComponent[]
  metadata: {
    action: string
    user?: string
    description?: string
  }
}

export interface VisualEditorSession {
  id: string
  projectId: string
  userId: string
  startTime: number
  lastActivity: number
  snapshots: ComponentSnapshot[]
  isActive: boolean
}

export interface CollaborationCursor {
  userId: string
  userName: string
  color: string
  position: { x: number; y: number }
  componentId?: string
  lastUpdate: number
}

export interface CollaborationEvent {
  type: 'cursor_move' | 'component_select' | 'component_edit' | 'user_join' | 'user_leave'
  userId: string
  data: any
  timestamp: number
}

export interface VisualEditorPermissions {
  canEdit: boolean
  canDelete: boolean
  canAddComponents: boolean
  canExportCode: boolean
  canManageCollaboration: boolean
  canAccessAdvancedFeatures: boolean
}

export interface ResponsiveBreakpoint {
  name: string
  minWidth: number
  maxWidth?: number
  icon: string
}

export interface ResponsiveStyles {
  [breakpoint: string]: Record<string, any>
}

export interface AnimationKeyframe {
  offset: number
  styles: Record<string, any>
}

export interface ComponentAnimation {
  id: string
  name: string
  duration: number
  easing: string
  delay?: number
  iterations?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  keyframes: AnimationKeyframe[]
}

export interface InteractionTrigger {
  type: 'click' | 'hover' | 'focus' | 'scroll' | 'load' | 'custom'
  target?: string
  condition?: string
}

export interface ComponentInteraction {
  id: string
  name: string
  trigger: InteractionTrigger
  actions: {
    type: 'animate' | 'navigate' | 'toggle' | 'custom'
    target?: string
    parameters: Record<string, any>
  }[]
}

export interface VisualEditorAnalytics {
  sessionId: string
  events: {
    type: string
    timestamp: number
    data: any
  }[]
  performance: {
    renderTime: number
    codeGenerationTime: number
    previewLoadTime: number
  }
  usage: {
    componentsAdded: number
    componentsDeleted: number
    codeExports: number
    previewRefreshes: number
  }
}