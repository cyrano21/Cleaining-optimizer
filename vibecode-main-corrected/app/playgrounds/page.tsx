"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  MoreHorizontal, 
  Star, 
  Trash2, 
  Edit, 
  Copy, 
  ExternalLink,
  Calendar,
  User
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAllPlaygrounds, deleteProjectById } from "@/features/playground/actions"

interface Playground {
  id: string
  title: string
  description: string | null
  template: string
  createdAt: Date
  updatedAt: Date
  user: {
    name: string | null
    email: string | null
  }
}

export default function PlaygroundsPage() {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([])
  const [filteredPlaygrounds, setFilteredPlaygrounds] = useState<Playground[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [playgroundToDelete, setPlaygroundToDelete] = useState<Playground | null>(null)

  useEffect(() => {
    const loadPlaygrounds = async () => {
      try {
        const data = await getAllPlaygrounds()
        setPlaygrounds(data || [])
        setFilteredPlaygrounds(data || [])
      } catch (error) {
        console.error("Error loading playgrounds:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlaygrounds()
  }, [])

  useEffect(() => {
    let filtered = playgrounds

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(playground => 
        playground.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playground.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by template
    if (selectedTemplate !== "all") {
      filtered = filtered.filter(playground => playground.template === selectedTemplate)
    }

    setFilteredPlaygrounds(filtered)
  }, [searchQuery, selectedTemplate, playgrounds])

  const getTemplateColor = (template: string) => {
    const colors: Record<string, string> = {
      REACT: "bg-blue-100 text-blue-800",
      NEXTJS: "bg-black text-white",
      VUE: "bg-green-100 text-green-800",
      ANGULAR: "bg-red-100 text-red-800",
      EXPRESS: "bg-yellow-100 text-yellow-800",
      HONO: "bg-purple-100 text-purple-800"
    }
    return colors[template] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }

  const uniqueTemplates = Array.from(new Set(playgrounds.map(p => p.template)))

  const handleDeleteClick = (playground: Playground) => {
    setPlaygroundToDelete(playground)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (playgroundToDelete) {
      try {
        await deleteProjectById(playgroundToDelete.id)
        // Remove from local state
        setPlaygrounds(prev => prev.filter(p => p.id !== playgroundToDelete.id))
        setFilteredPlaygrounds(prev => prev.filter(p => p.id !== playgroundToDelete.id))
      } catch (error) {
        console.error("Error deleting playground:", error)
      } finally {
        setDeleteDialogOpen(false)
        setPlaygroundToDelete(null)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPlaygroundToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Playgrounds</h1>
          <p className="text-muted-foreground">
            {filteredPlaygrounds.length} playground{filteredPlaygrounds.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <Plus className="h-4 w-4 mr-2" />
            New Playground
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playgrounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {selectedTemplate === "all" ? "All Templates" : selectedTemplate}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedTemplate("all")}>
              All Templates
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {uniqueTemplates.map(template => (
              <DropdownMenuItem key={template} onClick={() => setSelectedTemplate(template)}>
                {template}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Playgrounds Grid/List */}
      {filteredPlaygrounds.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              {searchQuery || selectedTemplate !== "all" 
                ? "No playgrounds match your filters" 
                : "No playgrounds found"
              }
            </div>
            <Button asChild>
              <Link href="/dashboard">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Playground
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {filteredPlaygrounds.map((playground) => (
            <Card key={playground.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      <Link 
                        href={`/playground/${playground.id}`}
                        className="hover:underline"
                      >
                        {playground.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTemplateColor(playground.template)}>
                        {playground.template}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/playground/${playground.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteClick(playground)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {playground.description && (
                  <CardDescription className="mb-3 line-clamp-2">
                    {playground.description}
                  </CardDescription>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {playground.user.name || playground.user.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(playground.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playground</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &apos;{playgroundToDelete?.title}&apos;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}