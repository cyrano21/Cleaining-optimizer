import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface ChatSession {
  id: string
  userId: string
  playgroundId?: string
  title: string
  description?: string
  aiProvider: string
  aiModel: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  playground?: {
    id: string
    title: string
  }
  messages?: ChatMessage[]
  _count: {
    messages: number
  }
}

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  attachments?: any
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface CreateSessionData {
  title?: string
  description?: string
  playgroundId?: string
  aiProvider?: string
  aiModel?: string
}

export interface UpdateSessionData {
  title?: string
  description?: string
  aiProvider?: string
  aiModel?: string
  isActive?: boolean
}

export const useChatSessions = (playgroundId?: string) => {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer toutes les sessions
  const fetchSessions = useCallback(async (options?: {
    playgroundId?: string
    limit?: number
    offset?: number
  }) => {
    if (!session?.user) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options?.playgroundId) params.append('playgroundId', options.playgroundId)
      if (options?.limit) params.append('limit', options.limit.toString())
      if (options?.offset) params.append('offset', options.offset.toString())

      const response = await fetch(`/api/chat/sessions?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data.sessions)

      // Définir la session active comme session courante
      const activeSession = data.sessions.find((s: ChatSession) => s.isActive)
      if (activeSession && !currentSession) {
        setCurrentSession(activeSession)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [session?.user, currentSession])

  // Récupérer une session spécifique avec ses messages
  const fetchSession = useCallback(async (sessionId: string, includeMessages = true) => {
    if (!session?.user) return null

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (!includeMessages) params.append('includeMessages', 'false')

      const response = await fetch(`/api/chat/sessions/${sessionId}?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }

      const data = await response.json()
      return data.session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Créer une nouvelle session
  const createSession = useCallback(async (data: CreateSessionData) => {
    if (!session?.user) return null

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          playgroundId: data.playgroundId || playgroundId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const result = await response.json()
      const newSession = result.session

      setSessions(prev => [newSession, ...prev])
      setCurrentSession(newSession)

      return newSession
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [session?.user, playgroundId])

  // Mettre à jour une session
  const updateSession = useCallback(async (sessionId: string, data: UpdateSessionData) => {
    if (!session?.user) return null

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update session')
      }

      const result = await response.json()
      const updatedSession = result.session

      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s))
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession)
      }

      return updatedSession
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [session?.user, currentSession])

  // Supprimer une session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!session?.user) return false

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId))
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }, [session?.user, currentSession])

  // Supprimer toutes les sessions
  const deleteAllSessions = useCallback(async () => {
    if (!session?.user) return false

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat/sessions?confirm=true', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete all sessions')
      }

      setSessions([])
      setCurrentSession(null)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Charger les sessions au montage du composant
  useEffect(() => {
    if (session?.user) {
      fetchSessions({ playgroundId })
    }
  }, [session?.user, playgroundId, fetchSessions])

  return {
    sessions,
    currentSession,
    loading,
    error,
    fetchSessions,
    fetchSession,
    createSession,
    updateSession,
    deleteSession,
    deleteAllSessions,
    setCurrentSession
  }
}