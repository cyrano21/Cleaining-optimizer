'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  Archive,
  Star,
  GitBranch,
  MessageSquare,
  Paperclip,
  Eye,
  Edit,
  Trash2,
  Share2,
  Download,
  Upload,
  Settings,
  Target,
  TrendingUp,
  Activity,
  FileText,
  Folder,
  Code,
  Globe
} from 'lucide-react'
import { format } from 'date-fns'

export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress: number
  startDate: Date
  endDate: Date
  budget: number
  spent: number
  team: TeamMember[]
  tasks: Task[]
  tags: string[]
  repository?: string
  deploymentUrl?: string
  lastActivity: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'developer' | 'designer' | 'viewer'
  joinedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee?: TeamMember
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  comments: Comment[]
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  author: TeamMember
  createdAt: Date
  updatedAt?: Date
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: TeamMember
  uploadedAt: Date
}

interface ProjectManagerProps {
  onProjectSelect?: (project: Project) => void
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Modern e-commerce platform with React and Node.js',
    status: 'active',
    priority: 'high',
    progress: 75,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    budget: 50000,
    spent: 37500,
    team: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', joinedAt: new Date('2024-01-01') },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'developer', joinedAt: new Date('2024-01-05') }
    ],
    tasks: [],
    tags: ['react', 'nodejs', 'mongodb'],
    repository: 'https://github.com/company/ecommerce',
    deploymentUrl: 'https://ecommerce.example.com',
    lastActivity: new Date('2024-01-15'),
    createdBy: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'Cross-platform mobile app with React Native',
    status: 'planning',
    priority: 'medium',
    progress: 25,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-06-30'),
    budget: 75000,
    spent: 12500,
    team: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', joinedAt: new Date('2024-02-01') },
      { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'designer', joinedAt: new Date('2024-02-01') }
    ],
    tasks: [],
    tags: ['react-native', 'mobile', 'ios', 'android'],
    lastActivity: new Date('2024-01-10'),
    createdBy: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  }
]

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  archived: 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const statusIcons = {
  planning: <Clock className="h-4 w-4" />,
  active: <Play className="h-4 w-4" />,
  'on-hold': <Pause className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  archived: <Archive className="h-4 w-4" />
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(mockProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updatedAt')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: new Date(),
    endDate: new Date(),
    budget: 0,
    tags: []
  })

  useEffect(() => {
    filterAndSortProjects()
  }, [projects, searchQuery, statusFilter, priorityFilter, sortBy])

  const filterAndSortProjects = () => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'priority':
          const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'progress':
          return b.progress - a.progress
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    setFilteredProjects(filtered)
  }

  const createProject = () => {
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name || '',
      description: newProject.description || '',
      status: newProject.status || 'planning',
      priority: newProject.priority || 'medium',
      progress: 0,
      startDate: newProject.startDate || new Date(),
      endDate: newProject.endDate || new Date(),
      budget: newProject.budget || 0,
      spent: 0,
      team: [],
      tasks: [],
      tags: newProject.tags || [],
      lastActivity: new Date(),
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setProjects([...projects, project])
    setIsCreateDialogOpen(false)
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: new Date(),
      endDate: new Date(),
      budget: 0,
      tags: []
    })
  }

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, status, updatedAt: new Date() }
        : project
    ))
  }

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId))
  }

  const duplicateProject = (project: Project) => {
    const duplicated: Project = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date()
    }
    setProjects([...projects, duplicated])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getProjectStats = () => {
    const total = projects.length
    const active = projects.filter(p => p.status === 'active').length
    const completed = projects.filter(p => p.status === 'completed').length
    const overdue = projects.filter(p => 
      p.status !== 'completed' && new Date(p.endDate) < new Date()
    ).length
    
    return { total, active, completed, overdue }
  }

  const stats = getProjectStats()

  const renderProjectCard = (project: Project) => (
    <motion.div
      key={project.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onProjectSelect?.(project)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start"
                          onClick={() => duplicateProject(project)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-red-600"
                          onClick={() => deleteProject(project.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge className={statusColors[project.status]}>
              {statusIcons[project.status]}
              {project.status}
            </Badge>
            <Badge variant="outline" className={priorityColors[project.priority]}>
              {project.priority}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Budget</div>
              <div className="font-medium">{formatCurrency(project.budget)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Spent</div>
              <div className="font-medium">{formatCurrency(project.spent)}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {project.team.length} members
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(project.endDate, 'MMM dd')}
              </span>
            </div>
          </div>
          
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map(member => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                  +{project.team.length - 3}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {project.repository && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <GitBranch className="h-3 w-3" />
                </Button>
              )}
              {project.deploymentUrl && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Globe className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">
            Manage and track your development projects
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newProject.status} onValueChange={(value: Project['status']) => 
                    setNewProject({ ...newProject, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newProject.priority} onValueChange={(value: Project['priority']) => 
                    setNewProject({ ...newProject, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createProject}>
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Folder className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      <AnimatePresence>
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(renderProjectCard)}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}