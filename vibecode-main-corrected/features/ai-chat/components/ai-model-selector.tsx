"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Zap, 
  Settings, 
  Cpu, 
  Cloud, 
  Brain, 
  Gauge, 
  Shield, 
  Sparkles,
  ChevronDown,
  Check,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OLLAMA_MODELS } from '@/lib/ollama-ai'
import { GEMINI_MODELS } from '@/lib/gemini-ai'
import { HUGGINGFACE_MODELS } from '@/lib/huggingface-ai'

interface AIModelSelectorProps {
  currentProvider: 'ollama' | 'gemini' | 'huggingface'
  currentModel: string
  onProviderChange: (provider: 'ollama' | 'gemini' | 'huggingface') => void
  onModelChange: (model: string) => void
  yoloMode?: boolean
  onYoloModeChange?: (enabled: boolean) => void
  className?: string
}

interface ModelInfo {
  name: string
  description: string
  speed: 'fast' | 'medium' | 'slow'
  quality: 'basic' | 'good' | 'excellent'
  size: 'small' | 'medium' | 'large'
  specialties: string[]
  recommended?: boolean
}

const MODEL_INFO: Record<string, Record<string, ModelInfo>> = {
  ollama: {
    [OLLAMA_MODELS.MISTRAL_LATEST]: {
      name: 'Mistral Latest',
      description: 'Modèle équilibré pour usage général',
      speed: 'fast',
      quality: 'good',
      size: 'medium',
      specialties: ['Chat', 'Code', 'Analyse'],
      recommended: true
    },
    [OLLAMA_MODELS.DEEPSEEK_R1_14B]: {
      name: 'DeepSeek R1 14B',
      description: 'Excellent pour le raisonnement et le code',
      speed: 'medium',
      quality: 'excellent',
      size: 'large',
      specialties: ['Code', 'Raisonnement', 'Debug']
    },
    [OLLAMA_MODELS.QWEN3_CODER]: {
      name: 'Qwen3 Coder',
      description: 'Spécialisé dans la génération de code',
      speed: 'fast',
      quality: 'excellent',
      size: 'medium',
      specialties: ['Code', 'Refactoring', 'Documentation']
    },
    [OLLAMA_MODELS.LLAMA3_1_8B]: {
      name: 'Llama 3.1 8B',
      description: 'Modèle rapide et efficace',
      speed: 'fast',
      quality: 'good',
      size: 'small',
      specialties: ['Chat', 'Résumé', 'Traduction']
    }
  },
  gemini: {
    [GEMINI_MODELS.FLASH]: {
      name: 'Gemini Flash',
      description: 'Réponses ultra-rapides',
      speed: 'fast',
      quality: 'good',
      size: 'medium',
      specialties: ['Chat', 'Code', 'Analyse'],
      recommended: true
    },
    [GEMINI_MODELS.PRO]: {
      name: 'Gemini Pro',
      description: 'Qualité premium pour tâches complexes',
      speed: 'medium',
      quality: 'excellent',
      size: 'large',
      specialties: ['Raisonnement', 'Architecture', 'Analyse']
    },
    [GEMINI_MODELS.FLASH_8B]: {
      name: 'Gemini Flash 8B',
      description: 'Version compacte et rapide',
      speed: 'fast',
      quality: 'good',
      size: 'small',
      specialties: ['Chat', 'Code simple', 'Résumé']
    }
  },
  huggingface: {
    [HUGGINGFACE_MODELS.CODE]: {
      name: 'DistilGPT-2',
      description: 'Modèle léger pour tests',
      speed: 'fast',
      quality: 'basic',
      size: 'small',
      specialties: ['Test', 'Prototype', 'Démo']
    }
  }
}

const PROVIDER_INFO = {
  ollama: {
    name: 'Ollama',
    icon: Cpu,
    description: 'Modèles locaux, privés et rapides',
    pros: ['Confidentialité', 'Pas de limite', 'Hors ligne'],
    cons: ['Ressources GPU', 'Installation requise']
  },
  gemini: {
    name: 'Google Gemini',
    icon: Brain,
    description: 'IA avancée de Google',
    pros: ['Très performant', 'Multimodal', 'Rapide'],
    cons: ['Nécessite API key', 'Limites de quota']
  },
  huggingface: {
    name: 'Hugging Face',
    icon: Cloud,
    description: 'Modèles open-source',
    pros: ['Gratuit', 'Variété', 'Open source'],
    cons: ['Qualité variable', 'Limites API']
  }
}

