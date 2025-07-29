'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Cloud,
  Rocket,
  Globe,
  Settings,
  ExternalLink,
  Copy,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Github,
  GitBranch,
  Server,
  Database,
  Shield,
  Zap,
  MoreVertical,
  Eye,
  Trash2,
  Edit3
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export interface DeploymentProvider {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  features: string[]
  pricing: 'free' | 'paid' | 'freemium'
  setupComplexity: 'easy' | 'medium' | 'hard'
}

export interface DeploymentConfig {
  id: string
  name: string
  provider: string
  environment: 'development' | 'staging' | 'production'
  domain?: string
  customDomain?: string
  envVars: Record<string, string>
  buildCommand: string
  outputDirectory: string
  nodeVersion: string
  autoDeployBranch?: string
  enablePreview: boolean
  enableAnalytics: boolean
  enableCDN: boolean
  enableSSL: boolean
}

export interface Deployment {
  id: string
  configId: string
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled'
  url?: string
  previewUrl?: string
  branch: string
  commit: string
  commitMessage: string
  startedAt: Date
  completedAt?: Date
  duration?: number
  logs: DeploymentLog[]
  metrics?: DeploymentMetrics
}

export interface DeploymentLog {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  source: 'build' | 'deploy' | 'runtime'
}

export interface DeploymentMetrics {
  buildTime: number
  bundleSize: number
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  bestPracticesScore: number
}

const DEPLOYMENT_PROVIDERS: DeploymentProvider[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    icon: Zap,
    description: 'Deploy with zero configuration on Vercel\'s edge network',
    features: ['Edge Functions', 'Automatic HTTPS', 'Global CDN', 'Preview Deployments'],
    pricing: 'freemium',
    setupComplexity: 'easy'
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: Globe,
    description: 'Build, deploy, and manage modern web projects',
    features: ['Form Handling', 'Split Testing', 'Edge Functions', 'Analytics'],
    pricing: 'freemium',
    setupComplexity: 'easy'
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    icon: Github,
    description: 'Host directly from your GitHub repository',
    features: ['Free Hosting', 'Custom Domains', 'Jekyll Support', 'HTTPS'],
    pricing: 'free',
    setupComplexity: 'medium'
  },
  {
    id: 'aws-amplify',
    name: 'AWS Amplify',
    icon: Cloud,
    description: 'Full-stack development platform with hosting',
    features: ['Backend Integration', 'Authentication', 'APIs', 'Storage'],
    pricing: 'paid',
    setupComplexity: 'hard'
  },
  {
    id: 'firebase',
    name: 'Firebase Hosting',
    icon: Server,
    description: 'Fast and secure web hosting by Google',
    features: ['Global CDN', 'SSL Certificates', 'Custom Domains', 'Rollbacks'],
    pricing: 'freemium',
    setupComplexity: 'medium'
  }
]

interface DeploymentManagerProps {
  projectId: string
  projectName: string
  gitRepository?: {
    url: string
    branch: string
    provider: 'github' | 'gitlab' | 'bitbucket'
  }
}

