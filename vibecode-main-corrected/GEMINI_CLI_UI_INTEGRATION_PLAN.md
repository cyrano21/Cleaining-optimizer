# Plan d'Intégration Gemini-CLI-UI dans Vibecode

## 🎯 Objectif
Intégrer les fonctionnalités avancées du projet [Gemini-CLI-UI](https://github.com/cruzyjapan/Gemini-CLI-UI) dans Vibecode pour améliorer l'expérience utilisateur et les capacités de l'IDE.

## 📊 Analyse Comparative

### Gemini-CLI-UI - Fonctionnalités Clés
- **Interface Chat AI Intégrée** : Chat en temps réel avec streaming
- **Support Multi-Format** : Images, fichiers, conversations
- **Gestion de Session Avancée** : Persistance, organisation par projet
- **Intégration Git Avancée** : Visualisation des changements, staging/commit
- **Terminal Intégré** : Connexion WebSocket
- **Design Responsive** : Support mobile et PWA
- **Sélection de Modèles AI** : Interface pour choisir différents modèles

### Vibecode - Architecture Actuelle
- **Framework** : Next.js 15 (App Router)
- **AI Chat** : Interface multi-onglets (AI Chat + Cline Agent)
- **Providers AI** : Ollama, Gemini, HuggingFace
- **WebContainers** : Exécution en navigateur
- **Terminal** : xterm.js intégré
- **File Explorer** : Gestion complète des fichiers
- **Auth** : NextAuth (Google + GitHub)

## 🚀 Plan d'Intégration par Phases

### Phase 1: Chat AI Amélioré avec Streaming (Priorité Haute)

#### 1.1 Streaming en Temps Réel
**Objectif** : Implémenter le streaming des réponses AI comme dans Gemini-CLI-UI

**Actions** :
- [ ] Créer un endpoint WebSocket pour le streaming (`/api/chat/stream`)
- [ ] Modifier `ai-chat-sidepanel.tsx` pour supporter le streaming
- [ ] Implémenter `useStreamingChat` hook
- [ ] Ajouter indicateurs visuels de streaming (typing, progress)

**Fichiers à modifier** :
- `app/api/chat/stream/route.ts` (nouveau)
- `features/ai-chat/hooks/useStreamingChat.ts` (nouveau)
- `features/ai-chat/components/ai-chat-sidepanel.tsx`
- `lib/gemini-ai.ts`, `lib/ollama-ai.ts`

#### 1.2 Support Multi-Format
**Objectif** : Ajouter support pour images et fichiers multiples

**Actions** :
- [ ] Étendre `FileAttachment` interface pour images
- [ ] Implémenter upload et preview d'images
- [ ] Ajouter support drag & drop amélioré
- [ ] Créer composant `MediaPreview`

**Fichiers à modifier** :
- `features/ai-chat/components/ai-chat-sidepanel.tsx`
- `features/ai-chat/components/media-preview.tsx` (nouveau)
- `features/ai-chat/types/chat.ts`

### Phase 2: Gestion de Session Avancée (Priorité Haute)

#### 2.1 Persistance des Conversations
**Objectif** : Sauvegarder et restaurer les conversations AI

**Actions** :
- [ ] Étendre le modèle `ChatMessage` dans Prisma
- [ ] Créer `ChatSession` model
- [ ] Implémenter sauvegarde automatique
- [ ] Ajouter interface de gestion des sessions

**Fichiers à modifier** :
- `prisma/schema.prisma`
- `app/api/chat/sessions/route.ts` (nouveau)
- `features/ai-chat/hooks/useChatSessions.ts` (nouveau)
- `features/ai-chat/components/session-manager.tsx` (nouveau)

#### 2.2 Organisation par Projet
**Objectif** : Lier les conversations aux projets/playgrounds

**Actions** :
- [ ] Associer sessions chat aux playgrounds
- [ ] Créer contexte de projet automatique
- [ ] Implémenter historique par projet
- [ ] Ajouter recherche dans l'historique

### Phase 3: Intégration Git Avancée (Priorité Moyenne)

#### 3.1 Visualisation des Changements
**Objectif** : Interface Git similaire à Gemini-CLI-UI

**Actions** :
- [ ] Créer composant `GitExplorer`
- [ ] Implémenter diff viewer
- [ ] Ajouter staging interactif
- [ ] Créer interface de commit

**Fichiers à créer** :
- `features/git/components/git-explorer.tsx`
- `features/git/components/diff-viewer.tsx`
- `features/git/hooks/useGitOperations.ts`

#### 3.2 Gestion des Branches
**Objectif** : Interface complète de gestion Git

**Actions** :
- [ ] Visualisation des branches
- [ ] Création/suppression de branches
- [ ] Merge et rebase interface
- [ ] Historique des commits

### Phase 4: Terminal et WebSocket Améliorés (Priorité Moyenne)

#### 4.1 WebSocket pour Terminal
**Objectif** : Remplacer l'implémentation actuelle par WebSocket

**Actions** :
- [ ] Créer serveur WebSocket pour terminal
- [ ] Modifier `terminal.tsx` pour WebSocket
- [ ] Implémenter reconnexion automatique
- [ ] Ajouter support multi-sessions

**Fichiers à modifier** :
- `app/api/terminal/ws/route.ts` (nouveau)
- `features/webcontainers/components/terminal.tsx`
- `features/webcontainers/hooks/useTerminalWebSocket.ts` (nouveau)

### Phase 5: Design Responsive et PWA (Priorité Basse)

#### 5.1 Support Mobile
**Objectif** : Interface adaptée mobile comme Gemini-CLI-UI

**Actions** :
- [ ] Responsive design pour chat AI
- [ ] Interface mobile pour file explorer
- [ ] Gestes tactiles pour terminal
- [ ] Navigation mobile optimisée

#### 5.2 PWA Support
**Objectif** : Application web progressive

**Actions** :
- [ ] Ajouter manifest.json
- [ ] Implémenter service worker
- [ ] Cache offline pour ressources
- [ ] Installation sur mobile/desktop

### Phase 6: Fonctionnalités Avancées (Priorité Basse)

#### 6.1 Sélection de Modèles AI
**Objectif** : Interface utilisateur pour choisir modèles

**Actions** :
- [ ] Créer `ModelSelector` component
- [ ] Interface de configuration AI
- [ ] Gestion des API keys
- [ ] Benchmarking des modèles

#### 6.2 Collaboration Temps Réel
**Objectif** : Édition collaborative

**Actions** :
- [ ] WebSocket pour collaboration
- [ ] Operational Transform
- [ ] Curseurs multiples
- [ ] Chat de projet

## 🛠️ Architecture Technique

### WebSocket Implementation
```typescript
// app/api/ws/route.ts
import { WebSocketServer } from 'ws'

interface WSMessage {
  type: 'chat' | 'terminal' | 'collaboration'
  payload: any
  sessionId: string
}

class WebSocketManager {
  private wss: WebSocketServer
  private sessions: Map<string, WebSocket[]>
  
  handleChatStream(ws: WebSocket, message: ChatMessage) {
    // Streaming AI responses
  }
  
  handleTerminalCommand(ws: WebSocket, command: string) {
    // Terminal WebSocket
  }
}
```

### Streaming Chat Hook
```typescript
// features/ai-chat/hooks/useStreamingChat.ts
export const useStreamingChat = () => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  
  const sendMessage = async (message: string) => {
    const ws = new WebSocket('/api/chat/stream')
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'chunk') {
        setStreamedContent(prev => prev + data.content)
      }
    }
  }
  
  return { sendMessage, isStreaming, streamedContent }
}
```

### Session Management
```typescript
// features/ai-chat/hooks/useChatSessions.ts
export const useChatSessions = (playgroundId?: string) => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  
  const createSession = async (name: string) => {
    // Create new chat session
  }
  
  const loadSession = async (sessionId: string) => {
    // Load existing session
  }
  
  return { sessions, activeSession, createSession, loadSession }
}
```

## 📋 Checklist d'Implémentation

### Phase 1 - Chat AI Streaming
- [ ] WebSocket endpoint pour streaming
- [ ] Hook useStreamingChat
- [ ] Interface streaming dans ai-chat-sidepanel
- [ ] Support multi-format (images)
- [ ] Tests d'intégration

### Phase 2 - Sessions
- [ ] Modèles Prisma étendus
- [ ] API sessions CRUD
- [ ] Interface gestion sessions
- [ ] Sauvegarde automatique
- [ ] Recherche dans historique

### Phase 3 - Git Integration
- [ ] Composant GitExplorer
- [ ] Diff viewer
- [ ] Staging interface
- [ ] Branch management
- [ ] Commit interface

## 🎯 Métriques de Succès

1. **Performance** :
   - Temps de réponse streaming < 100ms
   - Chargement sessions < 500ms
   - Interface responsive < 16ms

2. **Fonctionnalité** :
   - Support 100% des formats Gemini-CLI-UI
   - Persistance 99.9% des sessions
   - Git operations sans erreur

3. **UX** :
   - Interface mobile utilisable
   - PWA installable
   - Collaboration temps réel

## 🔄 Timeline Estimé

- **Phase 1** : 2-3 semaines
- **Phase 2** : 2 semaines  
- **Phase 3** : 3-4 semaines
- **Phase 4** : 2-3 semaines
- **Phase 5** : 2 semaines
- **Phase 6** : 4-5 semaines

**Total** : 15-19 semaines (3.5-4.5 mois)

## 🚀 Prochaines Étapes

1. **Validation du plan** avec l'équipe
2. **Setup environnement** WebSocket
3. **Implémentation Phase 1** - Streaming Chat
4. **Tests et validation** utilisateur
5. **Itération** basée sur feedback

---

*Ce plan d'intégration vise à transformer Vibecode en un IDE encore plus puissant en s'inspirant des meilleures fonctionnalités de Gemini-CLI-UI tout en conservant l'architecture robuste existante.*