const getSpeedColor = (speed: string) => {
  switch (speed) {
    case 'fast': return 'text-green-500'
    case 'medium': return 'text-yellow-500'
    case 'slow': return 'text-red-500'
    default: return 'text-gray-500'
  }
}

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'excellent': return 'text-purple-500'
    case 'good': return 'text-blue-500'
    case 'basic': return 'text-gray-500'
    default: return 'text-gray-500'
  }
}

export function AIModelSelector({
  currentProvider,
  currentModel,
  onProviderChange,
  onModelChange,
  yoloMode = false,
  onYoloModeChange,
  className
}: AIModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(currentProvider)
  const [selectedModel, setSelectedModel] = useState(currentModel)

  useEffect(() => {
    setSelectedProvider(currentProvider)
    setSelectedModel(currentModel)
  }, [currentProvider, currentModel])

  const handleProviderChange = (provider: string) => {
    const validProvider = provider as 'ollama' | 'gemini' | 'huggingface'
    setSelectedProvider(validProvider)
    
    // Auto-sélectionner le modèle recommandé
    const models = MODEL_INFO[validProvider]
    const recommendedModel = Object.keys(models).find(key => models[key].recommended)
    const firstModel = Object.keys(models)[0]
    const newModel = recommendedModel || firstModel
    
    setSelectedModel(newModel)
    
    if (yoloMode) {
      onProviderChange(validProvider)
      onModelChange(newModel)
    }
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    
    if (yoloMode) {
      onModelChange(model)
    }
  }

  const handleApply = () => {
    onProviderChange(selectedProvider)
    onModelChange(selectedModel)
    setIsOpen(false)
  }

  const currentModelInfo = MODEL_INFO[currentProvider]?.[currentModel]
  const providerIcon = PROVIDER_INFO[currentProvider].icon

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("justify-between min-w-[200px]", className)}
        >
          <div className="flex items-center gap-2">
            {React.createElement(providerIcon, { className: "h-4 w-4" })}
            <span className="truncate">
              {currentModelInfo?.name || currentModel}
            </span>
            {yoloMode && (
              <Zap className="h-3 w-3 text-yellow-500" />
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sélection de Modèle IA
          </DialogTitle>
          <DialogDescription>
            Choisissez le fournisseur et le modèle IA qui conviennent le mieux à vos besoins
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Mode YOLO */}
          {onYoloModeChange && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">
                      Mode YOLO
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Changements instantanés
                    </Badge>
                  </div>
                  <Switch 
                    checked={yoloMode} 
                    onCheckedChange={onYoloModeChange}
                  />
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  Les changements sont appliqués immédiatement sans confirmation
                </p>
              </CardContent>
            </Card>
          )}
          
          <Tabs value={selectedProvider} onValueChange={handleProviderChange}>
            <TabsList className="grid w-full grid-cols-3">
              {Object.entries(PROVIDER_INFO).map(([key, info]) => {
                const Icon = info.icon
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {info.name}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            
            {Object.entries(PROVIDER_INFO).map(([providerKey, providerInfo]) => (
              <TabsContent key={providerKey} value={providerKey} className="space-y-4">
                {/* Info du fournisseur */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {React.createElement(providerInfo.icon, { className: "h-5 w-5" })}
                      {providerInfo.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {providerInfo.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Avantages
                        </h4>
                        <ul className="text-sm space-y-1">
                          {providerInfo.pros.map((pro, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Limitations
                        </h4>
                        <ul className="text-sm space-y-1">
                          {providerInfo.cons.map((con, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-orange-500 rounded-full" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sélection de modèle */}
                <div className="space-y-3">
                  <h3 className="font-medium">Modèles disponibles</h3>
                  <div className="grid gap-3">
                    {Object.entries(MODEL_INFO[providerKey] || {}).map(([modelKey, modelInfo]) => (
                      <Card 
                        key={modelKey}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedModel === modelKey 
                            ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-900"
                        )}
                        onClick={() => handleModelChange(modelKey)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{modelInfo.name}</h4>
                                {modelInfo.recommended && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Recommandé
                                  </Badge>
                                )}
                                {selectedModel === modelKey && (
                                  <Check className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {modelInfo.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <Gauge className={cn("h-3 w-3", getSpeedColor(modelInfo.speed))} />
                                  <span className="capitalize">{modelInfo.speed}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Shield className={cn("h-3 w-3", getQualityColor(modelInfo.quality))} />
                                  <span className="capitalize">{modelInfo.quality}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {modelInfo.size}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-2">
                                {modelInfo.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          {!yoloMode && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleApply}>
                Appliquer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}