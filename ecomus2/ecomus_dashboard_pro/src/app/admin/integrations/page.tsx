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
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "pending";
  category: string;
  features: string[];
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  status: "active" | "inactive";
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  lastTriggered?: string;
  successRate: number;
}

// Mock data
const mockIntegrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Traitement des paiements en ligne sécurisé",
    icon: <CreditCard className="h-6 w-6" />,
    status: "connected",
    category: "Paiement",
    features: ["Paiements", "Abonnements", "Facturation"]
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Solution de paiement mondiale",
    icon: <Globe className="h-6 w-6" />,
    status: "disconnected",
    category: "Paiement",
    features: ["Paiements", "Portefeuille numérique"]
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Synchronisation avec Shopify",
    icon: <Database className="h-6 w-6" />,
    status: "connected",
    category: "E-commerce",
    features: ["Produits", "Commandes", "Inventaire"]
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Marketing par email automatisé",
    icon: <Mail className="h-6 w-6" />,
    status: "pending",
    category: "Marketing",
    features: ["Email", "Automation", "Analytics"]
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Analyse du trafic et des conversions",
    icon: <BarChart3 className="h-6 w-6" />,
    status: "connected",
    category: "Analytics",
    features: ["Tracking", "Rapports", "Conversions"]
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automatisation des workflows",
    icon: <Zap className="h-6 w-6" />,
    status: "disconnected",
    category: "Automation",
    features: ["Workflows", "Intégrations", "Triggers"]
  }
];

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production API",
    key: "pk_live_51H...",
    permissions: ["read", "write"],
    createdAt: "2024-01-15",
    lastUsed: "2024-01-20",
    status: "active"
  },
  {
    id: "2",
    name: "Development API",
    key: "pk_test_51H...",
    permissions: ["read"],
    createdAt: "2024-01-10",
    lastUsed: "2024-01-19",
    status: "active"
  },
  {
    id: "3",
    name: "Analytics API",
    key: "ak_analytics_...",
    permissions: ["read"],
    createdAt: "2024-01-05",
    status: "inactive"
  }
];

const mockWebhooks: Webhook[] = [
  {
    id: "1",
    name: "Order Created",
    url: "https://api.example.com/webhooks/orders",
    events: ["order.created", "order.updated"],
    status: "active",
    lastTriggered: "2024-01-20T10:30:00Z",
    successRate: 98.5
  },
  {
    id: "2",
    name: "Payment Webhook",
    url: "https://api.example.com/webhooks/payments",
    events: ["payment.succeeded", "payment.failed"],
    status: "active",
    lastTriggered: "2024-01-20T09:15:00Z",
    successRate: 99.2
  },
  {
    id: "3",
    name: "User Registration",
    url: "https://api.example.com/webhooks/users",
    events: ["user.created"],
    status: "inactive",
    successRate: 95.8
  }
];

