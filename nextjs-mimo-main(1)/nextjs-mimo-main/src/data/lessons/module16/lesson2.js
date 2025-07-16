const lesson2 = {
  id: '16-2',
  title: 'Développement du Projet Final - Implémentation et Bonnes Pratiques',
  content: {
    theory: `
# Développement du Projet Final - Implémentation et Bonnes Pratiques

## Objectifs de la leçon
- Implémenter les fonctionnalités clés de votre projet final
- Appliquer les bonnes pratiques de développement Next.js
- Gérer la structure et l'organisation du code
- Intégrer les technologies et concepts appris

## Phase de Développement

### 1. Structure et Architecture

**Organisation des fichiers :**
\`\`\`
my-nextjs-project/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── api/
│   │   ├── dashboard/
│   │   └── layout.js
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── layout/
│   ├── lib/
│   │   ├── auth.js
│   │   ├── db.js
│   │   └── utils.js
│   ├── hooks/
│   ├── styles/
│   └── data/
├── public/
├── tests/
└── docs/
\`\`\`

### 2. Implémentation des Fonctionnalités Core

**Authentification et autorisation :**
\`\`\`javascript
// src/lib/auth.js
import { NextAuth } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    },
  },
}
\`\`\`

**API Routes robustes :**
\`\`\`javascript
// src/app/api/projects/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Logique métier
    const projects = await getProjects(session.user.id)
    
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
\`\`\`

### 3. Gestion d'État et Performance

**Hooks personnalisés :**
\`\`\`javascript
// src/hooks/useProjects.js
import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export function useProjects() {
  const { data, error, mutate } = useSWR('/api/projects', fetcher)

  const addProject = async (projectData) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    })
    
    if (response.ok) {
      mutate() // Revalidation automatique
    }
  }

  return {
    projects: data?.projects || [],
    isLoading: !error && !data,
    isError: error,
    addProject,
  }
}
\`\`\`

### 4. Interface Utilisateur Responsive

**Composants réutilisables :**
\`\`\`javascript
// src/components/ui/Button.js
import { cn } from '@/lib/utils'

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  className,
  ...props 
}) {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
\`\`\`

### 5. Tests et Validation

**Tests unitaires avec Jest :**
\`\`\`javascript
// tests/components/Button.test.js
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})
\`\`\`

### 6. Optimisation et Performance

**Image Optimization :**
\`\`\`javascript
import Image from 'next/image'

export function ProjectCard({ project }) {
  return (
    <div className="border rounded-lg p-4">
      <Image
        src={project.image}
        alt={project.title}
        width={400}
        height={300}
        priority={project.featured}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />
      <h3>{project.title}</h3>
      <p>{project.description}</p>
    </div>
  )
}
\`\`\`

**Lazy Loading et Suspense :**
\`\`\`javascript
import { Suspense, lazy } from 'react'

const ProjectDetails = lazy(() => import('./ProjectDetails'))

export function ProjectPage() {
  return (
    <div>
      <h1>Mes Projets</h1>
      <Suspense fallback={<div>Chargement...</div>}>
        <ProjectDetails />
      </Suspense>
    </div>
  )
}
\`\`\`

## Bonnes Pratiques de Développement

### 1. Code Quality
- Utiliser ESLint et Prettier
- Suivre les conventions de nommage
- Écrire du code lisible et documenté
- Utiliser TypeScript pour la sécurité des types

### 2. Performance
- Optimiser les images et assets
- Implémenter le code splitting
- Utiliser les techniques de mise en cache
- Surveiller les Core Web Vitals

### 3. Sécurité
- Valider toutes les entrées utilisateur
- Utiliser HTTPS en production
- Implémenter la protection CSRF
- Sécuriser les variables d'environnement

### 4. Accessibilité
- Utiliser les attributs ARIA appropriés
- Assurer la navigation au clavier
- Maintenir un bon contraste des couleurs
- Tester avec les lecteurs d'écran
    `,
    example: `
## Exemple : Implémentation d'une Fonctionnalité Complète

Développons une fonctionnalité de gestion de tâches avec toutes les bonnes pratiques :

### 1. Modèle de données

\`\`\`javascript
// src/lib/models/Task.js
export class Task {
  constructor(data) {
    this.id = data.id
    this.title = data.title
    this.description = data.description
    this.completed = data.completed || false
    this.priority = data.priority || 'medium'
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static validate(data) {
    const errors = []
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Le titre doit contenir au moins 3 caractères')
    }
    
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      errors.push('La date d\'échéance ne peut pas être dans le passé')
    }
    
    return errors
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      completed: this.completed,
      priority: this.priority,
      dueDate: this.dueDate?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    }
  }
}
\`\`\`

### 2. Service API

\`\`\`javascript
// src/lib/services/taskService.js
import { Task } from '@/lib/models/Task'

export class TaskService {
  static async getTasks(userId, filters = {}) {
    const url = new URL('/api/tasks', process.env.NEXT_PUBLIC_APP_URL)
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value)
      }
    })

    const response = await fetch(url, {
      headers: {
        'Authorization': \`Bearer \${await getAuthToken()}\`,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tâches')
    }

    const data = await response.json()
    return data.tasks.map(task => new Task(task))
  }

  static async createTask(taskData) {
    const errors = Task.validate(taskData)
    if (errors.length > 0) {
      throw new ValidationError(errors)
    }

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${await getAuthToken()}\`,
      },
      body: JSON.stringify(taskData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    const data = await response.json()
    return new Task(data.task)
  }

  static async updateTask(id, updates) {
    const response = await fetch(\`/api/tasks/\${id}\`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${await getAuthToken()}\`,
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    const data = await response.json()
    return new Task(data.task)
  }

  static async deleteTask(id) {
    const response = await fetch(\`/api/tasks/\${id}\`, {
      method: 'DELETE',
      headers: {
        'Authorization': \`Bearer \${await getAuthToken()}\`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    return true
  }
}

class ValidationError extends Error {
  constructor(errors) {
    super('Erreur de validation')
    this.name = 'ValidationError'
    this.errors = errors
  }
}
\`\`\`

### 3. Hook personnalisé

\`\`\`javascript
// src/hooks/useTasks.js
import { useState, useEffect } from 'react'
import { TaskService } from '@/lib/services/taskService'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'

export function useTasks(filters = {}) {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadTasks = async () => {
    if (!session?.user) return

    setLoading(true)
    setError(null)

    try {
      const tasks = await TaskService.getTasks(session.user.id, filters)
      setTasks(tasks)
    } catch (err) {
      setError(err.message)
      toast.error('Erreur lors du chargement des tâches')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData) => {
    try {
      const newTask = await TaskService.createTask(taskData)
      setTasks(prev => [newTask, ...prev])
      toast.success('Tâche créée avec succès')
      return newTask
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const updateTask = async (id, updates) => {
    try {
      const updatedTask = await TaskService.updateTask(id, updates)
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ))
      toast.success('Tâche mise à jour')
      return updatedTask
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const deleteTask = async (id) => {
    try {
      await TaskService.deleteTask(id)
      setTasks(prev => prev.filter(task => task.id !== id))
      toast.success('Tâche supprimée')
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (task) {
      await updateTask(id, { completed: !task.completed })
    }
  }

  useEffect(() => {
    loadTasks()
  }, [session, JSON.stringify(filters)])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    refetch: loadTasks,
  }
}
\`\`\`

### 4. Composant de liste de tâches

\`\`\`javascript
// src/components/TaskList.js
import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export function TaskList() {
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    completed: null,
    priority: null,
  })

  const { tasks, loading, createTask, updateTask, deleteTask, toggleComplete } = useTasks(filters)

  const handleCreateTask = async (taskData) => {
    await createTask(taskData)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Tâches</h2>
        <Button onClick={() => setShowForm(true)}>
          Nouvelle Tâche
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <select
          value={filters.completed || ''}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            completed: e.target.value === '' ? null : e.target.value === 'true'
          }))}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Toutes</option>
          <option value="false">En cours</option>
          <option value="true">Terminées</option>
        </select>

        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            priority: e.target.value || null
          }))}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Toutes priorités</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune tâche trouvée
          </p>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onToggleComplete={toggleComplete}
            />
          ))
        )}
      </div>

      {/* Modal de création */}
      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
\`\`\`

Cet exemple montre comment structurer une fonctionnalité complète avec :
- Séparation des responsabilités
- Gestion d'état optimisée
- Interface utilisateur réactive
- Gestion d'erreurs robuste
- Tests et validation
    `,
    exercise: `
## Exercice Pratique : Développement de Fonctionnalité

### Objectif
Implémenter une fonctionnalité complète de votre projet final en appliquant toutes les bonnes pratiques.

### Instructions

1. **Choisissez une fonctionnalité core** de votre projet (ex: authentification, CRUD, dashboard)

2. **Créez la structure suivante :**
   - Modèle de données avec validation
   - Service API avec gestion d'erreurs
   - Hook personnalisé pour la gestion d'état
   - Composants UI réutilisables
   - Tests unitaires

3. **Implémentez les éléments suivants :**

   **a) Modèle de données :**
   \`\`\`javascript
   // src/lib/models/[YourModel].js
   export class YourModel {
     constructor(data) {
       // Initialisation des propriétés
     }

     static validate(data) {
       // Logique de validation
       return errors
     }

     toJSON() {
       // Sérialisation
     }
   }
   \`\`\`

   **b) Service API :**
   \`\`\`javascript
   // src/lib/services/[yourService].js
   export class YourService {
     static async getItems() {}
     static async createItem(data) {}
     static async updateItem(id, data) {}
     static async deleteItem(id) {}
   }
   \`\`\`

   **c) Hook personnalisé :**
   \`\`\`javascript
   // src/hooks/use[YourFeature].js
   export function useYourFeature() {
     // State management
     // API calls
     // Error handling
     return { data, loading, error, actions }
   }
   \`\`\`

   **d) Composant principal :**
   \`\`\`javascript
   // src/components/[YourFeature].js
   export function YourFeature() {
     // Utilise votre hook
     // Interface utilisateur
     // Gestion des interactions
   }
   \`\`\`

4. **Tests :**
   Écrivez au moins 3 tests pour votre fonctionnalité :
   - Test du modèle de données
   - Test du service API
   - Test du composant

5. **Documentation :**
   Ajoutez des commentaires JSDoc pour vos fonctions principales

### Critères d'évaluation
- ✅ Structure claire et organisée
- ✅ Gestion d'erreurs robuste
- ✅ Interface utilisateur responsive
- ✅ Code réutilisable et maintenable
- ✅ Tests fonctionnels
- ✅ Performance optimisée

### Livrable
Créez un dossier \`features/[nom-fonctionnalite]\` avec tous les fichiers de votre implémentation.
    `,
    quiz: {
      question:
        "Quelle est la meilleure pratique pour gérer l'état global dans une application Next.js ?",
      options: [
        'Utiliser uniquement useState dans chaque composant',
        'Créer un Context global pour toutes les données',
        'Combiner des hooks personnalisés avec des solutions comme Zustand ou SWR selon les besoins',
        'Stocker tout dans localStorage'
      ],
      correct: 2,
      explanation:
        "La combinaison de hooks personnalisés avec des solutions comme Zustand pour l'état global et SWR pour les données serveur offre la meilleure flexibilité et performance. Cela permet une gestion d'état adaptée à chaque type de données."
    },
    project: {
      title: 'Implémentation des Fonctionnalités Core',
      description:
        'Développez les fonctionnalités principales de votre projet final en appliquant toutes les bonnes pratiques de Next.js.',
      requirements: [
        'Implémenter au moins 3 fonctionnalités core de votre projet',
        'Utiliser une architecture claire avec séparation des responsabilités',
        'Créer des composants réutilisables et bien documentés',
        "Implémenter une gestion d'état optimisée avec hooks personnalisés",
        'Ajouter des tests unitaires pour les fonctions critiques',
        'Optimiser les performances (images, lazy loading, etc.)',
        'Assurer la responsive design sur mobile et desktop',
        "Implémenter une gestion d'erreurs robuste",
        'Ajouter des validations côté client et serveur',
        'Documenter votre code avec des commentaires JSDoc'
      ],
      validation: {
        technical: [
          "Code organisé selon l'architecture recommandée",
          'Hooks personnalisés pour la logique métier',
          'Composants UI réutilisables',
          "Tests avec une couverture d'au moins 70%",
          'Performance : Core Web Vitals dans le vert',
          'Responsive design validé sur différents appareils'
        ],
        functional: [
          'Fonctionnalités complètes et opérationnelles',
          'Interface utilisateur intuitive',
          "Gestion d'erreurs gracieuse",
          'Validation des données robuste',
          'Expérience utilisateur fluide'
        ]
      }
    }
  }
}

export default lesson2
