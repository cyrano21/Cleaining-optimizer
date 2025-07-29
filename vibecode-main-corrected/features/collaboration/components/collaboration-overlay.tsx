'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Wifi,
  WifiOff,
  MousePointer2,
  Eye,
  Edit3,
  Lock,
  MessageCircle,
  Settings,
  UserPlus,
  Crown
} from 'lucide-react'
import type { UseCollaborationReturn } from '../hooks/useCollaboration'
import type { CollaborationCursor } from '@/features/visual-editor/types/visual-editor.types'

interface CollaborationOverlayProps {
  collaboration: UseCollaborationReturn
  canvasRef: React.RefObject<HTMLDivElement>
  showUserList?: boolean
  showCursors?: boolean
  showSelections?: boolean
  onInviteUser?: () => void
  onManagePermissions?: () => void
}

export const CollaborationOverlay: React.FC<CollaborationOverlayProps> = ({
  collaboration,
  canvasRef,
  showUserList = true,
  showCursors = true,
  showSelections = true,
  onInviteUser,
  onManagePermissions
}) => {
  const [showConnectionStatus, setShowConnectionStatus] = useState(false)
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null)

  // Update canvas rect for cursor positioning
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect())
      }
    }

    updateCanvasRect()
    window.addEventListener('resize', updateCanvasRect)
    window.addEventListener('scroll', updateCanvasRect)

    return () => {
      window.removeEventListener('resize', updateCanvasRect)
      window.removeEventListener('scroll', updateCanvasRect)
    }
  }, [canvasRef])

  // Show connection status temporarily
  useEffect(() => {
    if (collaboration.isConnected || collaboration.connectionError) {
      setShowConnectionStatus(true)
      const timer = setTimeout(() => setShowConnectionStatus(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [collaboration.isConnected, collaboration.connectionError])

  const renderCursor = (cursor: CollaborationCursor) => {
    if (!canvasRect || !showCursors) return null

    const user = collaboration.getUserById(cursor.userId)
    if (!user || cursor.userId === collaboration.currentUser?.id) return null

    const x = cursor.position.x + canvasRect.left
    const y = cursor.position.y + canvasRect.top

    return (
      <motion.div
        key={cursor.userId}
        className="fixed pointer-events-none z-50"
        style={{
          left: x,
          top: y,
          color: user.color
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          <MousePointer2 
            className="h-5 w-5 transform -rotate-12" 
            style={{ color: user.color }}
          />
          <div 
            className="absolute top-6 left-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSelection = (userId: string, componentIds: string[]) => {
    if (!showSelections || componentIds.length === 0) return null

    const user = collaboration.getUserById(userId)
    if (!user || userId === collaboration.currentUser?.id) return null

    return componentIds.map(componentId => (
      <div
        key={`${userId}-${componentId}`}
        className="absolute pointer-events-none border-2 border-dashed rounded"
        style={{
          borderColor: user.color,
          backgroundColor: `${user.color}20`
        }}
      >
        <div 
          className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
          style={{ backgroundColor: user.color }}
        >
          {user.name} is editing
        </div>
      </div>
    ))
  }

  const renderUserList = () => {
    if (!showUserList) return null

    return (
      <Card className="fixed top-4 right-4 w-80 max-h-96 overflow-hidden z-40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Collaborators ({collaboration.users.length + 1})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {collaboration.hasPermission('canManageCollaboration') && onInviteUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onInviteUser}
                  className="h-8 w-8 p-0"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
              
              {collaboration.hasPermission('canManageCollaboration') && onManagePermissions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onManagePermissions}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {/* Current user */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={collaboration.currentUser?.avatar} />
                  <AvatarFallback style={{ backgroundColor: collaboration.currentUser?.color }}>
                    {collaboration.currentUser?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  <Crown className="h-3 w-3 text-yellow-500" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {collaboration.currentUser?.name} (You)
                  </span>
                  <Badge variant="secondary" className="text-xs">Owner</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {collaboration.currentUser?.email}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {collaboration.canEdit && <Edit3 className="h-3 w-3 text-green-500" />}
                <div 
                  className="w-2 h-2 rounded-full bg-green-500"
                  title="Online"
                />
              </div>
            </div>
            
            {/* Other users */}
            {collaboration.users.map(user => {
              const awareness = collaboration.awareness[user.id]
              const isActive = awareness && (Date.now() - awareness.lastActivity.getTime()) < 30000
              
              return (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback style={{ backgroundColor: user.color }}>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {awareness?.isTyping && (
                      <div className="absolute -bottom-1 -right-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{user.name}</span>
                      {user.permissions.canEdit && (
                        <Badge variant="outline" className="text-xs">Editor</Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="truncate">{user.email}</span>
                      {awareness?.currentTool && (
                        <span className="text-blue-500">• {awareness.currentTool}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {awareness?.selection && awareness.selection.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Eye className="h-3 w-3 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Viewing {awareness.selection.length} component(s)
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={isActive ? 'Online' : 'Away'}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Follow User
                      </DropdownMenuItem>
                      {collaboration.hasPermission('canManageCollaboration') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Lock className="h-4 w-4 mr-2" />
                            Manage Permissions
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderConnectionStatus = () => {
    if (!showConnectionStatus) return null

    return (
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <Card className={`${
          collaboration.connectionError 
            ? 'border-red-200 bg-red-50' 
            : collaboration.isConnected 
            ? 'border-green-200 bg-green-50'
            : 'border-yellow-200 bg-yellow-50'
        }`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {collaboration.connectionError ? (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    Connection failed: {collaboration.connectionError}
                  </span>
                </>
              ) : collaboration.isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    Connected to collaboration server
                  </span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-yellow-700">
                    Connecting to collaboration server...
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <>
      {/* Cursors */}
      <AnimatePresence>
        {Object.values(collaboration.cursors).map(renderCursor)}
      </AnimatePresence>

      {/* Selections */}
      {Object.entries(collaboration.selections).map(([userId, componentIds]) =>
        renderSelection(userId, componentIds)
      )}

      {/* User List */}
      {renderUserList()}

      {/* Connection Status */}
      <AnimatePresence>
        {renderConnectionStatus()}
      </AnimatePresence>
    </>
  )
}

// Component for showing collaboration status in the toolbar
export const CollaborationStatus: React.FC<{
  collaboration: UseCollaborationReturn
  compact?: boolean
}> = ({ collaboration, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          collaboration.isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-xs text-muted-foreground">
          {collaboration.users.length + 1} online
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        {collaboration.isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm font-medium">
          {collaboration.isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {collaboration.users.length + 1} collaborator{collaboration.users.length !== 0 ? 's' : ''}
        </span>
      </div>
      
      {collaboration.connectionError && (
        <>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-red-600">
            Error: {collaboration.connectionError}
          </span>
        </>
      )}
    </div>
  )
}