export default function AdminIntegrationsPage() {
  const { data: session } = useSession();
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: "", permissions: [] as string[] });
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] as string[] });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "disconnected":
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "disconnected":
      case "inactive":
        return <AlertCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers");
  };

  const handleAddApiKey = () => {
    if (!newApiKey.name) {
      toast.error("Le nom de la clé API est requis");
      return;
    }

    const apiKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      key: `ak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      permissions: newApiKey.permissions,
      createdAt: new Date().toISOString().split('T')[0],
      status: "active"
    };

    setApiKeys(prev => [...prev, apiKey]);
    setNewApiKey({ name: "", permissions: [] });
    setIsAddingApiKey(false);
    toast.success("Clé API créée avec succès");
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Le nom et l'URL du webhook sont requis");
      return;
    }

    const webhook: Webhook = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: "active",
      successRate: 100
    };

    setWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ name: "", url: "", events: [] });
    setIsAddingWebhook(false);
    toast.success("Webhook créé avec succès");
  };

  const deleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    toast.success("Clé API supprimée");
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
    toast.success("Webhook supprimé");
  };

  const toggleIntegrationStatus = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        const newStatus = integration.status === "connected" ? "disconnected" : "connected";
        return { ...integration, status: newStatus };
      }
      return integration;
    }));
    toast.success("Statut de l'intégration mis à jour");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intégrations API</h1>
          <p className="text-muted-foreground">
            Gérez vos intégrations, clés API et webhooks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin Panel
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Intégrations</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connectées</p>
                <p className="text-2xl font-bold">
                  {integrations.filter(i => i.status === "connected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clés API</p>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Webhook className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Webhooks</p>
                <p className="text-2xl font-bold">{webhooks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Intégrations Populaires</TabsTrigger>
          <TabsTrigger value="api-keys">Clés API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intégrations Populaires</CardTitle>
              <p className="text-sm text-muted-foreground">
                Connectez votre application aux services tiers populaires
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => (
                  <Card key={integration.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            {integration.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold">{integration.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {integration.category}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(integration.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(integration.status)}
                            {integration.status}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 mb-4">
                        {integration.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {integration.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() => toggleIntegrationStatus(integration.id)}
                        variant={integration.status === "connected" ? "destructive" : "default"}
                        size="sm"
                        className="w-full"
                      >
                        {integration.status === "connected" ? "Déconnecter" : "Connecter"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Clés API</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Gérez vos clés d'accès API
                  </p>
                </div>
                <Dialog open={isAddingApiKey} onOpenChange={setIsAddingApiKey}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle clé API
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une nouvelle clé API</DialogTitle>
                      <DialogDescription>
                        Créez une nouvelle clé API pour accéder à vos données
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="api-name">Nom de la clé</Label>
                        <Input
                          id="api-name"
                          value={newApiKey.name}
                          onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Production API"
                        />
                      </div>
                      <div>
                        <Label>Permissions</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["read", "write", "delete"].map((permission) => (
                            <Button
                              key={permission}
                              variant={newApiKey.permissions.includes(permission) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setNewApiKey(prev => ({
                                  ...prev,
                                  permissions: prev.permissions.includes(permission)
                                    ? prev.permissions.filter(p => p !== permission)
                                    : [...prev.permissions, permission]
                                }));
                              }}
                            >
                              {permission}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingApiKey(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddApiKey}>
                        Créer la clé
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{apiKey.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Créée le {apiKey.createdAt}</span>
                            {apiKey.lastUsed && (
                              <span>• Dernière utilisation: {apiKey.lastUsed}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                            {showApiKey[apiKey.id] ? apiKey.key : "••••••••••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleApiKeyVisibility(apiKey.id)}
                          >
                            {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <Badge className={getStatusColor(apiKey.status)}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {apiKey.permissions.map((permission, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteApiKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configurez des webhooks pour recevoir des notifications en temps réel
                  </p>
                </div>
                <Dialog open={isAddingWebhook} onOpenChange={setIsAddingWebhook}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau webhook</DialogTitle>
                      <DialogDescription>
                        Configurez un webhook pour recevoir des notifications d'événements
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="webhook-name">Nom du webhook</Label>
                        <Input
                          id="webhook-name"
                          value={newWebhook.name}
                          onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Order Notifications"
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhook-url">URL du webhook</Label>
                        <Input
                          id="webhook-url"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://api.example.com/webhooks"
                        />
                      </div>
                      <div>
                        <Label>Événements</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["order.created", "order.updated", "payment.succeeded", "user.created"].map((event) => (
                            <Button
                              key={event}
                              variant={newWebhook.events.includes(event) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setNewWebhook(prev => ({
                                  ...prev,
                                  events: prev.events.includes(event)
                                    ? prev.events.filter(e => e !== event)
                                    : [...prev.events, event]
                                }));
                              }}
                            >
                              {event}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingWebhook(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddWebhook}>
                        Créer le webhook
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{webhook.name}</h4>
                          <p className="text-sm text-muted-foreground">{webhook.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className={getStatusColor(webhook.status)}>
                          {webhook.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Taux de succès: {webhook.successRate}%
                        </span>
                        {webhook.lastTriggered && (
                          <span className="text-sm text-muted-foreground">
                            Dernier déclenchement: {new Date(webhook.lastTriggered).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {webhook.events.map((event, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}