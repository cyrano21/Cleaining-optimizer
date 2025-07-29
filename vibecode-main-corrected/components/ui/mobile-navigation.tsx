"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Menu, 
  Home, 
  Code, 
  MessageSquare, 
  Settings, 
  User, 
  Plus,
  X,
  Zap,
  Terminal,
  Folder,
  GitBranch,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface MobileNavigationProps {
  className?: string
  isOnline?: boolean
  notifications?: number
}

interface NavItem {
  id: string
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
  external?: boolean
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  badge?: string
  color?: string
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    href: '/',
    label: 'Accueil',
    icon: Home,
    description: 'Page d\'accueil'
  },
  {
    id: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    icon: Code,
    description: 'Créer un nouveau projet'
  },
  {
    id: 'playgrounds',
    href: '/playgrounds',
    label: 'Projets',
    icon: Folder,
    description: 'Gérer vos projets'
  },
  {
    id: 'ai-chat',
    href: '/playground/new?tab=ai-chat',
    label: 'Chat IA',
    icon: MessageSquare,
    badge: 'IA',
    description: 'Assistant IA intégré'
  },
  {
    id: 'git',
    href: '/git',
    label: 'Git',
    icon: GitBranch,
    description: 'Gestion Git'
  },
  {
    id: 'settings',
    href: '/settings',
    label: 'Paramètres',
    icon: Settings,
    description: 'Configuration'
  }
]

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-playground',
    label: 'Nouveau',
    icon: <Plus className="w-5 h-5" />,
    action: () => {
      window.location.href = '/playground/new'
    },
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: <Terminal className="w-5 h-5" />,
    action: () => {
      const event = new CustomEvent('open-terminal')
      window.dispatchEvent(event)
    },
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'ai-chat',
    label: 'IA Chat',
    icon: <MessageSquare className="w-5 h-5" />,
    action: () => {
      const event = new CustomEvent('open-ai-chat')
      window.dispatchEvent(event)
    },
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'yolo-mode',
    label: 'YOLO',
    icon: <Zap className="w-5 h-5" />,
    action: () => {
      const event = new CustomEvent('toggle-yolo-mode')
      window.dispatchEvent(event)
    },
    color: 'bg-orange-500 hover:bg-orange-600'
  }
]

export function MobileNavigation({ 
  className, 
  isOnline = true,
  notifications = 0 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null)
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const sheetRef = useRef<HTMLDivElement>(null)

  // Détection des gestes tactiles améliorée
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    }
    
    setTouchEnd(currentTouch)
    
    // Gestion du swipe supprimée car non utilisée
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const timeDiff = touchEnd.time - touchStart.time
    
    // Swipe rapide (moins de 300ms) et distance suffisante
    const isQuickSwipe = timeDiff < 300
    const isLeftSwipe = distanceX > 50
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX)
    
    // Fermer avec swipe vers la gauche
    if (isLeftSwipe && !isVerticalSwipe && (isQuickSwipe || Math.abs(distanceX) > 100)) {
      setIsOpen(false)
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }



  // Gestion des gestes globaux pour ouvrir le menu
  useEffect(() => {
    let globalTouchStart: { x: number; y: number; time: number } | null = null

    const handleGlobalTouchStart = (e: TouchEvent) => {
      // Détecter le swipe depuis le bord gauche
      if (e.touches[0].clientX < 30 && !isOpen) {
        globalTouchStart = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
        }
      }
    }

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (globalTouchStart && !isOpen) {
        const endX = e.changedTouches[0].clientX
        const endY = e.changedTouches[0].clientY
        const timeDiff = Date.now() - globalTouchStart.time
        
        const distanceX = endX - globalTouchStart.x
        const distanceY = Math.abs(endY - globalTouchStart.y)
        
        // Swipe vers la droite depuis le bord
        if (distanceX > 80 && distanceY < 100 && timeDiff < 500) {
          setIsOpen(true)
        }
      }
      globalTouchStart = null
    }

    document.addEventListener('touchstart', handleGlobalTouchStart, { passive: true })
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleGlobalTouchStart)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [isOpen])

  // Fermer le menu lors du changement de route
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Gestion du scroll pour masquer/afficher la navigation
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Vibration tactile pour les interactions
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      }
      navigator.vibrate(patterns[type])
    }
  }

  if (!isMobile) {
    return null
  }

  return (
    <>
      {/* Barre de navigation mobile fixe */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t transition-transform duration-300 safe-area-pb",
          isVisible ? "translate-y-0" : "translate-y-full",
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {/* Navigation principale */}
          <Link href="/" className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
            pathname === '/' 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}>
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Accueil</span>
          </Link>

          <Link href="/playgrounds" className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
            pathname.startsWith('/playgrounds') 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}>
            <Folder className="h-5 w-5" />
            <span className="text-xs font-medium">Projets</span>
          </Link>

          {/* Bouton central - Nouveau */}
          <Link href="/dashboard" className="flex flex-col items-center gap-1 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all transform hover:scale-105">
            <Plus className="h-6 w-6" />
          </Link>

          <Link href="/playground/new?tab=ai-chat" className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px] relative",
            pathname.includes('ai-chat') 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs font-medium">Chat IA</span>
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-purple-500">
              IA
            </Badge>
          </Link>

          {/* Menu hamburger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col items-center gap-1 p-2 h-auto min-w-[60px]"
                onClick={() => hapticFeedback('light')}
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs font-medium">Menu</span>
                {notifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                  >
                    {notifications > 99 ? '99+' : notifications}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] p-0 overflow-hidden"
              ref={sheetRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <MobileMenu onClose={() => setIsOpen(false)} isOnline={isOnline} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Espaceur pour éviter que le contenu soit masqué */}
      <div className="h-20" />
    </>
  )
}

