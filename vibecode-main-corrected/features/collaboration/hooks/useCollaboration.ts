'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CollaborationManager,
  CollaborationUser,
  CollaborationState,
  UserAwareness,
  assignUserColor,
  generateUserId,
  updateUserAwareness,
  cleanupInactiveUsers,
  hasPermission,
  canEditComponent
} from '../utils/collaboration.utils'
import type {
  CollaborationCursor,
  CollaborationEvent,
  VisualEditorPermissions
} from '@/features/visual-editor/types/visual-editor.types'

export interface UseCollaborationOptions {
  sessionId: string
  projectId: string
  wsUrl?: string
  userInfo: {
    name: string
    email: string
    avatar?: string
  }
  permissions?: Partial<VisualEditorPermissions>
  autoConnect?: boolean
}

export interface UseCollaborationReturn {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  
  // Users and awareness
  users: CollaborationUser[]
  currentUser: CollaborationUser | null
  awareness: Record<string, UserAwareness>
  
  // Cursors and selections
  cursors: Record<string, CollaborationCursor>
  selections: Record<string, string[]>
  
  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  sendCursorMove: (x: number, y: number) => void
  sendSelectionChange: (componentIds: string[]) => void
  sendComponentUpdate: (event: CollaborationEvent) => void
  updateAwareness: (update: Partial<UserAwareness>) => void
  
  // Permissions
  canEdit: boolean
  canDelete: boolean
  canExportCode: boolean
  hasPermission: (action: keyof VisualEditorPermissions) => boolean
  canEditComponent: (componentId: string) => boolean
  
  // Utility
  getUserById: (userId: string) => CollaborationUser | undefined
  getUserColor: (userId: string) => string
}

const DEFAULT_PERMISSIONS: VisualEditorPermissions = {
  canEdit: true,
  canDelete: true,
  canAddComponents: true,
  canExportCode: true,
  canManageCollaboration: false,
  canAccessAdvancedFeatures: true
}

export const useCollaboration = (options: UseCollaborationOptions): UseCollaborationReturn => {
  const {
    sessionId,
    projectId,
    wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
    userInfo,
    permissions = {},
    autoConnect = true
  } = options

  // State
  const [state, setState] = useState<CollaborationState>({
    users: [],
    cursors: {},
    selections: {},
    isConnected: false,
    sessionId: null,
    currentUserId: null
  })
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [awareness, setAwareness] = useState<Record<string, UserAwareness>>({})
  const [lockedComponents, setLockedComponents] = useState<Record<string, string>>({})
  
  // Refs
  const collaborationManager = useRef<CollaborationManager | null>(null)
  const currentUserId = useRef<string>(generateUserId())
  const cleanupInterval = useRef<NodeJS.Timeout | null>(null)
  
  // Current user
  const currentUser: CollaborationUser = {
    id: currentUserId.current,
    name: userInfo.name,
    email: userInfo.email,
    avatar: userInfo.avatar,
    color: assignUserColor(currentUserId.current),
    isOnline: state.isConnected,
    lastSeen: new Date(),
    permissions: { ...DEFAULT_PERMISSIONS, ...permissions }
  }

  // Initialize collaboration manager
  const initializeManager = useCallback(() => {
    if (!collaborationManager.current) {
      collaborationManager.current = new CollaborationManager(
        sessionId,
        currentUserId.current,
        userInfo
      )
      
      // Set up event listeners
      collaborationManager.current.onUserJoin((user) => {
        setState(prev => ({
          ...prev,
          users: [...prev.users.filter(u => u.id !== user.id), user]
        }))
      })
      
      collaborationManager.current.onUserLeave((userId) => {
        setState(prev => ({
          ...prev,
          users: prev.users.filter(u => u.id !== userId)
        }))
        
        // Clean up user awareness
        setAwareness(prev => {
          const { [userId]: removed, ...rest } = prev
          return rest
        })
      })
      
      collaborationManager.current.onCursorMove((cursor) => {
        setState(prev => ({
          ...prev,
          cursors: {
            ...prev.cursors,
            [cursor.userId]: cursor
          }
        }))
        
        // Update awareness
        setAwareness(prev => updateUserAwareness(prev, cursor.userId, {
          cursor: cursor.position
        }))
      })
      
      collaborationManager.current.onSelectionChange((userId, componentIds) => {
        setState(prev => ({
          ...prev,
          selections: {
            ...prev.selections,
            [userId]: componentIds
          }
        }))
        
        // Update awareness
        setAwareness(prev => updateUserAwareness(prev, userId, {
          selection: componentIds
        }))
      })
      
      collaborationManager.current.onComponentUpdate((event) => {
        // Handle component updates from other users
        console.log('Component update received:', event)
        
        // You can emit this event to be handled by the visual editor
        window.dispatchEvent(new CustomEvent('collaboration:component-update', {
          detail: event
        }))
      })
      
      collaborationManager.current.onConnectionChange((isConnected) => {
        setState(prev => ({
          ...prev,
          isConnected,
          sessionId: isConnected ? sessionId : null,
          currentUserId: isConnected ? currentUserId.current : null
        }))
        
        setIsConnecting(false)
        
        if (isConnected) {
          setConnectionError(null)
        }
      })
      
      collaborationManager.current.onError((error) => {
        setConnectionError(error.message)
        setIsConnecting(false)
      })
    }
  }, [sessionId, userInfo])

  // Connect to collaboration server
  const connect = useCallback(async () => {
    if (state.isConnected || isConnecting) return
    
    setIsConnecting(true)
    setConnectionError(null)
    
    try {
      initializeManager()
      await collaborationManager.current!.connect(wsUrl)
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed')
      setIsConnecting(false)
    }
  }, [state.isConnected, isConnecting, wsUrl, initializeManager])

  // Disconnect from collaboration server
  const disconnect = useCallback(() => {
    if (collaborationManager.current) {
      collaborationManager.current.disconnect()
      collaborationManager.current = null
    }
    
    setState({
      users: [],
      cursors: {},
      selections: {},
      isConnected: false,
      sessionId: null,
      currentUserId: null
    })
    
    setAwareness({})
    setIsConnecting(false)
    setConnectionError(null)
  }, [])

  // Send cursor movement
  const sendCursorMove = useCallback((x: number, y: number) => {
    if (collaborationManager.current && state.isConnected) {
      collaborationManager.current.sendCursorMove(x, y)
    }
  }, [state.isConnected])

  // Send selection change
  const sendSelectionChange = useCallback((componentIds: string[]) => {
    if (collaborationManager.current && state.isConnected) {
      collaborationManager.current.sendSelectionChange(componentIds)
    }
  }, [state.isConnected])

  // Send component update
  const sendComponentUpdate = useCallback((event: CollaborationEvent) => {
    if (collaborationManager.current && state.isConnected) {
      collaborationManager.current.sendComponentUpdate(event)
    }
  }, [state.isConnected])

  // Update user awareness
  const updateAwareness = useCallback((update: Partial<UserAwareness>) => {
    setAwareness(prev => updateUserAwareness(prev, currentUserId.current, update))
  }, [])

  // Permission checks
  const checkPermission = useCallback((action: keyof VisualEditorPermissions): boolean => {
    return hasPermission(currentUser, action)
  }, [currentUser])

  const checkCanEditComponent = useCallback((componentId: string): boolean => {
    return canEditComponent(currentUser, componentId, lockedComponents)
  }, [currentUser, lockedComponents])

  // Utility functions
  const getUserById = useCallback((userId: string): CollaborationUser | undefined => {
    return state.users.find(user => user.id === userId)
  }, [state.users])

  const getUserColor = useCallback((userId: string): string => {
    const user = getUserById(userId)
    return user?.color || assignUserColor(userId)
  }, [getUserById])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  // Cleanup inactive users periodically
  useEffect(() => {
    cleanupInterval.current = setInterval(() => {
      setAwareness(prev => cleanupInactiveUsers(prev))
    }, 10000) // Clean up every 10 seconds
    
    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current)
      }
    }
  }, [])

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, update awareness
        updateAwareness({ isTyping: false })
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [updateAwareness])

  return {
    // Connection state
    isConnected: state.isConnected,
    isConnecting,
    connectionError,
    
    // Users and awareness
    users: state.users,
    currentUser,
    awareness,
    
    // Cursors and selections
    cursors: state.cursors,
    selections: state.selections,
    
    // Actions
    connect,
    disconnect,
    sendCursorMove,
    sendSelectionChange,
    sendComponentUpdate,
    updateAwareness,
    
    // Permissions
    canEdit: checkPermission('canEdit'),
    canDelete: checkPermission('canDelete'),
    canExportCode: checkPermission('canExportCode'),
    hasPermission: checkPermission,
    canEditComponent: checkCanEditComponent,
    
    // Utility
    getUserById,
    getUserColor
  }
}

// Hook for listening to collaboration events
export const useCollaborationEvents = () => {
  const [events, setEvents] = useState<CollaborationEvent[]>([])
  
  useEffect(() => {
    const handleComponentUpdate = (event: CustomEvent<CollaborationEvent>) => {
      setEvents(prev => [...prev, event.detail])
    }
    
    window.addEventListener('collaboration:component-update', handleComponentUpdate as EventListener)
    
    return () => {
      window.removeEventListener('collaboration:component-update', handleComponentUpdate as EventListener)
    }
  }, [])
  
  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])
  
  return {
    events,
    clearEvents
  }
}

// Hook for managing component locks
export const useComponentLocks = (collaboration: UseCollaborationReturn) => {
  const [locks, setLocks] = useState<Record<string, string>>({})
  
  const lockComponent = useCallback((componentId: string) => {
    if (!collaboration.canEditComponent(componentId)) {
      return false
    }
    
    setLocks(prev => ({
      ...prev,
      [componentId]: collaboration.currentUser!.id
    }))
    
    // Send lock event to other users
    collaboration.sendComponentUpdate({
      type: 'component_edit',
      userId: collaboration.currentUser!.id,
      timestamp: Date.now(),
      data: { componentId, locked: true }
    })
    
    return true
  }, [collaboration])
  
  const unlockComponent = useCallback((componentId: string) => {
    setLocks(prev => {
      const { [componentId]: removed, ...rest } = prev
      return rest
    })
    
    // Send unlock event to other users
    collaboration.sendComponentUpdate({
      type: 'component_edit',
      userId: collaboration.currentUser!.id,
      timestamp: Date.now(),
      data: { componentId, locked: false }
    })
  }, [collaboration])
  
  const isLocked = useCallback((componentId: string): boolean => {
    const lockedBy = locks[componentId]
    return lockedBy !== undefined && lockedBy !== collaboration.currentUser?.id
  }, [locks, collaboration.currentUser])
  
  const getLocker = useCallback((componentId: string): CollaborationUser | undefined => {
    const lockerId = locks[componentId]
    return lockerId ? collaboration.getUserById(lockerId) : undefined
  }, [locks, collaboration])
  
  return {
    locks,
    lockComponent,
    unlockComponent,
    isLocked,
    getLocker
  }
}