"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { SearchAddon } from 'xterm-addon-search'
import { useTerminalWebSocket } from '../hooks/useTerminalWebSocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Plus,
  X,
  Terminal as TerminalIcon,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Search,
  Copy,
  Download,
  Upload,
  Play,
  Square,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedTerminalProps {
  className?: string
  onReady?: () => void
  initialCommands?: string[]
  theme?: 'dark' | 'light'
  showHeader?: boolean
  showTabs?: boolean
  maxSessions?: number
}

interface QuickCommand {
  name: string
  command: string
  description: string
  icon?: React.ReactNode
}

const QUICK_COMMANDS: QuickCommand[] = [
  {
    name: 'Clear',
    command: 'clear',
    description: 'Effacer le terminal',
    icon: <X className="w-4 h-4" />
  },
  {
    name: 'List Files',
    command: 'ls -la',
    description: 'Lister les fichiers',
    icon: <TerminalIcon className="w-4 h-4" />
  },
  {
    name: 'NPM Install',
    command: 'npm install',
    description: 'Installer les dépendances',
    icon: <Download className="w-4 h-4" />
  },
  {
    name: 'NPM Start',
    command: 'npm start',
    description: 'Démarrer l\'application',
    icon: <Play className="w-4 h-4" />
  },
  {
    name: 'Git Status',
    command: 'git status',
    description: 'Statut Git',
    icon: <Upload className="w-4 h-4" />
  }
]

