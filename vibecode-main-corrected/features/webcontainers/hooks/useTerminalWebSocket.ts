"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'

interface TerminalWebSocketOptions {
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  onMessage?: (data: string) => void
}

interface TerminalSession {
  id: string
  name: string
  terminal: Terminal
  isActive: boolean
  lastActivity: Date
}

interface WSMessage {
  type: 'command' | 'output' | 'error' | 'session' | 'ping' | 'pong'
  sessionId?: string
  data?: string
  command?: string
  error?: string
  session?: {
    id: string
    name: string
  }
}

export function useTerminalWebSocket(options: TerminalWebSocketOptions = {}) {
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError,
    onMessage
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [sessions, setSessions] = useState<TerminalSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messageQueueRef = useRef<WSMessage[]>([])

  // Créer une nouvelle session terminal
  const createSession = useCallback((name: string = `Session ${sessions.length + 1}`) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selectionBackground: '#3e4451',
        black: '#000000',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#d19a66',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#ffffff',
        brightBlack: '#5c6370',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#d19a66',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff'
      },
      allowTransparency: true,
      convertEol: true,
      scrollback: 1000
    })

    const newSession: TerminalSession = {
      id: sessionId,
      name,
      terminal,
      isActive: false,
      lastActivity: new Date()
    }

    setSessions(prev => [...prev, newSession])
    
    // Activer automatiquement si c'est la première session
    if (sessions.length === 0) {
      setActiveSessionId(sessionId)
      newSession.isActive = true
    }

    // Envoyer la création de session au serveur
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'session',
        sessionId,
        session: { id: sessionId, name }
      }))
    }

    return sessionId
  }, [sessions.length])

  // Supprimer une session
  const removeSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId)
      
      // Si on supprime la session active, activer la première disponible
      if (activeSessionId === sessionId && updated.length > 0) {
        setActiveSessionId(updated[0].id)
        updated[0].isActive = true
      } else if (updated.length === 0) {
        setActiveSessionId(null)
      }
      
      return updated
    })
  }, [activeSessionId])

  // Changer de session active
  const switchSession = useCallback((sessionId: string) => {
    setSessions(prev => 
      prev.map(session => ({
        ...session,
        isActive: session.id === sessionId
      }))
    )
    setActiveSessionId(sessionId)
  }, [])

  // Obtenir la session active
  const getActiveSession = useCallback(() => {
    return sessions.find(s => s.id === activeSessionId)
  }, [sessions, activeSessionId])

  // Envoyer une commande
  const sendCommand = useCallback((command: string, sessionId?: string) => {
    const targetSessionId = sessionId || activeSessionId
    
    if (!targetSessionId) {
      console.warn('Aucune session active pour envoyer la commande')
      return
    }

    const message: WSMessage = {
      type: 'command',
      sessionId: targetSessionId,
      command
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      
      // Mettre à jour l'activité de la session
      setSessions(prev => 
        prev.map(session => 
          session.id === targetSessionId 
            ? { ...session, lastActivity: new Date() }
            : session
        )
      )
    } else {
      // Ajouter à la queue si pas connecté
      messageQueueRef.current.push(message)
    }
  }, [activeSessionId])

  // Envoyer les messages en queue
  const flushMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      messageQueueRef.current.forEach(message => {
        wsRef.current?.send(JSON.stringify(message))
      })
      messageQueueRef.current = []
    }
  }, [])

  // Connexion WebSocket
  const connect = useCallback(() => {
    if (isConnecting || isConnected) return

    setIsConnecting(true)
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/terminal/ws`
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('🔌 Terminal WebSocket connecté')
        setIsConnected(true)
        setIsConnecting(false)
        setReconnectAttempts(0)
        onConnect?.()
        
        // Envoyer les messages en queue
        flushMessageQueue()
        
        // Démarrer le ping
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000) // Ping toutes les 30 secondes
      }

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          
          switch (message.type) {
            case 'output':
              if (message.sessionId && message.data) {
                const session = sessions.find(s => s.id === message.sessionId)
                if (session) {
                  session.terminal.write(message.data)
                  onMessage?.(message.data)
                }
              }
              break
              
            case 'error':
              if (message.sessionId && message.error) {
                const session = sessions.find(s => s.id === message.sessionId)
                if (session) {
                  session.terminal.write(`\r\n\x1b[31mErreur: ${message.error}\x1b[0m\r\n`)
                }
              }
              break
              
            case 'pong':
              // Réponse au ping, connexion OK
              break
              
            default:
              console.log('Message WebSocket non géré:', message)
          }
        } catch (error) {
          console.error('Erreur parsing message WebSocket:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 Terminal WebSocket fermé:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
        onDisconnect?.()
        
        // Nettoyer les intervalles
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = null
        }
        
        // Tentative de reconnexion
        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ Erreur Terminal WebSocket:', error)
        setIsConnecting(false)
        onError?.(error)
      }

    } catch (error) {
      console.error('❌ Erreur création WebSocket:', error)
      setIsConnecting(false)
    }
  }, [isConnecting, isConnected, autoReconnect, reconnectAttempts, maxReconnectAttempts, reconnectInterval, onConnect, onDisconnect, onError, onMessage, flushMessageQueue, sessions])

  // Déconnexion
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
    setIsConnecting(false)
    setReconnectAttempts(0)
  }, [])

  // Reconnexion manuelle
  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      setReconnectAttempts(0)
      connect()
    }, 1000)
  }, [disconnect, connect])

  // Nettoyage
  useEffect(() => {
    return () => {
      disconnect()
      // Nettoyer les terminaux
      sessions.forEach(session => {
        session.terminal.dispose()
      })
    }
  }, [])

  // Connexion automatique
  useEffect(() => {
    connect()
  }, [])

  return {
    // État de connexion
    isConnected,
    isConnecting,
    reconnectAttempts,
    
    // Gestion des sessions
    sessions,
    activeSessionId,
    createSession,
    removeSession,
    switchSession,
    getActiveSession,
    
    // Communication
    sendCommand,
    
    // Contrôle de connexion
    connect,
    disconnect,
    reconnect
  }
}