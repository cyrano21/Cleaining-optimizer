'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Star,
  Download,
  Settings,
  Trash2,
  ExternalLink,
  Shield,
  Zap,
  Mail,
  BarChart3,
  ShoppingCart,
  Users,
  Palette,
  Globe,
  Package,
  CreditCard,
  MessageSquare,
  Camera,
  FileText,
  Truck,
  Gift,
  Filter,
  Grid,
  List as ListIcon,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface App {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  developer: string;
  version: string;
  price: number;
  rating: number;
  reviewCount: number;
  downloads: number;
  icon: string;
  screenshots: string[];
  features: string[];
  permissions: string[];
  isInstalled: boolean;
  isActive: boolean;
  lastUpdated: Date;
  compatibility: string[];
  tags: string[];
  supportUrl: string;
  documentationUrl: string;
}

interface InstalledApp {
  id: string;
  appId: string;
  name: string;
  version: string;
  isActive: boolean;
  installedAt: Date;
  lastUpdated: Date;
  settings: Record<string, any>;
}

const APP_CATEGORIES = [
  { id: 'all', name: 'Toutes les catégories', icon: Grid },
  { id: 'marketing', name: 'Marketing', icon: Megaphone },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'sales', name: 'Ventes', icon: ShoppingCart },
  { id: 'customer-service', name: 'Service client', icon: Users },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'shipping', name: 'Livraison', icon: Truck },
  { id: 'payment', name: 'Paiement', icon: CreditCard },
  { id: 'inventory', name: 'Inventaire', icon: Package },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'content', name: 'Contenu', icon: FileText },
  { id: 'social', name: 'Réseaux sociaux', icon: Globe }
];

interface AppMarketplaceProps {
  storeId: string;
}