export function EnhancedTerminal({
  className,
  onReady,
  initialCommands = [],
  theme = 'dark',
  showHeader = true,
  showTabs = true,
  maxSessions = 5
}: EnhancedTerminalProps) {
  const [command, setCommand] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newSessionName, setNewSessionName] = useState('')
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false)
  
  const terminalRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const fitAddons = useRef<Map<string, FitAddon>>(new Map())
  const searchAddons = useRef<Map<string, SearchAddon>>(new Map())
  
  const {
    isConnected,
    isConnecting,
    reconnectAttempts,
    sessions,
    activeSessionId,
    createSession,
    removeSession,
    switchSession,
    getActiveSession,
    sendCommand,
    reconnect
  } = useTerminalWebSocket({
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    onConnect: () => {
      console.log('🔌 Terminal connecté')
      onReady?.()
    },
    onDisconnect: () => {
      console.log('🔌 Terminal déconnecté')
    },
    onError: (error) => {
      console.error('❌ Erreur terminal:', error)
    }
  })

  // Initialiser les terminaux pour chaque session
  useEffect(() => {
    sessions.forEach(session => {
      const terminalElement = terminalRefs.current.get(session.id)
      if (terminalElement && !session.terminal.element) {
        // Addons
        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()
        const searchAddon = new SearchAddon()
        
        session.terminal.loadAddon(fitAddon)
        session.terminal.loadAddon(webLinksAddon)
        session.terminal.loadAddon(searchAddon)
        
        fitAddons.current.set(session.id, fitAddon)
        searchAddons.current.set(session.id, searchAddon)
        
        // Ouvrir le terminal
        session.terminal.open(terminalElement)
        fitAddon.fit()
        
        // Gestionnaire de saisie
        session.terminal.onData((data) => {
          sendCommand(data, session.id)
        })
        
        // Message de bienvenue
        session.terminal.writeln(`\x1b[32m🚀 Session ${session.name} initialisée\x1b[0m`)
        session.terminal.writeln(`\x1b[36mTapez 'help' pour voir les commandes disponibles\x1b[0m`)
        session.terminal.write('$ ')
      }
    })
  }, [sessions, sendCommand])

  // Redimensionner les terminaux
  useEffect(() => {
    const handleResize = () => {
      fitAddons.current.forEach(fitAddon => {
        try {
          fitAddon.fit()
        } catch (error) {
          console.warn('Erreur redimensionnement terminal:', error)
        }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Exécuter les commandes initiales
  useEffect(() => {
    if (isConnected && activeSessionId && initialCommands.length > 0) {
      initialCommands.forEach((cmd, index) => {
        setTimeout(() => {
          sendCommand(cmd + '\r', activeSessionId)
        }, index * 1000)
      })
    }
  }, [isConnected, activeSessionId, initialCommands, sendCommand])

  // Créer une nouvelle session
  const handleCreateSession = useCallback(() => {
    if (sessions.length >= maxSessions) {
      alert(`Maximum ${maxSessions} sessions autorisées`)
      return
    }
    
    const name = newSessionName.trim() || `Session ${sessions.length + 1}`
    createSession(name)
    setNewSessionName('')
    setIsNewSessionDialogOpen(false)
  }, [createSession, newSessionName, sessions.length, maxSessions])

  // Supprimer une session
  const handleRemoveSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      // Nettoyer les références
      terminalRefs.current.delete(sessionId)
      fitAddons.current.delete(sessionId)
      searchAddons.current.delete(sessionId)
      
      // Disposer le terminal
      session.terminal.dispose()
      
      // Supprimer la session
      removeSession(sessionId)
    }
  }, [sessions, removeSession])

  // Exécuter une commande rapide
  const handleQuickCommand = useCallback((cmd: string) => {
    if (activeSessionId) {
      sendCommand(cmd + '\r', activeSessionId)
    }
  }, [activeSessionId, sendCommand])

  // Rechercher dans le terminal actif
  const handleSearch = useCallback(() => {
    if (activeSessionId && searchTerm) {
      const searchAddon = searchAddons.current.get(activeSessionId)
      if (searchAddon) {
        searchAddon.findNext(searchTerm)
      }
    }
  }, [activeSessionId, searchTerm])

  // Copier le contenu du terminal
  const handleCopyTerminal = useCallback(() => {
    const activeSession = getActiveSession()
    if (activeSession) {
      const selection = activeSession.terminal.getSelection()
      if (selection) {
        navigator.clipboard.writeText(selection)
      }
    }
  }, [getActiveSession])

  // Effacer le terminal actif
  const handleClearTerminal = useCallback(() => {
    const activeSession = getActiveSession()
    if (activeSession) {
      activeSession.terminal.clear()
    }
  }, [getActiveSession])

  // Créer la première session si aucune n'existe
  useEffect(() => {
    if (sessions.length === 0) {
      createSession('Principal')
    }
  }, [sessions.length, createSession])

  const connectionStatus = isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected'
  const statusColor = {
    connected: 'text-green-500',
    connecting: 'text-yellow-500',
    disconnected: 'text-red-500'
  }[connectionStatus]

  const statusIcon = {
    connected: <Wifi className="w-4 h-4" />,
    connecting: <RefreshCw className="w-4 h-4 animate-spin" />,
    disconnected: <WifiOff className="w-4 h-4" />
  }[connectionStatus]

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TerminalIcon className="w-5 h-5" />
              Terminal Intégré
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Statut de connexion */}
              <div className={cn('flex items-center gap-1 text-sm', statusColor)}>
                {statusIcon}
                <span className="capitalize">
                  {connectionStatus === 'connected' && 'Connecté'}
                  {connectionStatus === 'connecting' && 'Connexion...'}
                  {connectionStatus === 'disconnected' && 'Déconnecté'}
                </span>
                {reconnectAttempts > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Tentative {reconnectAttempts}
                  </Badge>
                )}
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  title="Rechercher"
                >
                  <Search className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyTerminal}
                  title="Copier la sélection"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearTerminal}
                  title="Effacer"
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reconnect}
                  disabled={isConnected}
                  title="Reconnecter"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsNewSessionDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle session
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {QUICK_COMMANDS.map((cmd) => (
                      <DropdownMenuItem
                        key={cmd.name}
                        onClick={() => handleQuickCommand(cmd.command)}
                      >
                        {cmd.icon && <span className="mr-2">{cmd.icon}</span>}
                        {cmd.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {/* Barre de recherche */}
          {isSearchOpen && (
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Rechercher dans le terminal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm">
                Rechercher
              </Button>
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        {showTabs && sessions.length > 1 ? (
          <Tabs value={activeSessionId || ''} onValueChange={switchSession} className="h-full flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(sessions.length + 1, 6)}, 1fr)` }}>
                {sessions.map((session) => (
                  <TabsTrigger
                    key={session.id}
                    value={session.id}
                    className="relative group"
                  >
                    <span className="truncate max-w-20">{session.name}</span>
                    {sessions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveSession(session.id)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </TabsTrigger>
                ))}
                {sessions.length < maxSessions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNewSessionDialogOpen(true)}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </TabsList>
            </div>
            
            {sessions.map((session) => (
              <TabsContent key={session.id} value={session.id} className="flex-1 m-0 p-4">
                <div
                  ref={(el) => {
                    if (el) {
                      terminalRefs.current.set(session.id, el)
                    }
                  }}
                  className="w-full h-full bg-black rounded-md"
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="h-full p-4">
            {sessions.length > 0 && (
              <div
                ref={(el) => {
                  if (el && sessions[0]) {
                    terminalRefs.current.set(sessions[0].id, el)
                  }
                }}
                className="w-full h-full bg-black rounded-md"
              />
            )}
          </div>
        )}
      </CardContent>
      
      {/* Dialog pour nouvelle session */}
      <Dialog open={isNewSessionDialogOpen} onOpenChange={setIsNewSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle session terminal</DialogTitle>
            <DialogDescription>
              Créer une nouvelle session de terminal avec un nom personnalisé.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Nom de la session (optionnel)"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateSession()
                }
              }}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewSessionDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateSession}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}