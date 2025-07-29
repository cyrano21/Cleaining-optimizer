import type {
  CollaborationCursor,
  CollaborationEvent,
  VisualEditorSession,
  VisualEditorPermissions
} from '@/features/visual-editor/types/visual-editor.types'

export interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
  isOnline: boolean
  lastSeen: Date
  permissions: VisualEditorPermissions
}

export interface CollaborationMessage {
  id: string
  type: 'component_update' | 'cursor_move' | 'selection_change' | 'user_join' | 'user_leave' | 'chat_message'
  userId: string
  sessionId: string
  timestamp: Date
  data: any
}

export interface CollaborationState {
  users: CollaborationUser[]
  cursors: Record<string, CollaborationCursor>
  selections: Record<string, string[]> // userId -> componentIds
  isConnected: boolean
  sessionId: string | null
  currentUserId: string | null
}

// WebSocket connection management
export class CollaborationManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageQueue: CollaborationMessage[] = []
  
  private listeners: {
    onUserJoin?: (user: CollaborationUser) => void
    onUserLeave?: (userId: string) => void
    onCursorMove?: (cursor: CollaborationCursor) => void
    onSelectionChange?: (userId: string, componentIds: string[]) => void
    onComponentUpdate?: (event: CollaborationEvent) => void
    onConnectionChange?: (isConnected: boolean) => void
    onError?: (error: Error) => void
  } = {}

  constructor(private sessionId: string, private userId: string, private userInfo: Partial<CollaborationUser>) {}

  connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${wsUrl}?sessionId=${this.sessionId}&userId=${this.userId}`)
        
        this.ws.onopen = () => {
          console.log('Collaboration WebSocket connected')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.sendQueuedMessages()
          this.listeners.onConnectionChange?.(true)
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const message: CollaborationMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse collaboration message:', error)
          }
        }
        
        this.ws.onclose = () => {
          console.log('Collaboration WebSocket disconnected')
          this.stopHeartbeat()
          this.listeners.onConnectionChange?.(false)
          this.attemptReconnect(wsUrl)
        }
        
        this.ws.onerror = (error) => {
          console.error('Collaboration WebSocket error:', error)
          this.listeners.onError?.(new Error('WebSocket connection failed'))
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private attemptReconnect(wsUrl: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
        this.connect(wsUrl).catch(() => {
          // Reconnection failed, will try again
        })
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
      this.listeners.onError?.(new Error('Failed to reconnect to collaboration server'))
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private sendMessage(message: Omit<CollaborationMessage, 'id' | 'timestamp' | 'userId' | 'sessionId'>): void {
    const fullMessage: CollaborationMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage))
    } else {
      // Queue message for later sending
      this.messageQueue.push(fullMessage)
    }
  }

  private sendQueuedMessages(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      if (message) {
        this.ws.send(JSON.stringify(message))
      }
    }
  }

  private handleMessage(message: CollaborationMessage): void {
    switch (message.type) {
      case 'user_join':
        this.listeners.onUserJoin?.(message.data as CollaborationUser)
        break
      
      case 'user_leave':
        this.listeners.onUserLeave?.(message.data.userId)
        break
      
      case 'cursor_move':
        this.listeners.onCursorMove?.(message.data as CollaborationCursor)
        break
      
      case 'selection_change':
        this.listeners.onSelectionChange?.(message.userId, message.data.componentIds)
        break
      
      case 'component_update':
        this.listeners.onComponentUpdate?.(message.data as CollaborationEvent)
        break
    }
  }

  // Public methods for sending collaboration events
  sendCursorMove(x: number, y: number): void {
    this.sendMessage({
      type: 'cursor_move',
      data: {
        userId: this.userId,
        position: { x, y },
        timestamp: new Date()
      }
    })
  }

  sendSelectionChange(componentIds: string[]): void {
    this.sendMessage({
      type: 'selection_change',
      data: { componentIds }
    })
  }

  sendComponentUpdate(event: CollaborationEvent): void {
    this.sendMessage({
      type: 'component_update',
      data: event
    })
  }

  // Event listeners
  onUserJoin(callback: (user: CollaborationUser) => void): void {
    this.listeners.onUserJoin = callback
  }

  onUserLeave(callback: (userId: string) => void): void {
    this.listeners.onUserLeave = callback
  }

  onCursorMove(callback: (cursor: CollaborationCursor) => void): void {
    this.listeners.onCursorMove = callback
  }

  onSelectionChange(callback: (userId: string, componentIds: string[]) => void): void {
    this.listeners.onSelectionChange = callback
  }

  onComponentUpdate(callback: (event: CollaborationEvent) => void): void {
    this.listeners.onComponentUpdate = callback
  }

  onConnectionChange(callback: (isConnected: boolean) => void): void {
    this.listeners.onConnectionChange = callback
  }

  onError(callback: (error: Error) => void): void {
    this.listeners.onError = callback
  }
}

// Utility functions
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// User color assignment
const USER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b'  // amber
]

export const assignUserColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return USER_COLORS[hash % USER_COLORS.length]
}

// Conflict resolution utilities
export interface ConflictResolution {
  strategy: 'last_write_wins' | 'merge' | 'manual'
  winner?: string
  mergedData?: any
}

export const resolveConflict = (
  localChange: CollaborationEvent,
  remoteChange: CollaborationEvent,
  strategy: 'last_write_wins' | 'merge' | 'manual' = 'last_write_wins'
): ConflictResolution => {
  switch (strategy) {
    case 'last_write_wins':
      return {
        strategy,
        winner: localChange.timestamp > remoteChange.timestamp ? 'local' : 'remote'
      }
    
    case 'merge':
      // Simple merge strategy - combine non-conflicting properties
      const mergedData = { ...localChange.data, ...remoteChange.data }
      return {
        strategy,
        mergedData
      }
    
    case 'manual':
      return {
        strategy
        // Manual resolution requires user intervention
      }
    
    default:
      return resolveConflict(localChange, remoteChange, 'last_write_wins')
  }
}

// Operational Transform utilities for text editing
export interface TextOperation {
  type: 'insert' | 'delete' | 'retain'
  position: number
  content?: string
  length?: number
}

export const transformTextOperations = (
  op1: TextOperation,
  op2: TextOperation
): [TextOperation, TextOperation] => {
  // Simplified operational transform for text operations
  // In a real implementation, you'd want a more robust OT library
  
  if (op1.type === 'insert' && op2.type === 'insert') {
    if (op1.position <= op2.position) {
      return [
        op1,
        { ...op2, position: op2.position + (op1.content?.length || 0) }
      ]
    } else {
      return [
        { ...op1, position: op1.position + (op2.content?.length || 0) },
        op2
      ]
    }
  }
  
  if (op1.type === 'delete' && op2.type === 'delete') {
    if (op1.position <= op2.position) {
      return [
        op1,
        { ...op2, position: Math.max(op1.position, op2.position - (op1.length || 0)) }
      ]
    } else {
      return [
        { ...op1, position: Math.max(op2.position, op1.position - (op2.length || 0)) },
        op2
      ]
    }
  }
  
  // For mixed operations, apply similar logic
  return [op1, op2]
}

// Permission utilities
export const hasPermission = (
  user: CollaborationUser,
  action: keyof VisualEditorPermissions
): boolean => {
  return user.permissions[action] === true
}

export const canEditComponent = (
  user: CollaborationUser,
  componentId: string,
  lockedComponents: Record<string, string> = {}
): boolean => {
  // Check if user has edit permission
  if (!hasPermission(user, 'canEdit')) {
    return false
  }
  
  // Check if component is locked by another user
  const lockedBy = lockedComponents[componentId]
  if (lockedBy && lockedBy !== user.id) {
    return false
  }
  
  return true
}

// Session management
export const createCollaborationSession = (
  projectId: string,
  ownerId: string,
  settings: Partial<VisualEditorSession> = {}
): VisualEditorSession => {
  return {
    id: generateSessionId(),
    projectId,
    userId: ownerId,
    startTime: Date.now(),
    lastActivity: Date.now(),
    snapshots: [],
    isActive: true,
    ...settings
  }
}

export const addParticipantToSession = (
  session: VisualEditorSession,
  user: CollaborationUser
): VisualEditorSession => {
  if (session.participants.length >= (session.settings?.maxParticipants || 10)) {
    throw new Error('Session is full')
  }
  
  if (session.participants.some(p => p.id === user.id)) {
    throw new Error('User is already in session')
  }
  
  return {
    ...session,
    participants: [...session.participants, user],
    updatedAt: new Date()
  }
}

export const removeParticipantFromSession = (
  session: VisualEditorSession,
  userId: string
): VisualEditorSession => {
  return {
    ...session,
    participants: session.participants.filter(p => p.id !== userId),
    updatedAt: new Date()
  }
}

// Awareness utilities (showing what other users are doing)
export interface UserAwareness {
  userId: string
  cursor?: { x: number; y: number }
  selection?: string[]
  currentTool?: string
  isTyping?: boolean
  lastActivity: Date
}

export const updateUserAwareness = (
  awareness: Record<string, UserAwareness>,
  userId: string,
  update: Partial<UserAwareness>
): Record<string, UserAwareness> => {
  return {
    ...awareness,
    [userId]: {
      ...awareness[userId],
      ...update,
      userId,
      lastActivity: new Date()
    }
  }
}

export const cleanupInactiveUsers = (
  awareness: Record<string, UserAwareness>,
  timeoutMs = 30000 // 30 seconds
): Record<string, UserAwareness> => {
  const now = new Date()
  const cleaned: Record<string, UserAwareness> = {}
  
  Object.entries(awareness).forEach(([userId, userAwareness]) => {
    if (now.getTime() - userAwareness.lastActivity.getTime() < timeoutMs) {
      cleaned[userId] = userAwareness
    }
  })
  
  return cleaned
}