export const DeploymentManager: React.FC<DeploymentManagerProps> = ({
  projectId,
  projectName,
  gitRepository
}) => {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<DeploymentConfig[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isCreatingConfig, setIsCreatingConfig] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<DeploymentConfig | null>(null)
  const [isDeploying, setIsDeploying] = useState<Record<string, boolean>>({})
  const [showLogs, setShowLogs] = useState<string | null>(null)

  // Load deployment configurations
  useEffect(() => {
    loadConfigs()
    loadDeployments()
  }, [projectId])

  const loadConfigs = async () => {
    try {
      // In a real app, this would fetch from your API
      const mockConfigs: DeploymentConfig[] = [
        {
          id: 'config-1',
          name: 'Production',
          provider: 'vercel',
          environment: 'production',
          domain: 'my-app.vercel.app',
          customDomain: 'myapp.com',
          envVars: {
            NODE_ENV: 'production',
            API_URL: 'https://api.myapp.com'
          },
          buildCommand: 'npm run build',
          outputDirectory: 'dist',
          nodeVersion: '18.x',
          autoDeployBranch: 'main',
          enablePreview: true,
          enableAnalytics: true,
          enableCDN: true,
          enableSSL: true
        }
      ]
      setConfigs(mockConfigs)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load deployment configurations',
        variant: 'destructive'
      })
    }
  }

  const loadDeployments = async () => {
    try {
      // Mock deployment history
      const mockDeployments: Deployment[] = [
        {
          id: 'deploy-1',
          configId: 'config-1',
          status: 'success',
          url: 'https://my-app.vercel.app',
          previewUrl: 'https://my-app-git-feature-user.vercel.app',
          branch: 'main',
          commit: 'abc123',
          commitMessage: 'Add new feature',
          startedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3300000),
          duration: 300000,
          logs: [],
          metrics: {
            buildTime: 45000,
            bundleSize: 2.5,
            performanceScore: 95,
            accessibilityScore: 98,
            seoScore: 92,
            bestPracticesScore: 96
          }
        }
      ]
      setDeployments(mockDeployments)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load deployment history',
        variant: 'destructive'
      })
    }
  }

  const createDeployment = async (configId: string) => {
    setIsDeploying(prev => ({ ...prev, [configId]: true }))
    
    try {
      // Simulate deployment process
      const newDeployment: Deployment = {
        id: `deploy-${Date.now()}`,
        configId,
        status: 'pending',
        branch: gitRepository?.branch || 'main',
        commit: 'latest',
        commitMessage: 'Deploy from Visual Editor',
        startedAt: new Date(),
        logs: []
      }
      
      setDeployments(prev => [newDeployment, ...prev])
      
      // Simulate build process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id 
          ? { ...d, status: 'building' }
          : d
      ))
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id 
          ? { ...d, status: 'deploying' }
          : d
      ))
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const config = configs.find(c => c.id === configId)
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id 
          ? { 
              ...d, 
              status: 'success',
              url: `https://${projectName.toLowerCase()}.${config?.provider}.app`,
              completedAt: new Date(),
              duration: 6000
            }
          : d
      ))
      
      toast({
        title: 'Deployment Successful',
        description: 'Your project has been deployed successfully!'
      })
    } catch (error) {
      toast({
        title: 'Deployment Failed',
        description: 'Failed to deploy your project. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsDeploying(prev => ({ ...prev, [configId]: false }))
    }
  }

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
      case 'building':
      case 'deploying':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
      case 'building':
      case 'deploying':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'URL copied to clipboard'
    })
  }

  const renderProviderCard = (provider: DeploymentProvider) => (
    <Card key={provider.id} className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <provider.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{provider.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={provider.pricing === 'free' ? 'secondary' : 'outline'}>
                {provider.pricing}
              </Badge>
              <Badge variant="outline">{provider.setupComplexity}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{provider.description}</p>
        <div className="space-y-1">
          {provider.features.map(feature => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {feature}
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" onClick={() => setSelectedConfig(null)}>
          Configure {provider.name}
        </Button>
      </CardContent>
    </Card>
  )

  const renderDeploymentCard = (deployment: Deployment) => {
    const config = configs.find(c => c.id === deployment.configId)
    const provider = DEPLOYMENT_PROVIDERS.find(p => p.id === config?.provider)
    
    return (
      <Card key={deployment.id}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(deployment.status)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{config?.name}</span>
                  <Badge className={getStatusColor(deployment.status)}>
                    {deployment.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {provider?.name} • {deployment.branch} • {deployment.commit.slice(0, 7)}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {deployment.url && (
                  <DropdownMenuItem onClick={() => window.open(deployment.url, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Site
                  </DropdownMenuItem>
                )}
                {deployment.previewUrl && (
                  <DropdownMenuItem onClick={() => window.open(deployment.previewUrl, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowLogs(deployment.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="text-sm text-muted-foreground mb-3">
            {deployment.commitMessage}
          </div>
          
          {deployment.url && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono flex-1 truncate">{deployment.url}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(deployment.url!)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {deployment.metrics && (
            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {deployment.metrics.performanceScore}
                </div>
                <div className="text-xs text-muted-foreground">Performance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {deployment.metrics.bundleSize}MB
                </div>
                <div className="text-xs text-muted-foreground">Bundle Size</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployment</h2>
          <p className="text-muted-foreground">
            Deploy your project to the cloud with one click
          </p>
        </div>
        
        <Dialog open={isCreatingConfig} onOpenChange={setIsCreatingConfig}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Rocket className="h-4 w-4" />
              New Deployment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose Deployment Provider</DialogTitle>
              <DialogDescription>
                Select a platform to deploy your project
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {DEPLOYMENT_PROVIDERS.map(renderProviderCard)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deployments" className="space-y-4">
          {configs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {configs.map(config => {
                const provider = DEPLOYMENT_PROVIDERS.find(p => p.id === config.provider)
                const isDeployingThis = isDeploying[config.id]
                
                return (
                  <Card key={config.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        {provider && <provider.icon className="h-5 w-5" />}
                        <div>
                          <CardTitle className="text-lg">{config.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {provider?.name} • {config.environment}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => createDeployment(config.id)}
                        disabled={isDeployingThis}
                      >
                        {isDeployingThis ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            Deploy
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Deployments</h3>
            {deployments.length > 0 ? (
              <div className="space-y-3">
                {deployments.map(renderDeploymentCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No deployments yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first deployment configuration to get started
                  </p>
                  <Button onClick={() => setIsCreatingConfig(true)}>
                    Create Deployment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="configurations">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Deployment Configurations</h3>
            <p className="text-muted-foreground">
              Manage your deployment settings and environment variables
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Deployment Analytics</h3>
            <p className="text-muted-foreground">
              View performance metrics and deployment statistics
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}