export default function AppMarketplace({ storeId }: AppMarketplaceProps) {
  const [apps, setApps] = useState<App[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  useEffect(() => {
    loadApps();
    loadInstalledApps();
  }, [storeId]);

  const loadApps = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/marketplace/apps');
      if (response.ok) {
        const data = await response.json();
        setApps(data.apps || []);
      } else {
        // Données de démonstration
        setApps(generateMockApps());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des applications:', error);
      setApps(generateMockApps());
    } finally {
      setIsLoading(false);
    }
  };

  const loadInstalledApps = async () => {
    try {
      const response = await fetch(`/api/marketplace/installed?storeId=${storeId}`);
      if (response.ok) {
        const data = await response.json();
        setInstalledApps(data.apps || []);
      } else {
        setInstalledApps(generateMockInstalledApps());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des applications installées:', error);
      setInstalledApps(generateMockInstalledApps());
    }
  };

  const generateMockApps = (): App[] => [
    {
      id: '1',
      name: 'Email Marketing Pro',
      description: 'Solution complète d\'email marketing avec automation, segmentation avancée et analytics détaillés. Créez des campagnes personnalisées et augmentez vos conversions.',
      shortDescription: 'Email marketing avec automation et analytics',
      category: 'marketing',
      developer: 'MarketingTools Inc.',
      version: '2.1.0',
      price: 29.99,
      rating: 4.8,
      reviewCount: 1247,
      downloads: 15420,
      icon: '/icons/email-marketing.svg',
      screenshots: ['/screenshots/email1.jpg', '/screenshots/email2.jpg'],
      features: [
        'Automation des emails',
        'Segmentation avancée',
        'Templates personnalisables',
        'Analytics en temps réel',
        'A/B Testing',
        'Intégration CRM'
      ],
      permissions: ['Accès aux données clients', 'Envoi d\'emails', 'Analytics'],
      isInstalled: false,
      isActive: false,
      lastUpdated: new Date('2025-01-05'),
      compatibility: ['Ecomus 1.0+'],
      tags: ['email', 'marketing', 'automation'],
      supportUrl: 'https://support.marketingtools.com',
      documentationUrl: 'https://docs.marketingtools.com'
    },
    {
      id: '2',
      name: 'Advanced Analytics',
      description: 'Tableaux de bord analytics avancés avec métriques personnalisées, rapports automatisés et insights IA pour optimiser vos performances.',
      shortDescription: 'Analytics avancés avec IA',
      category: 'analytics',
      developer: 'DataInsights Ltd.',
      version: '1.5.2',
      price: 49.99,
      rating: 4.9,
      reviewCount: 892,
      downloads: 8930,
      icon: '/icons/analytics.svg',
      screenshots: ['/screenshots/analytics1.jpg', '/screenshots/analytics2.jpg'],
      features: [
        'Dashboards personnalisables',
        'Métriques avancées',
        'Rapports automatisés',
        'Insights IA',
        'Export de données',
        'Alertes intelligentes'
      ],
      permissions: ['Accès aux données de vente', 'Analytics', 'Rapports'],
      isInstalled: true,
      isActive: true,
      lastUpdated: new Date('2025-01-03'),
      compatibility: ['Ecomus 1.0+'],
      tags: ['analytics', 'reporting', 'ai'],
      supportUrl: 'https://support.datainsights.com',
      documentationUrl: 'https://docs.datainsights.com'
    },
    {
      id: '3',
      name: 'Social Media Manager',
      description: 'Gérez tous vos réseaux sociaux depuis votre dashboard. Programmation de posts, analytics social et engagement automatisé.',
      shortDescription: 'Gestion complète des réseaux sociaux',
      category: 'social',
      developer: 'SocialHub',
      version: '3.0.1',
      price: 19.99,
      rating: 4.6,
      reviewCount: 2156,
      downloads: 23450,
      icon: '/icons/social-media.svg',
      screenshots: ['/screenshots/social1.jpg', '/screenshots/social2.jpg'],
      features: [
        'Multi-plateformes',
        'Programmation de posts',
        'Analytics social',
        'Engagement automatisé',
        'Gestion des commentaires',
        'Rapports de performance'
      ],
      permissions: ['Accès aux réseaux sociaux', 'Publication de contenu'],
      isInstalled: false,
      isActive: false,
      lastUpdated: new Date('2025-01-07'),
      compatibility: ['Ecomus 1.0+'],
      tags: ['social', 'marketing', 'automation'],
      supportUrl: 'https://support.socialhub.com',
      documentationUrl: 'https://docs.socialhub.com'
    },
    {
      id: '4',
      name: 'Live Chat Support',
      description: 'Chat en temps réel avec vos clients. Support multilingue, chatbots IA et intégration CRM pour un service client exceptionnel.',
      shortDescription: 'Chat en temps réel avec IA',
      category: 'customer-service',
      developer: 'ChatPro Solutions',
      version: '2.3.0',
      price: 15.99,
      rating: 4.7,
      reviewCount: 1834,
      downloads: 18920,
      icon: '/icons/live-chat.svg',
      screenshots: ['/screenshots/chat1.jpg', '/screenshots/chat2.jpg'],
      features: [
        'Chat en temps réel',
        'Chatbots IA',
        'Support multilingue',
        'Intégration CRM',
        'Analytics de conversation',
        'Mobile responsive'
      ],
      permissions: ['Accès aux données clients', 'Notifications'],
      isInstalled: true,
      isActive: false,
      lastUpdated: new Date('2025-01-04'),
      compatibility: ['Ecomus 1.0+'],
      tags: ['chat', 'support', 'ai'],
      supportUrl: 'https://support.chatpro.com',
      documentationUrl: 'https://docs.chatpro.com'
    },
    {
      id: '5',
      name: 'Inventory Optimizer',
      description: 'Optimisation intelligente des stocks avec prédictions IA, alertes automatiques et gestion multi-entrepôts.',
      shortDescription: 'Gestion intelligente des stocks',
      category: 'inventory',
      developer: 'StockSmart',
      version: '1.8.0',
      price: 39.99,
      rating: 4.5,
      reviewCount: 567,
      downloads: 7890,
      icon: '/icons/inventory.svg',
      screenshots: ['/screenshots/inventory1.jpg', '/screenshots/inventory2.jpg'],
      features: [
        'Prédictions IA',
        'Alertes automatiques',
        'Multi-entrepôts',
        'Optimisation des commandes',
        'Rapports de stock',
        'Intégration fournisseurs'
      ],
      permissions: ['Accès aux données de stock', 'Gestion des produits'],
      isInstalled: false,
      isActive: false,
      lastUpdated: new Date('2025-01-02'),
      compatibility: ['Ecomus 1.0+'],
      tags: ['inventory', 'ai', 'optimization'],
      supportUrl: 'https://support.stocksmart.com',
      documentationUrl: 'https://docs.stocksmart.com'
    }
  ];

  const generateMockInstalledApps = (): InstalledApp[] => [
    {
      id: '1',
      appId: '2',
      name: 'Advanced Analytics',
      version: '1.5.2',
      isActive: true,
      installedAt: new Date('2024-12-15'),
      lastUpdated: new Date('2025-01-03'),
      settings: {
        dashboardLayout: 'advanced',
        reportFrequency: 'weekly',
        aiInsights: true
      }
    },
    {
      id: '2',
      appId: '4',
      name: 'Live Chat Support',
      version: '2.3.0',
      isActive: false,
      installedAt: new Date('2024-12-20'),
      lastUpdated: new Date('2025-01-04'),
      settings: {
        chatbotEnabled: true,
        language: 'fr',
        workingHours: '9-18'
      }
    }
  ];

  const installApp = async (appId: string) => {
    try {
      const response = await fetch('/api/marketplace/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, storeId })
      });

      if (response.ok) {
        toast.success('Application installée avec succès');
        loadApps();
        loadInstalledApps();
      } else {
        throw new Error('Erreur lors de l\'installation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
      toast.error('Erreur lors de l\'installation de l\'application');
    }
  };

  const uninstallApp = async (appId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désinstaller cette application ?')) return;

    try {
      const response = await fetch(`/api/marketplace/uninstall/${appId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Application désinstallée');
        loadApps();
        loadInstalledApps();
      } else {
        throw new Error('Erreur lors de la désinstallation');
      }
    } catch (error) {
      console.error('Erreur lors de la désinstallation:', error);
      toast.error('Erreur lors de la désinstallation');
    }
  };

  const toggleAppStatus = async (appId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/marketplace/toggle/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        toast.success(`Application ${isActive ? 'activée' : 'désactivée'}`);
        loadInstalledApps();
      } else {
        throw new Error('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuit' : `${price.toFixed(2)}€/mois`;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = APP_CATEGORIES.find(cat => cat.id === categoryId);
    const Icon = category?.icon || Package;
    return <Icon className="w-4 h-4" />;
  };

  const renderAppCard = (app: App) => (
    <Card key={app.id} className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            {app.name.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate">{app.name}</h3>
              <div className="flex items-center space-x-1">
                {app.isInstalled && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Installé
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{app.shortDescription}</p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1">{app.rating}</span>
                  <span className="text-gray-500">({app.reviewCount})</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{app.downloads.toLocaleString()} téléchargements</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-green-600">{formatPrice(app.price)}</span>
                {app.isInstalled ? (
                  <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                    <Settings className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => installApp(app.id)}>
                    <Download className="w-4 h-4 mr-1" />
                    Installer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAppList = (app: App) => (
    <Card key={app.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {app.name.charAt(0)}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">{app.name}</h3>
                <Badge variant="outline">{getCategoryIcon(app.category)} {APP_CATEGORIES.find(c => c.id === app.category)?.name}</Badge>
                {app.isInstalled && (
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Installé
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-2">{app.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Par {app.developer}</span>
                <span>•</span>
                <span>Version {app.version}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span>{app.rating} ({app.reviewCount} avis)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold text-green-600 mb-2">{formatPrice(app.price)}</p>
            {app.isInstalled ? (
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setSelectedApp(app)}>
                  <Settings className="w-4 h-4 mr-1" />
                  Configurer
                </Button>
                <Button variant="destructive" onClick={() => uninstallApp(app.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Désinstaller
                </Button>
              </div>
            ) : (
              <Button onClick={() => installApp(app.id)}>
                <Download className="w-4 h-4 mr-1" />
                Installer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">App Marketplace</h1>
          <p className="text-gray-600">Étendez les fonctionnalités de votre boutique</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Apps disponibles</p>
                <p className="text-2xl font-bold">{apps.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Apps installées</p>
                <p className="text-2xl font-bold">{installedApps.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Apps actives</p>
                <p className="text-2xl font-bold">{installedApps.filter(app => app.isActive).length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Catégories</p>
                <p className="text-2xl font-bold">{APP_CATEGORIES.length - 1}</p>
              </div>
              <Grid className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="installed">Apps installées</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher une application..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APP_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <category.icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Populaires</SelectItem>
                <SelectItem value="rating">Mieux notées</SelectItem>
                <SelectItem value="newest">Plus récentes</SelectItem>
                <SelectItem value="price-low">Prix croissant</SelectItem>
                <SelectItem value="price-high">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Liste des applications */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map(renderAppCard)}
            </div>
          ) : (
            <div>
              {filteredApps.map(renderAppList)}
            </div>
          )}

          {filteredApps.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune application trouvée</p>
              <p className="text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="installed" className="space-y-4">
          <div className="grid gap-4">
            {installedApps.map((installedApp) => {
              const app = apps.find(a => a.id === installedApp.appId);
              if (!app) return null;

              return (
                <Card key={installedApp.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {app.name.charAt(0)}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{app.name}</h3>
                            <Badge variant={installedApp.isActive ? 'default' : 'secondary'}>
                              {installedApp.isActive ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Actif
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Inactif
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{app.shortDescription}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Version {installedApp.version}</span>
                            <span>•</span>
                            <span>Installé le {new Date(installedApp.installedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAppStatus(installedApp.id, !installedApp.isActive)}
                        >
                          {installedApp.isActive ? (
                            <>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Activer
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configurer
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => uninstallApp(installedApp.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Désinstaller
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {installedApps.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune application installée</p>
                <p className="text-sm">Explorez le marketplace pour ajouter des fonctionnalités</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {APP_CATEGORIES.slice(1).map(category => {
              const categoryApps = apps.filter(app => app.category === category.id);
              const Icon = category.icon;
              
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-600">
                          {categoryApps.length} application{categoryApps.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de détails d'application */}
      {selectedApp && (
        <AppDetailsModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onInstall={() => installApp(selectedApp.id)}
          onUninstall={() => uninstallApp(selectedApp.id)}
        />
      )}
    </div>
  );
}

// Modal de détails d'application
interface AppDetailsModalProps {
  app: App;
  onClose: () => void;
  onInstall: () => void;
  onUninstall: () => void;
}

function AppDetailsModal({ app, onClose, onInstall, onUninstall }: AppDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {app.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{app.name}</h2>
              <p className="text-gray-600">Par {app.developer}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1">{app.rating}</span>
                  <span className="text-gray-500">({app.reviewCount} avis)</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{app.downloads.toLocaleString()} téléchargements</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            {app.isInstalled ? (
              <Button variant="destructive" onClick={onUninstall}>
                <Trash2 className="w-4 h-4 mr-1" />
                Désinstaller
              </Button>
            ) : (
              <Button onClick={onInstall}>
                <Download className="w-4 h-4 mr-1" />
                Installer - {formatPrice(app.price)}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{app.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Fonctionnalités</h3>
              <ul className="space-y-1">
                {app.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Captures d'écran</h3>
              <div className="grid grid-cols-2 gap-4">
                {app.screenshots.map((screenshot, index) => (
                  <div key={index} className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Capture {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Version</span>
                  <p className="font-medium">{app.version}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Dernière mise à jour</span>
                  <p className="font-medium">{new Date(app.lastUpdated).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Catégorie</span>
                  <p className="font-medium">{APP_CATEGORIES.find(c => c.id === app.category)?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Compatibilité</span>
                  <div className="space-y-1">
                    {app.compatibility.map((comp, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {app.permissions.map((permission, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Shield className="w-4 h-4 text-orange-500 mr-2" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Documentation
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

