"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Settings,
  Key,
  Globe,
  Webhook,
  Database,
  Mail,
  CreditCard,
  BarChart3,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// Types pour les intégrations
interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  icon: React.ReactNode;
  color: string;
  isConfigured: boolean;
  lastSync?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  status: 'active' | 'inactive';
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  lastTriggered?: string;
}

// Données mock pour les intégrations populaires
const popularIntegrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Acceptez les paiements en ligne avec Stripe',
    category: 'payment',
    status: 'active',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'bg-purple-500',
    isConfigured: true,
    lastSync: '2024-01-15T10:30:00Z'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Intégration PayPal pour les paiements',
    category: 'payment',
    status: 'inactive',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'bg-blue-500',
    isConfigured: false
  },
  {
    id: 'mailchimp',
    name: 'MailChimp',
    description: 'Synchronisez vos contacts avec MailChimp',
    category: 'marketing',
    status: 'active',
    icon: <Mail className="h-6 w-6" />,
    color: 'bg-yellow-500',
    isConfigured: true,
    lastSync: '2024-01-15T09:15:00Z'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Suivez vos performances avec Google Analytics',
    category: 'analytics',
    status: 'pending',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'bg-green-500',
    isConfigured: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automatisez vos workflows avec Zapier',
    category: 'automation',
    status: 'inactive',
    icon: <Settings className="h-6 w-6" />,
    color: 'bg-orange-500',
    isConfigured: false
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    description: 'Gestion et optimisation des médias',
    category: 'media',
    status: 'active',
    icon: <Database className="h-6 w-6" />,
    color: 'bg-indigo-500',
    isConfigured: true,
    lastSync: '2024-01-15T11:45:00Z'
  }
];

// Données mock pour les clés API
const mockApiKeys: ApiKey[] = [
  {
    id: 'api-1',
    name: 'Production API Key',
    key: 'pk_live_51H...***',
    permissions: ['read', 'write'],
    createdAt: '2024-01-10T10:00:00Z',
    lastUsed: '2024-01-15T14:30:00Z',
    status: 'active'
  },
  {
    id: 'api-2',
    name: 'Test API Key',
    key: 'pk_test_51H...***',
    permissions: ['read'],
    createdAt: '2024-01-12T15:20:00Z',
    lastUsed: '2024-01-14T09:15:00Z',
    status: 'active'
  }
];

// Données mock pour les webhooks
const mockWebhooks: Webhook[] = [
  {
    id: 'webhook-1',
    name: 'Order Created',
    url: 'https://api.example.com/webhooks/order-created',
    events: ['order.created', 'order.updated'],
    status: 'active',
    createdAt: '2024-01-10T10:00:00Z',
    lastTriggered: '2024-01-15T12:30:00Z'
  },
  {
    id: 'webhook-2',
    name: 'Payment Confirmed',
    url: 'https://api.example.com/webhooks/payment-confirmed',
    events: ['payment.succeeded'],
    status: 'active',
    createdAt: '2024-01-12T14:15:00Z',
    lastTriggered: '2024-01-15T11:20:00Z'
  }
];

export default function IntegrationsPage() {
  const { data: session } = useSession();
  const [integrations, setIntegrations] = useState<Integration[]>(popularIntegrations);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [isAddingApi, setIsAddingApi] = useState(false);
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Formulaires
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[]
  });

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });

  const categories = [
    { value: 'all', label: 'Toutes' },
    { value: 'payment', label: 'Paiement' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'automation', label: 'Automation' },
    { value: 'media', label: 'Médias' }
  ];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const handleConfigureIntegration = (integrationId: string) => {
    // Simuler la configuration
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'active', isConfigured: true, lastSync: new Date().toISOString() }
        : integration
    ));
    toast.success('Intégration configurée avec succès!');
  };

  const handleCreateApiKey = () => {
    if (!newApiKey.name) {
      toast.error('Veuillez saisir un nom pour la clé API');
      return;
    }

    const apiKey: ApiKey = {
      id: `api-${Date.now()}`,
      name: newApiKey.name,
      key: `pk_live_${Math.random().toString(36).substring(2, 15)}...`,
      permissions: newApiKey.permissions,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setApiKeys(prev => [...prev, apiKey]);
    setNewApiKey({ name: '', permissions: [] });
    setIsAddingApi(false);
    toast.success('Clé API créée avec succès!');
  };

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    const webhook: Webhook = {
      id: `webhook-${Date.now()}`,
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    setIsAddingWebhook(false);
    toast.success('Webhook créé avec succès!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'En attente'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Intégrations API
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez vos intégrations, clés API et webhooks
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Intégrations Populaires</TabsTrigger>
          <TabsTrigger value="api-keys">Clés API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Intégrations Populaires */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Filtres */}
          <div className="flex items-center space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grille des intégrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${integration.color} text-white`}>
                        {integration.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                    {getStatusBadge(integration.status)}
                  </div>
                  
                  {integration.lastSync && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dernière sync:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(integration.lastSync).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    {integration.isConfigured ? (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurer
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConfigureIntegration(integration.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Configurer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Clés API */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Clés API
            </h2>
            <Dialog open={isAddingApi} onOpenChange={setIsAddingApi}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Clé API
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle clé API</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle clé API pour accéder à vos données.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-name">Nom de la clé</Label>
                    <Input
                      id="api-name"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Production API Key"
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="space-y-2 mt-2">
                      {['read', 'write', 'delete'].map((permission) => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newApiKey.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewApiKey(prev => ({
                                  ...prev,
                                  permissions: [...prev.permissions, permission]
                                }));
                              } else {
                                setNewApiKey(prev => ({
                                  ...prev,
                                  permissions: prev.permissions.filter(p => p !== permission)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingApi(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateApiKey}>
                    Créer la clé
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {apiKey.name}
                        </h3>
                        {getStatusBadge(apiKey.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Créée le {new Date(apiKey.createdAt).toLocaleDateString('fr-FR')}</span>
                        {apiKey.lastUsed && (
                          <span>Dernière utilisation: {new Date(apiKey.lastUsed).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                          {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                        >
                          {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex space-x-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Webhooks
            </h2>
            <Dialog open={isAddingWebhook} onOpenChange={setIsAddingWebhook}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau webhook</DialogTitle>
                  <DialogDescription>
                    Configurez un webhook pour recevoir des notifications en temps réel.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-name">Nom du webhook</Label>
                    <Input
                      id="webhook-name"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Order Created"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">URL du webhook</Label>
                    <Input
                      id="webhook-url"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://api.example.com/webhooks/..."
                    />
                  </div>
                  <div>
                    <Label>Événements</Label>
                    <div className="space-y-2 mt-2">
                      {['order.created', 'order.updated', 'payment.succeeded', 'product.created'].map((event) => (
                        <label key={event} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newWebhook.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook(prev => ({
                                  ...prev,
                                  events: [...prev.events, event]
                                }));
                              } else {
                                setNewWebhook(prev => ({
                                  ...prev,
                                  events: prev.events.filter(e => e !== event)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingWebhook(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateWebhook}>
                    Créer le webhook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Webhook className="h-5 w-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {webhook.name}
                        </h3>
                        {getStatusBadge(webhook.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Créé le {new Date(webhook.createdAt).toLocaleDateString('fr-FR')}</span>
                        {webhook.lastTriggered && (
                          <span>Dernier déclenchement: {new Date(webhook.lastTriggered).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                          {webhook.url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex space-x-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}