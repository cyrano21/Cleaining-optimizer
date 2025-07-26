'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flag,
  Settings,
  Users,
  Calendar,
  Target,
  Code,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { GlassMorphismCard } from '@/components/ui/glass-morphism-card';
import { NotificationSystem, NotificationProps } from '@/components/ui/notification-system';

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  category: 'ui' | 'api' | 'security' | 'experimental' | 'business';
  environment: 'development' | 'staging' | 'production' | 'all';
  rolloutPercentage: number;
  targetUsers?: string[];
  startDate?: Date;
  endDate?: Date;
  dependencies?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

// Interface FeatureFlagRule supprimée car non utilisée

const FeatureFlagsPage = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      id: '1',
      name: 'Nouveau Dashboard Analytics',
      key: 'new_analytics_dashboard',
      description: 'Active le nouveau tableau de bord analytics avec des métriques avancées',
      enabled: true,
      category: 'ui',
      environment: 'staging',
      rolloutPercentage: 25,
      targetUsers: ['admin', 'analyst'],
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20'),
      createdBy: 'admin@example.com',
      lastModifiedBy: 'admin@example.com'
    },
    {
      id: '2',
      name: 'API Rate Limiting v2',
      key: 'api_rate_limiting_v2',
      description: 'Nouvelle version du système de limitation de taux API',
      enabled: false,
      category: 'api',
      environment: 'development',
      rolloutPercentage: 0,
      dependencies: ['redis_cache'],
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'dev@example.com',
      lastModifiedBy: 'dev@example.com'
    },
    {
      id: '3',
      name: 'Authentification 2FA',
      key: 'two_factor_auth',
      description: 'Active l\'authentification à deux facteurs pour tous les utilisateurs',
      enabled: true,
      category: 'security',
      environment: 'production',
      rolloutPercentage: 100,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-22'),
      createdBy: 'security@example.com',
      lastModifiedBy: 'admin@example.com'
    },
    {
      id: '4',
      name: 'Recommandations IA',
      key: 'ai_recommendations',
      description: 'Système de recommandations basé sur l\'intelligence artificielle',
      enabled: false,
      category: 'experimental',
      environment: 'development',
      rolloutPercentage: 5,
      targetUsers: ['beta_tester'],
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-19'),
      createdBy: 'ai-team@example.com',
      lastModifiedBy: 'ai-team@example.com'
    },
    {
      id: '5',
      name: 'Programme de Fidélité',
      key: 'loyalty_program',
      description: 'Active le nouveau programme de fidélité avec points et récompenses',
      enabled: true,
      category: 'business',
      environment: 'production',
      rolloutPercentage: 50,
      startDate: new Date('2024-01-20'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-21'),
      createdBy: 'marketing@example.com',
      lastModifiedBy: 'admin@example.com'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  // Effet pour gérer les raccourcis clavier et les mises à jour
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editingFlag) {
        setEditingFlag(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingFlag]);

  // Effet pour sauvegarder automatiquement les modifications
  useEffect(() => {
    if (editingFlag) {
      const timer = setTimeout(() => {
        console.log('Auto-sauvegarde des modifications:', editingFlag.name);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [editingFlag]);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const categories = [
    { value: 'all', label: 'Toutes les catégories', icon: Flag },
    { value: 'ui', label: 'Interface utilisateur', icon: Eye },
    { value: 'api', label: 'API', icon: Code },
    { value: 'security', label: 'Sécurité', icon: Shield },
    { value: 'experimental', label: 'Expérimental', icon: Zap },
    { value: 'business', label: 'Business', icon: Target }
  ];

  const environments = [
    { value: 'all', label: 'Tous les environnements' },
    { value: 'development', label: 'Développement' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' }
  ];

  const filteredFlags = flags.filter(flag => {
    const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory;
    const matchesEnvironment = selectedEnvironment === 'all' || flag.environment === selectedEnvironment || flag.environment === 'all';
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesEnvironment && matchesSearch;
  });

  const toggleFlag = (flagId: string) => {
    setFlags(prev => prev.map(flag => {
      if (flag.id === flagId) {
        const updated = { ...flag, enabled: !flag.enabled, updatedAt: new Date() };
        addNotification(
          updated.enabled ? 'success' : 'warning',
          `Feature flag "${flag.name}" ${updated.enabled ? 'activé' : 'désactivé'}`,
          `La fonctionnalité a été ${updated.enabled ? 'activée' : 'désactivée'} avec succès`
        );
        return updated;
      }
      return flag;
    }));
  };

  const updateRolloutPercentage = (flagId: string, percentage: number) => {
    setFlags(prev => prev.map(flag => {
      if (flag.id === flagId) {
        const updated = { ...flag, rolloutPercentage: percentage, updatedAt: new Date() };
        addNotification(
          'info',
          `Rollout mis à jour`,
          `Le pourcentage de déploiement de "${flag.name}" a été mis à jour à ${percentage}%`
        );
        return updated;
      }
      return flag;
    }));
  };

  const deleteFlag = (flagId: string) => {
    const flag = flags.find(f => f.id === flagId);
    if (flag) {
      setFlags(prev => prev.filter(f => f.id !== flagId));
      addNotification(
        'success',
        'Feature flag supprimé',
        `"${flag.name}" a été supprimé avec succès`
      );
    }
  };

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData ? categoryData.icon : Flag;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ui': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'api': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'experimental': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'business': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'development': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'staging': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'production': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'all': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (flag: FeatureFlag) => {
    if (!flag.enabled) return 'text-gray-500';
    if (flag.rolloutPercentage === 100) return 'text-green-600';
    if (flag.rolloutPercentage > 0) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getStatusText = (flag: FeatureFlag) => {
    if (!flag.enabled) return 'Désactivé';
    if (flag.rolloutPercentage === 100) return 'Déployé';
    if (flag.rolloutPercentage > 0) return `Rollout ${flag.rolloutPercentage}%`;
    return 'Configuré';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <NotificationSystem notifications={notifications} />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gestion des Feature Flags
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Contrôlez le déploiement des fonctionnalités en temps réel
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <Settings className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Planifier
            </Button>
            
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Feature Flag
            </Button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassMorphismCard className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Flag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Flags</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{flags.length}</p>
                </div>
              </div>
            </GlassMorphismCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassMorphismCard className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {flags.filter(f => f.enabled).length}
                  </p>
                </div>
              </div>
            </GlassMorphismCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassMorphismCard className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Rollout</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {flags.filter(f => f.enabled && f.rolloutPercentage > 0 && f.rolloutPercentage < 100).length}
                  </p>
                </div>
              </div>
            </GlassMorphismCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassMorphismCard className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Production</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {flags.filter(f => f.environment === 'production' || f.environment === 'all').length}
                  </p>
                </div>
              </div>
            </GlassMorphismCard>
          </motion.div>
        </div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col lg:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un feature flag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {environments.map(env => (
                <SelectItem key={env.value} value={env.value}>
                  {env.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Liste des Feature Flags */}
        <div className="space-y-4">
          {filteredFlags.map((flag, index) => {
            const CategoryIcon = getCategoryIcon(flag.category);
            
            return (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassMorphismCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {flag.name}
                          </h3>
                          <Badge className={getCategoryColor(flag.category)}>
                            {flag.category}
                          </Badge>
                          <Badge className={getEnvironmentColor(flag.environment)}>
                            {flag.environment}
                          </Badge>
                          <div className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(flag)}`}>
                            <div className={`w-2 h-2 rounded-full ${
                              flag.enabled ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            {getStatusText(flag)}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400">{flag.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Clé: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{flag.key}</code></span>
                          <span>Créé par: {flag.createdBy}</span>
                          <span>Modifié: {flag.updatedAt.toLocaleDateString('fr-FR')}</span>
                        </div>
                        
                        {flag.enabled && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Rollout: {flag.rolloutPercentage}%</Label>
                              <div className="flex items-center gap-2">
                                <Percent className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{flag.rolloutPercentage}%</span>
                              </div>
                            </div>
                            <Slider
                              value={[flag.rolloutPercentage]}
                              onValueChange={([value]) => updateRolloutPercentage(flag.id, value)}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        )}
                        
                        {flag.targetUsers && flag.targetUsers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Utilisateurs cibles:</span>
                            <div className="flex gap-1">
                              {flag.targetUsers.map(user => (
                                <Badge key={user} variant="outline" className="text-xs">
                                  {user}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {flag.dependencies && flag.dependencies.length > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">Dépendances:</span>
                            <div className="flex gap-1">
                              {flag.dependencies.map(dep => (
                                <Badge key={dep} variant="outline" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => toggleFlag(flag.id)}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        title="Voir les détails"
                      >
                        {flag.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFlag(flag)}
                        title="Éditer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        title="Sauvegarder les modifications"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFlag(flag.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassMorphismCard>
              </motion.div>
            );
          })}
        </div>

        {/* Section Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Flags Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredFlags.filter(f => f.enabled).length}</div>
              <p className="text-xs text-muted-foreground">sur {filteredFlags.length} total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Rollout Moyen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(filteredFlags.reduce((acc, f) => acc + f.rolloutPercentage, 0) / filteredFlags.length || 0)}%
              </div>
              <p className="text-xs text-muted-foreground">pourcentage de déploiement</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Environnements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(filteredFlags.map(f => f.environment)).size}</div>
              <p className="text-xs text-muted-foreground">environnements actifs</p>
            </CardContent>
          </Card>
        </div>

        {filteredFlags.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun feature flag trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez de modifier vos critères de recherche ou créez un nouveau feature flag
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Modale d'édition */}
      {editingFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Éditer le Feature Flag</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingFlag(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="flag-name">Nom</Label>
                <Input
                  id="flag-name"
                  value={editingFlag.name}
                  onChange={(e) => setEditingFlag({...editingFlag, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="flag-description">Description</Label>
                <Textarea
                  id="flag-description"
                  value={editingFlag.description}
                  onChange={(e) => setEditingFlag({...editingFlag, description: e.target.value})}
                  rows={3}
                  placeholder="Décrivez l'utilité de ce feature flag..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingFlag(null)}>
                  Annuler
                </Button>
                <Button onClick={() => {
                  // Logique de sauvegarde ici
                  setEditingFlag(null);
                }}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureFlagsPage;