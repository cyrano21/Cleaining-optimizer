'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme } from 'next-themes';
import { Search, Layout, Package, Crown, Zap, Star, Lock, CheckCircle, Eye, Settings } from 'lucide-react';
import TemplateConfigEditor from '@/components/TemplateConfigEditor';

// Types et interfaces
interface StoreOwner {
  _id: string;
  name: string;
  email: string;
}

interface StoreSubscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  isActive?: boolean;
  expiresAt?: Date;
}

interface SelectedTemplate {
  id: string;
  name: string;
  category: string;
}

interface AdditionalPage {
  id: string;
  name: string;
  isEnabled: boolean;
}

interface StoreDesign {
  selectedTemplate?: SelectedTemplate;
  additionalPages?: AdditionalPage[];
}

interface Store {
  _id: string;
  name: string;
  slug: string;
  owner: StoreOwner;
  subscription?: StoreSubscription;
  design?: StoreDesign;
  isActive: boolean;
  status: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview?: string;
  features?: string[];
  // Ajout pour la gestion des accès par abonnement
  subscriptionTier?: 'free' | 'basic' | 'premium' | 'enterprise';
}

interface AvailableTemplatesData {
  subscription: {
    plan: string;
    isActive: boolean;
    expiresAt?: string;
  };
  currentTemplate: SelectedTemplate | null;
  templates: Template[];
  totalCount: number;
}

type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