interface MobileMenuProps {
  onClose: () => void
  isOnline?: boolean
}

function MobileMenu({ onClose, isOnline = true }: MobileMenuProps) {
  const pathname = usePathname()

  // Vibration tactile pour les interactions
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      }
      navigator.vibrate(patterns[type])
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header avec gradient et statut */}
      <div className="p-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">VibeCode</h2>
                <div className="flex items-center gap-1 text-xs opacity-90">
                  {isOnline ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span>En ligne</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>Hors ligne</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                hapticFeedback('light')
                onClose()
              }}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Actions rapides avec animations */}
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={action.id}
                onClick={() => {
                  hapticFeedback('medium')
                  action.action()
                  if (!['terminal', 'ai-chat'].includes(action.id)) {
                    onClose()
                  }
                }}
                disabled={action.disabled}
                className={cn(
                  'relative flex flex-col items-center p-3 rounded-xl transition-all duration-200 transform',
                  'bg-white/20 hover:bg-white/30 active:scale-95 active:bg-white/40',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'animate-in slide-in-from-bottom-4 fade-in-0'
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className={cn(
                  'p-2 rounded-full text-white mb-1 transition-colors',
                  action.color || 'bg-white/20'
                )}>
                  {action.icon}
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {action.label}
                </span>
                {action.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {action.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation principale avec scroll */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Navigation
          </h3>
          
          <nav className="space-y-1">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    hapticFeedback('light')
                    onClose()
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 transform',
                    'active:scale-98 hover:shadow-sm',
                    'animate-in slide-in-from-left-4 fade-in-0',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                  style={{
                    animationDelay: `${(index + 4) * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className={cn(
                    'p-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-foreground/20'
                      : 'bg-accent/50'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="w-1 h-8 bg-primary-foreground/30 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <Separator className="mx-4" />
        
        {/* Section utilisateur */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Compte
          </h3>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-accent to-accent/50 border">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Développeur</p>
              <p className="text-xs text-muted-foreground truncate">
                dev@vibecode.app
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Actif</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Footer avec instructions */}
      <div className="p-4 border-t bg-muted/30 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">VibeCode Mobile</span>
          <span className="flex items-center gap-1">
            <span>Swipe</span>
            <span className="text-lg">←</span>
            <span>fermer</span>
          </span>
        </div>
        <div className="mt-2 flex items-center justify-center">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Hook pour détecter les gestes de swipe globaux
export function useSwipeGesture(onSwipeRight?: () => void, onSwipeLeft?: () => void) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight])

  useEffect(() => {
    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [touchStart, touchEnd, onTouchEnd])

  return { touchStart, touchEnd }
}