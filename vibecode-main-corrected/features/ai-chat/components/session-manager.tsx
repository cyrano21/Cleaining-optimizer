"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Hash,
  Folder,
  Bot
} from 'lucide-react'
import { useChatSessions, ChatSession, CreateSessionData, UpdateSessionData } from '../hooks/useChatSessions'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SessionManagerProps {
  playgroundId?: string
  onSessionSelect?: (session: ChatSession) => void
  className?: string
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  playgroundId,
  onSessionSelect,
  className
}) => {
  const {
    sessions,
    currentSession,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    deleteAllSessions,
    setCurrentSession
  } = useChatSessions(playgroundId)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<ChatSession | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  const [newSessionData, setNewSessionData] = useState<CreateSessionData>({
    title: '',
    description: '',
    aiProvider: 'ollama',
    aiModel: 'llama3.2:latest'
  })

  const [editSessionData, setEditSessionData] = useState<UpdateSessionData>({})

  const handleCreateSession = async () => {
    const session = await createSession(newSessionData)
    if (session) {
      setIsCreateDialogOpen(false)
      setNewSessionData({
        title: '',
        description: '',
        aiProvider: 'ollama',
        aiModel: 'llama3.2:latest'
      })
      onSessionSelect?.(session)
    }
  }

  const handleEditSession = async () => {
    if (!editingSession) return
    
    const session = await updateSession(editingSession.id, editSessionData)
    if (session) {
      setIsEditDialogOpen(false)
      setEditingSession(null)
      setEditSessionData({})
    }
  }

  const handleDeleteSession = async () => {
    if (!deletingSessionId) return
    
    const success = await deleteSession(deletingSessionId)
    if (success) {
      setIsDeleteDialogOpen(false)
      setDeletingSessionId(null)
    }
  }

  const handleDeleteAllSessions = async () => {
    const success = await deleteAllSessions()
    if (success) {
      setIsDeleteAllDialogOpen(false)
    }
  }

  const handleSessionClick = (session: ChatSession) => {
    setCurrentSession(session)
    onSessionSelect?.(session)
  }

  const openEditDialog = (session: ChatSession) => {
    setEditingSession(session)
    setEditSessionData({
      title: session.title,
      description: session.description || '',
      aiProvider: session.aiProvider,
      aiModel: session.aiModel
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (sessionId: string) => {
    setDeletingSessionId(sessionId)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header avec boutons d'action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-400" />
          <h3 className="text-lg font-semibold text-zinc-100">
            Sessions de Chat
          </h3>
          {sessions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {sessions.length}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle session</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle session de chat avec l&#39;IA
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-300">Titre</label>
                  <Input
                    value={newSessionData.title}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nom de la session..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-zinc-300">Description</label>
                  <Textarea
                    value={newSessionData.description}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description optionnelle..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-300">Fournisseur IA</label>
                    <select
                      value={newSessionData.aiProvider}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, aiProvider: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100"
                      aria-label="Sélectionner le fournisseur IA"
                    >
                      <option value="ollama">Ollama</option>
                      <option value="gemini">Gemini</option>
                      <option value="huggingface">HuggingFace</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-zinc-300">Modèle</label>
                    <Input
                      value={newSessionData.aiModel}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, aiModel: e.target.value }))}
                      placeholder="llama3.2:latest"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateSession} disabled={loading}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {sessions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDeleteAllDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer toutes les sessions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Liste des sessions */}
      <ScrollArea className="h-[400px]">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-zinc-400">Chargement...</div>
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-lg">
            Erreur: {error}
          </div>
        )}
        
        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-8 text-zinc-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune session de chat</p>
            <p className="text-sm">Créez votre première session pour commencer</p>
          </div>
        )}
        
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                currentSession?.id === session.id
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50'
              }`}
              onClick={() => handleSessionClick(session)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-zinc-100 truncate">
                      {session.title}
                    </h4>
                    {session.isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  {session.description && (
                    <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                      {session.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {session._count.messages} messages
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      {session.aiProvider}
                    </div>
                    
                    {session.playground && (
                      <div className="flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {session.playground.title}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(session.updatedAt), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(session)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(session.id)}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la session</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres de la session
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300">Titre</label>
              <Input
                value={editSessionData.title || ''}
                onChange={(e) => setEditSessionData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-zinc-300">Description</label>
              <Textarea
                value={editSessionData.description || ''}
                onChange={(e) => setEditSessionData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300">Fournisseur IA</label>
                <select
                  value={editSessionData.aiProvider || 'ollama'}
                  onChange={(e) => setEditSessionData(prev => ({ ...prev, aiProvider: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100"
                  aria-label="Sélectionner le fournisseur IA"
                >
                  <option value="ollama">Ollama</option>
                  <option value="gemini">Gemini</option>
                  <option value="huggingface">HuggingFace</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-zinc-300">Modèle</label>
                <Input
                  value={editSessionData.aiModel || ''}
                  onChange={(e) => setEditSessionData(prev => ({ ...prev, aiModel: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditSession} disabled={loading}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la session</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible et supprimera tous les messages associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de suppression de toutes les sessions */}
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer toutes les sessions</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer toutes les sessions ? Cette action est irréversible et supprimera tous les messages de toutes les sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllSessions} className="bg-red-600 hover:bg-red-700">
              Supprimer tout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}