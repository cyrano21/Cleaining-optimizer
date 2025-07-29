'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Code,
  Palette,
  Smartphone,
  Globe,
  Database,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
  Copy,
  ExternalLink,
  Play,
  Settings,
  Plus,
  Sparkles,
  Layers,
  Box,
  FileText,
  Image,
  Video,
  Music,
  ShoppingCart,
  Calendar,
  Mail,
  Map,
  Camera,
  Gamepad2,
  BookOpen,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Car,
  Home,
  Utensils,
  Plane
} from 'lucide-react'

export interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  subcategory?: string
  tags: string[]
  thumbnail: string
  previewUrl?: string
  demoUrl?: string
  sourceUrl?: string
  framework: Framework
  styling: StylingFramework
  features: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // in hours
  downloads: number
  likes: number
  rating: number
  author: TemplateAuthor
  createdAt: Date
  updatedAt: Date
  isPremium: boolean
  price?: number
  license: 'MIT' | 'Apache' | 'GPL' | 'Commercial'
  dependencies: string[]
  fileStructure: FileStructure[]
  customization: CustomizationOption[]
}

export interface TemplateAuthor {
  id: string
  name: string
  avatar?: string
  verified: boolean
  company?: string
}

export interface FileStructure {
  path: string
  type: 'file' | 'directory'
  size?: number
  description?: string
}

export interface CustomizationOption {
  id: string
  name: string
  type: 'color' | 'text' | 'image' | 'boolean' | 'select' | 'number'
  defaultValue: any
  options?: string[]
  description: string
}

export type TemplateCategory = 
  | 'web-app'
  | 'mobile-app'
  | 'desktop-app'
  | 'landing-page'
  | 'dashboard'
  | 'e-commerce'
  | 'blog'
  | 'portfolio'
  | 'saas'
  | 'api'
  | 'component-library'
  | 'starter-kit'

export type Framework = 
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'next'
  | 'nuxt'
  | 'gatsby'
  | 'remix'
  | 'astro'
  | 'vanilla'
  | 'react-native'
  | 'flutter'
  | 'ionic'
  | 'electron'
  | 'tauri'

export type StylingFramework = 
  | 'tailwind'
  | 'bootstrap'
  | 'material-ui'
  | 'chakra-ui'
  | 'ant-design'
  | 'styled-components'
  | 'emotion'
  | 'css-modules'
  | 'sass'
  | 'vanilla-css'

interface TemplateGalleryProps {
  onTemplateSelect?: (template: Template) => void
  onTemplateUse?: (template: Template, customizations?: Record<string, any>) => void
}

const categoryIcons = {
  'web-app': <Globe className="h-5 w-5" />,
  'mobile-app': <Smartphone className="h-5 w-5" />,
  'desktop-app': <Box className="h-5 w-5" />,
  'landing-page': <FileText className="h-5 w-5" />,
  'dashboard': <Layers className="h-5 w-5" />,
  'e-commerce': <ShoppingCart className="h-5 w-5" />,
  'blog': <BookOpen className="h-5 w-5" />,
  'portfolio': <Briefcase className="h-5 w-5" />,
  'saas': <Zap className="h-5 w-5" />,
  'api': <Database className="h-5 w-5" />,
  'component-library': <Palette className="h-5 w-5" />,
  'starter-kit': <Sparkles className="h-5 w-5" />
}

const complexityColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Modern E-commerce Store',
    description: 'Complete e-commerce solution with cart, checkout, and payment integration',
    category: 'e-commerce',
    subcategory: 'full-stack',
    tags: ['react', 'nextjs', 'stripe', 'tailwind', 'prisma'],
    thumbnail: '/templates/ecommerce-modern.jpg',
    previewUrl: 'https://preview.example.com/ecommerce',
    demoUrl: 'https://demo.example.com/ecommerce',
    sourceUrl: 'https://github.com/example/ecommerce-template',
    framework: 'next',
    styling: 'tailwind',
    features: ['Shopping Cart', 'Payment Integration', 'User Authentication', 'Admin Dashboard', 'Inventory Management'],
    complexity: 'intermediate',
    estimatedTime: 8,
    downloads: 15420,
    likes: 2341,
    rating: 4.8,
    author: {
      id: '1',
      name: 'John Developer',
      avatar: '/avatars/john.jpg',
      verified: true,
      company: 'TechCorp'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isPremium: false,
    license: 'MIT',
    dependencies: ['next', 'react', 'tailwindcss', 'stripe', 'prisma'],
    fileStructure: [
      { path: 'src/', type: 'directory' },
      { path: 'src/components/', type: 'directory' },
      { path: 'src/pages/', type: 'directory' },
      { path: 'src/lib/', type: 'directory' },
      { path: 'package.json', type: 'file', size: 1024 }
    ],
    customization: [
      {
        id: 'primary-color',
        name: 'Primary Color',
        type: 'color',
        defaultValue: '#3b82f6',
        description: 'Main brand color for buttons and accents'
      },
      {
        id: 'store-name',
        name: 'Store Name',
        type: 'text',
        defaultValue: 'My Store',
        description: 'Name of your online store'
      }
    ]
  },
  {
    id: '2',
    name: 'SaaS Dashboard',
    description: 'Professional dashboard template for SaaS applications',
    category: 'dashboard',
    subcategory: 'admin',
    tags: ['react', 'typescript', 'charts', 'analytics'],
    thumbnail: '/templates/saas-dashboard.jpg',
    previewUrl: 'https://preview.example.com/dashboard',
    framework: 'react',
    styling: 'tailwind',
    features: ['Analytics Charts', 'User Management', 'Billing Integration', 'Team Collaboration'],
    complexity: 'advanced',
    estimatedTime: 12,
    downloads: 8932,
    likes: 1567,
    rating: 4.9,
    author: {
      id: '2',
      name: 'Sarah Designer',
      verified: true
    },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
    isPremium: true,
    price: 49,
    license: 'Commercial',
    dependencies: ['react', 'typescript', 'recharts', 'tailwindcss'],
    fileStructure: [],
    customization: []
  },
  {
    id: '3',
    name: 'Portfolio Website',
    description: 'Clean and modern portfolio template for developers and designers',
    category: 'portfolio',
    tags: ['gatsby', 'graphql', 'markdown', 'responsive'],
    thumbnail: '/templates/portfolio-modern.jpg',
    framework: 'gatsby',
    styling: 'styled-components',
    features: ['Blog Integration', 'Project Showcase', 'Contact Form', 'SEO Optimized'],
    complexity: 'beginner',
    estimatedTime: 4,
    downloads: 12456,
    likes: 987,
    rating: 4.6,
    author: {
      id: '3',
      name: 'Mike Creative',
      verified: false
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    isPremium: false,
    license: 'MIT',
    dependencies: ['gatsby', 'react', 'styled-components', 'graphql'],
    fileStructure: [],
    customization: []
  }
]

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onTemplateSelect,
  onTemplateUse
}) => {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(mockTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFramework, setSelectedFramework] = useState<string>('all')
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('popular')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [customizations, setCustomizations] = useState<Record<string, any>>({})

  useEffect(() => {
    filterAndSortTemplates()
  }, [templates, searchQuery, selectedCategory, selectedFramework, selectedComplexity, sortBy, showPremiumOnly])

  const filterAndSortTemplates = () => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      const matchesFramework = selectedFramework === 'all' || template.framework === selectedFramework
      const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity
      const matchesPremium = !showPremiumOnly || template.isPremium
      
      return matchesSearch && matchesCategory && matchesFramework && matchesComplexity && matchesPremium
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'downloads':
          return b.downloads - a.downloads
        case 'popular':
        default:
          return (b.downloads + b.likes) - (a.downloads + a.likes)
      }
    })

    setFilteredTemplates(filtered)
  }

  const handleTemplatePreview = (template: Template) => {
    setSelectedTemplate(template)
    setCustomizations({})
    template.customization.forEach(option => {
      setCustomizations(prev => ({
        ...prev,
        [option.id]: option.defaultValue
      }))
    })
    setIsPreviewOpen(true)
  }

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onTemplateUse?.(selectedTemplate, customizations)
      setIsPreviewOpen(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const renderTemplateCard = (template: Template) => (
    <motion.div
      key={template.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => handleTemplatePreview(template)}>
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            {categoryIcons[template.category]}
            <span className="ml-2 text-sm font-medium text-gray-600">
              {template.category.replace('-', ' ')}
            </span>
          </div>
          
          {template.isPremium && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              {template.demoUrl && (
                <Button size="sm" variant="secondary">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Demo
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1 line-clamp-1">{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={complexityColors[template.complexity]}>
              {template.complexity}
            </Badge>
            <Badge variant="outline">
              {template.framework}
            </Badge>
            <Badge variant="outline">
              {template.styling}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              {renderStars(template.rating)}
              <span className="ml-1 font-medium">{template.rating}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {formatNumber(template.downloads)}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatNumber(template.likes)}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 3).map(feature => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {template.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.features.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={template.author.avatar} />
                <AvatarFallback className="text-xs">
                  {template.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <div className="font-medium">{template.author.name}</div>
                {template.author.verified && (
                  <div className="text-blue-600">✓ Verified</div>
                )}
              </div>
            </div>
            
            <div className="text-right text-xs text-muted-foreground">
              <div>{template.estimatedTime}h setup</div>
              {template.isPremium && template.price && (
                <div className="font-medium text-green-600">${template.price}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderCustomizationOption = (option: CustomizationOption) => {
    const value = customizations[option.id] || option.defaultValue
    
    switch (option.type) {
      case 'color':
        return (
          <div key={option.id} className="space-y-2">
            <Label>{option.name}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => setCustomizations(prev => ({
                  ...prev,
                  [option.id]: e.target.value
                }))}
                className="w-12 h-8 rounded border"
              />
              <Input
                value={value}
                onChange={(e) => setCustomizations(prev => ({
                  ...prev,
                  [option.id]: e.target.value
                }))}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </div>
        )
      
      case 'text':
        return (
          <div key={option.id} className="space-y-2">
            <Label>{option.name}</Label>
            <Input
              value={value}
              onChange={(e) => setCustomizations(prev => ({
                ...prev,
                [option.id]: e.target.value
              }))}
            />
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </div>
        )
      
      case 'boolean':
        return (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={value}
              onCheckedChange={(checked) => setCustomizations(prev => ({
                ...prev,
                [option.id]: checked
              }))}
            />
            <Label htmlFor={option.id}>{option.name}</Label>
          </div>
        )
      
      case 'select':
        return (
          <div key={option.id} className="space-y-2">
            <Label>{option.name}</Label>
            <Select value={value} onValueChange={(newValue) => setCustomizations(prev => ({
              ...prev,
              [option.id]: newValue
            }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {option.options?.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Gallery</h2>
          <p className="text-muted-foreground">
            Discover and use professional templates to kickstart your projects
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Submit Template
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="web-app">Web App</SelectItem>
              <SelectItem value="mobile-app">Mobile App</SelectItem>
              <SelectItem value="desktop-app">Desktop App</SelectItem>
              <SelectItem value="landing-page">Landing Page</SelectItem>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="e-commerce">E-commerce</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="saas">SaaS</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="component-library">Components</SelectItem>
              <SelectItem value="starter-kit">Starter Kit</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frameworks</SelectItem>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="vue">Vue</SelectItem>
              <SelectItem value="angular">Angular</SelectItem>
              <SelectItem value="svelte">Svelte</SelectItem>
              <SelectItem value="next">Next.js</SelectItem>
              <SelectItem value="nuxt">Nuxt.js</SelectItem>
              <SelectItem value="gatsby">Gatsby</SelectItem>
              <SelectItem value="remix">Remix</SelectItem>
              <SelectItem value="astro">Astro</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="premium-only"
              checked={showPremiumOnly}
              onCheckedChange={setShowPremiumOnly}
            />
            <Label htmlFor="premium-only">Premium only</Label>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <AnimatePresence>
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(renderTemplateCard)}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {categoryIcons[selectedTemplate.category]}
                  {selectedTemplate.name}
                  {selectedTemplate.isPremium && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    {categoryIcons[selectedTemplate.category]}
                    <p className="mt-2 text-sm text-muted-foreground">Template Preview</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Features</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.features.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Tech Stack</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.dependencies.map(dep => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Framework</div>
                        <div className="font-medium">{selectedTemplate.framework}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Styling</div>
                        <div className="font-medium">{selectedTemplate.styling}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Complexity</div>
                        <div className="font-medium">{selectedTemplate.complexity}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Setup Time</div>
                        <div className="font-medium">{selectedTemplate.estimatedTime}h</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Customization</h3>
                    {selectedTemplate.customization.length > 0 ? (
                      <div className="space-y-4">
                        {selectedTemplate.customization.map(renderCustomizationOption)}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No customization options available
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {renderStars(selectedTemplate.rating)}
                      <span className="ml-1 text-sm font-medium">{selectedTemplate.rating}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(selectedTemplate.downloads)} downloads
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(selectedTemplate.likes)} likes
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedTemplate.demoUrl && (
                      <Button variant="outline" asChild>
                        <a href={selectedTemplate.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    
                    {selectedTemplate.sourceUrl && (
                      <Button variant="outline" asChild>
                        <a href={selectedTemplate.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <Code className="h-4 w-4 mr-2" />
                          Source Code
                        </a>
                      </Button>
                    )}
                    
                    <Button onClick={handleUseTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Use Template
                      {selectedTemplate.isPremium && selectedTemplate.price && (
                        <span className="ml-2">${selectedTemplate.price}</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}