const SUBSCRIPTION_COLORS: Record<SubscriptionPlan, string> = {
  free: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  enterprise: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

const SUBSCRIPTION_ICONS: Record<SubscriptionPlan, React.ComponentType<any>> = {
  free: Package,
  basic: Layout,
  premium: Crown,
  enterprise: Star
};

export default function TemplateManagementPage() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<AvailableTemplatesData | null>(null);
  const [templateType, setTemplateType] = useState<'home' | 'page'>('home');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [configTemplate, setConfigTemplate] = useState<Template | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // Vérification des permissions admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !['admin', 'super_admin'].includes(session.user?.role || '')) {
      window.location.href = '/dashboard/unauthorized';
      return;
    }
    
    fetchStores();
  }, [session, status]);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stores');
      if (!response.ok) throw new Error('Erreur lors du chargement des stores');
        const data = await response.json();
      setStores(data.stores || []);
    } catch (error: unknown) {
      console.error('Erreur:', error);
      setError('Impossible de charger les boutiques');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplatesForStore = async (storeId: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/templates/accessible?storeId=${storeId}&type=${templateType}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des templates');
      
      const data = await response.json();
      setAvailableTemplates(data.data);
    } catch (error: unknown) {
      console.error('Erreur:', error);
      setError('Impossible de charger les templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreSelect = (store: Store): void => {
    setSelectedStore(store);
    fetchTemplatesForStore(store._id);
  };

  const handleTemplateView = (templateId: string): void => {
    const template = availableTemplates?.templates?.find((t: Template) => t.id === templateId);
    if (template) {
      setPreviewTemplate(template);
      setIsPreviewOpen(true);
    }
  };

  const handleTemplateConfig = (templateId: string): void => {
    const template = availableTemplates?.templates?.find((t: Template) => t.id === templateId);
    if (template) {
      setConfigTemplate(template);
      setIsConfigOpen(true);
    }
  };

  const handleTemplateSelect = async (templateId: string): Promise<void> => {
    if (!selectedStore) return;

    // Confirmation avant sélection
    if (!confirm('Voulez-vous vraiment sélectionner ce template pour cette boutique ?')) {
      return;
    }

    // Check if template is accessible before making the request (sauf pour les admins)
    const template = availableTemplates?.templates?.find((t: Template) => t.id === templateId);
    const storePlan = selectedStore.subscription?.plan || 'free';
    const isAdmin = ['admin', 'super_admin'].includes(session?.user?.role || '');
    
    // Les admins ont accès à tous les templates
    if (!isAdmin && template && template.subscriptionTier) {
      const tierHierarchy = {
        'free': ['free'],
        'basic': ['free', 'basic'],
        'premium': ['free', 'basic', 'premium'],
        'enterprise': ['free', 'basic', 'premium', 'enterprise']
      };
      
      const accessibleTiers = tierHierarchy[storePlan as keyof typeof tierHierarchy] || ['free'];
      
      if (!accessibleTiers.includes(template.subscriptionTier)) {
        setError(`Ce template nécessite un abonnement ${template.subscriptionTier}. Votre boutique a un plan ${storePlan}.`);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/templates/accessible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: selectedStore._id,
          templateId,
          type: templateType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setError(`Template non accessible: ${errorData.error}. Veuillez upgrader votre abonnement ou choisir un template compatible.`);
        } else {
          throw new Error(errorData.error || 'Erreur lors de la sélection du template');
        }
        return;
      }

      const data = await response.json();
      
      // Mettre à jour le store sélectionné avec les données complètes retournées
      setSelectedStore(data.data.store);

      // Recharger les templates pour refléter les changements
      fetchTemplatesForStore(selectedStore._id);
      
      alert('Template mis à jour avec succès !');
    } catch (error: unknown) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeSubscription = async (storeId: string, newPlan: SubscriptionPlan): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stores/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          plan: newPlan
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'abonnement');

      alert('Abonnement mis à jour avec succès !');
      fetchStores();
      if (selectedStore?._id === storeId) {
        fetchTemplatesForStore(storeId);
      }
    } catch (error: unknown) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const filteredStores = stores.filter((store: Store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = availableTemplates?.templates?.filter((template: Template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Templates</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Gérez les templates et abonnements des boutiques
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {typeof error === 'string' ? error : 'Erreur de chargement des données'}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Liste des stores */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Boutiques ({filteredStores.length})</span>
              </CardTitle>
            </CardHeader>            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStores.map((store) => {
                const subscriptionPlan = (store.subscription?.plan || 'free') as SubscriptionPlan;
                const SubscriptionIcon = SUBSCRIPTION_ICONS[subscriptionPlan];
                return (
                  <div
                    key={store._id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedStore?._id === store._id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleStoreSelect(store)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium truncate">{typeof store.name === 'string' ? store.name : 'Boutique sans nom'}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {store.owner?.email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={`text-xs ${SUBSCRIPTION_COLORS[subscriptionPlan]}`}>
                          <SubscriptionIcon className="h-3 w-3 mr-1" />
                          {store.subscription?.plan || 'free'}
                        </Badge>
                        {store.design?.selectedTemplate && (
                          <span className="text-xs text-gray-400">
                            {typeof store.design.selectedTemplate === 'object' && store.design.selectedTemplate.name 
                              ? store.design.selectedTemplate.name 
                              : 'Template sélectionné'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Templates disponibles */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Layout className="h-5 w-5" />
                  <span>Templates Disponibles</span>
                </CardTitle>                <div className="flex items-center space-x-2">
                  <Select value={templateType} onValueChange={(value: string) => setTemplateType(value as 'home' | 'page')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Homepage</SelectItem>
                      <SelectItem value="page">Pages</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedStore && (
                    <Select
                      value={selectedStore.subscription?.plan || 'free'}
                      onValueChange={(newPlan: string) => upgradeSubscription(selectedStore._id, newPlan as SubscriptionPlan)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedStore ? (
                <div className="text-center py-12 text-gray-500">
                  <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez une boutique pour voir les templates disponibles</p>
                </div>
              ) : (
                <div className="space-y-4">                  {/* Informations abonnement */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{typeof selectedStore.name === 'string' ? selectedStore.name : 'Boutique sans nom'}</h3>
                        <p className="text-sm text-gray-500">
                          Abonnement: {availableTemplates?.subscription?.plan || 'free'}
                        </p>
                      </div>
                      <Badge className={`${SUBSCRIPTION_COLORS[(availableTemplates?.subscription?.plan || 'free') as SubscriptionPlan]}`}>
                        {filteredTemplates.length} templates disponibles
                      </Badge>
                    </div>
                  </div>

                  {/* Affichage des erreurs */}
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="text-red-600 dark:text-red-400">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Erreur de sélection</h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grille des templates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template: Template) => {
                      const isSelected = templateType === 'home' 
                        ? selectedStore.design?.selectedTemplate?.id === template.id
                        : selectedStore.design?.additionalPages?.some((page: AdditionalPage) => page.id === template.id);

                      // Check if template is accessible (sauf pour les admins)
                      const storePlan = selectedStore.subscription?.plan || 'free';
                      const isAdmin = ['admin', 'super_admin'].includes(session?.user?.role || '');
                      const tierHierarchy = {
                        'free': ['free'],
                        'basic': ['free', 'basic'],
                        'premium': ['free', 'basic', 'premium'],
                        'enterprise': ['free', 'basic', 'premium', 'enterprise']
                      };
                      const accessibleTiers = tierHierarchy[storePlan as keyof typeof tierHierarchy] || ['free'];
                      // Les admins ont accès à tous les templates
                      const isAccessible = isAdmin || !template.subscriptionTier || accessibleTiers.includes(template.subscriptionTier);

                      return (
                        <div
                          key={template.id}
                          className={`p-4 rounded-lg border transition-all ${
                            !isAccessible 
                              ? 'opacity-60 border-gray-300 dark:border-gray-600'
                              : isSelected
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{typeof template.name === 'string' ? template.name : 'Template sans nom'}</h4>
                              {!isAccessible && (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {typeof template.description === 'string' ? template.description : 'Description non disponible'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {typeof template.category === 'string' ? template.category : 'Catégorie inconnue'}
                              </Badge>
                              {template.subscriptionTier && (
                                <Badge 
                                  variant={isAccessible ? "default" : "destructive"}
                                  className={`text-xs ${
                                    template.subscriptionTier === 'free' ? 'bg-green-100 text-green-800' :
                                    template.subscriptionTier === 'basic' ? 'bg-blue-100 text-blue-800' :
                                    template.subscriptionTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {template.subscriptionTier}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {template.features?.length || 0} fonctionnalités
                            </div>
                          </div>
                          {!isAccessible && (
                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
                              Nécessite un abonnement {template.subscriptionTier}. 
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  upgradeSubscription(selectedStore._id, template.subscriptionTier as SubscriptionPlan);
                                }}
                                className="underline hover:no-underline"
                              >
                                Upgrader maintenant
                              </button>
                            </div>
                          )}
                          {template.features && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {template.features.slice(0, 2).map((feature: any, index: number) => (
                                <span
                                  key={index}
                                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                                >
                                  {typeof feature === 'string' ? feature : (typeof feature === 'object' && feature?.name ? feature.name : 'Fonctionnalité')}
                                </span>
                              ))}
                              {template.features.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{template.features.length - 2} autres
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Boutons d'action */}
                          <div className="mt-4 flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTemplateView(template.id)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Visualiser
                            </Button>
                            {/* Bouton Configurer pour tous les templates modulaires */}
                            {isAccessible && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTemplateConfig(template.id)}
                                className="flex-1"
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Configurer
                              </Button>
                            )}
                            {isAccessible && (
                              <Button
                                variant={isSelected ? "secondary" : "default"}
                                size="sm"
                                onClick={() => handleTemplateSelect(template.id)}
                                className="flex-1"
                                disabled={isSelected}
                              >
                                {isSelected ? 'Sélectionné' : 'Sélectionner'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun template accessible avec l'abonnement actuel</p>
                      <p className="text-sm mt-1">Mettez à niveau l'abonnement pour débloquer plus de templates</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Prévisualisation - {previewTemplate?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-6">
              {/* Informations du template */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informations</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom:</strong> {previewTemplate.name}</div>
                    <div><strong>Catégorie:</strong> {previewTemplate.category}</div>
                    <div><strong>Description:</strong> {previewTemplate.description}</div>
                    {previewTemplate.subscriptionTier && (
                      <div>
                        <strong>Abonnement requis:</strong> 
                        <Badge className={`ml-2 ${
                          previewTemplate.subscriptionTier === 'free' ? 'bg-green-100 text-green-800' :
                          previewTemplate.subscriptionTier === 'basic' ? 'bg-blue-100 text-blue-800' :
                          previewTemplate.subscriptionTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {previewTemplate.subscriptionTier}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Fonctionnalités</h3>
                  <div className="space-y-1">
                    {previewTemplate.features && previewTemplate.features.length > 0 ? (
                      previewTemplate.features.map((feature: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>
                            {typeof feature === 'string' ? feature : 
                             (typeof feature === 'object' && feature?.name ? feature.name : 'Fonctionnalité')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Aucune fonctionnalité spécifiée</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Aperçu du template */}
              <div>
                <h3 className="font-semibold mb-2">Aperçu</h3>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  {previewTemplate.preview ? (
                    <img 
                      src={previewTemplate.preview} 
                      alt={`Aperçu de ${previewTemplate.name}`}
                      className="w-full h-64 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Layout className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aperçu non disponible</p>
                        <p className="text-sm">Template: {previewTemplate.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Fermer
                </Button>
                {selectedStore && (
                  <Button 
                    onClick={() => {
                      setIsPreviewOpen(false);
                      handleTemplateSelect(previewTemplate.id);
                    }}
                    disabled={!availableTemplates?.templates?.find(t => t.id === previewTemplate.id)}
                  >
                    Sélectionner ce template
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de configuration de template */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuration - {configTemplate?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {configTemplate && selectedStore && (
            <TemplateConfigEditor
              templateId={configTemplate.id}
              storeId={selectedStore._id}
              isGlobal={false}
              onSave={(config) => {
                console.log('Configuration sauvegardée:', config);
                setIsConfigOpen(false);
                // Recharger les templates si nécessaire
                fetchTemplatesForStore(selectedStore._id);
              }}
              onCancel={() => setIsConfigOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
