"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Globe,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Zap,
  Database,
  Cloud,
  Lock,
  Play,
  Unlock,
  Unplug,
  Plug,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Server,
  Webhook,
  Code,
  Terminal,
  FileText,
  Link,
  ExternalLink,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { GlassMorphismCard } from "@/components/ui/glass-morphism-card";
import { StatCard } from "@/components/ui/stat-card";
import { ModernChart } from "@/components/ui/modern-chart";
import { DataTable } from "@/components/ui/data-table";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  description?: string;
  permissions: string[];
  status: "active" | "inactive" | "revoked" | "expired";
  environment?: "production" | "staging" | "development";
  expiresIn?: string;
  rateLimit: {
    requests: number;
    period: "minute" | "hour" | "day";
    current: number;
  };
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastUsed?: Date;
  };
  restrictions: {
    ipWhitelist?: string[];
    domains?: string[];
    methods?: string[];
  };
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failed";
  secret?: string;
  headers?: Record<string, string>;
  description?: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  lastDelivery?: {
    timestamp: Date;
    status: "success" | "failed";
    responseCode?: number;
    responseTime?: number;
  };
  statistics: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Integration {
  id: string;
  name: string;
  type:
    | "payment"
    | "shipping"
    | "analytics"
    | "marketing"
    | "inventory"
    | "crm"
    | "other";
  provider: string;
  status: "connected" | "disconnected" | "error" | "pending";
  description?: string;
  version?: string;
  lastSync?: Date;
  config: Record<string, string | number | boolean | string[]>;
  credentials: {
    encrypted: boolean;
    lastUpdated: Date;
  };
  healthCheck: {
    lastCheck: Date;
    status: "healthy" | "unhealthy" | "unknown";
    responseTime?: number;
    errorMessage?: string;
  };
  usage: {
    requestsToday: number;
    requestsThisMonth: number;
    errorRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

function ApiManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API",
      key: "pk_live_51234567890abcdef",
      description: "Clé API principale pour l'environnement de production",
      permissions: ["read", "write", "delete"],
      status: "active",
      rateLimit: {
        requests: 1000,
        period: "hour",
        current: 245,
      },
      usage: {
        totalRequests: 15420,
        successfulRequests: 15180,
        failedRequests: 240,
        lastUsed: new Date("2024-01-22T14:30:00"),
      },
      restrictions: {
        ipWhitelist: ["192.168.1.100", "10.0.0.50"],
        domains: ["mystore.com", "api.mystore.com"],
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
      createdAt: new Date("2023-01-15T10:00:00"),
      updatedAt: new Date("2024-01-22T14:30:00"),
      createdBy: "admin@example.com",
    },
    {
      id: "2",
      name: "Development API",
      key: "pk_test_51234567890abcdef",
      description: "Clé API pour l'environnement de développement",
      permissions: ["read", "write"],
      status: "active",
      rateLimit: {
        requests: 100,
        period: "hour",
        current: 12,
      },
      usage: {
        totalRequests: 2340,
        successfulRequests: 2280,
        failedRequests: 60,
        lastUsed: new Date("2024-01-22T12:15:00"),
      },
      restrictions: {
        ipWhitelist: ["127.0.0.1", "192.168.1.0/24"],
        methods: ["GET", "POST", "PUT"],
      },
      expiresAt: new Date("2024-12-31T23:59:59"),
      createdAt: new Date("2023-06-10T14:20:00"),
      updatedAt: new Date("2024-01-22T12:15:00"),
      createdBy: "dev@example.com",
    },
    {
      id: "3",
      name: "Mobile App API",
      key: "pk_mobile_51234567890abcdef",
      description: "Clé API dédiée à l'application mobile",
      permissions: ["read"],
      status: "active",
      rateLimit: {
        requests: 500,
        period: "hour",
        current: 89,
      },
      usage: {
        totalRequests: 8750,
        successfulRequests: 8650,
        failedRequests: 100,
        lastUsed: new Date("2024-01-22T13:45:00"),
      },
      restrictions: {
        methods: ["GET"],
      },
      createdAt: new Date("2023-09-20T16:30:00"),
      updatedAt: new Date("2024-01-22T13:45:00"),
      createdBy: "mobile@example.com",
    },
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "1",
      name: "Order Notifications",
      url: "https://api.partner.com/webhooks/orders",
      events: ["order.created", "order.updated", "order.cancelled"],
      status: "active",
      secret: "whsec_1234567890abcdef",
      method: "POST",
      headers: {
        Authorization: "Bearer token123",
        "Content-Type": "application/json",
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
      },
      lastDelivery: {
        timestamp: new Date("2024-01-22T14:25:00"),
        status: "success",
        responseCode: 200,
        responseTime: 150,
      },
      statistics: {
        totalDeliveries: 1250,
        successfulDeliveries: 1220,
        failedDeliveries: 30,
        averageResponseTime: 180,
      },
      createdAt: new Date("2023-03-15T09:00:00"),
      updatedAt: new Date("2024-01-22T14:25:00"),
    },
    {
      id: "2",
      name: "Payment Updates",
      url: "https://payments.mystore.com/webhook",
      events: ["payment.succeeded", "payment.failed", "payment.refunded"],
      status: "active",
      secret: "whsec_abcdef1234567890",
      method: "POST",
      retryPolicy: {
        maxRetries: 5,
        backoffMultiplier: 1.5,
      },
      lastDelivery: {
        timestamp: new Date("2024-01-22T14:20:00"),
        status: "success",
        responseCode: 200,
        responseTime: 95,
      },
      statistics: {
        totalDeliveries: 890,
        successfulDeliveries: 875,
        failedDeliveries: 15,
        averageResponseTime: 120,
      },
      createdAt: new Date("2023-05-20T11:30:00"),
      updatedAt: new Date("2024-01-22T14:20:00"),
    },
    {
      id: "3",
      name: "Inventory Sync",
      url: "https://inventory.warehouse.com/sync",
      events: ["product.updated", "inventory.low", "inventory.out_of_stock"],
      status: "failed",
      method: "POST",
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
      },
      lastDelivery: {
        timestamp: new Date("2024-01-22T13:50:00"),
        status: "failed",
        responseCode: 500,
        responseTime: 5000,
      },
      statistics: {
        totalDeliveries: 450,
        successfulDeliveries: 420,
        failedDeliveries: 30,
        averageResponseTime: 250,
      },
      createdAt: new Date("2023-08-10T15:45:00"),
      updatedAt: new Date("2024-01-22T13:50:00"),
    },
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Stripe Payment Gateway",
      type: "payment",
      provider: "Stripe",
      status: "connected",
      config: {
        publishableKey: "pk_live_***",
        webhookEndpoint: "https://api.mystore.com/stripe/webhook",
      },
      credentials: {
        encrypted: true,
        lastUpdated: new Date("2024-01-15T10:00:00"),
      },
      healthCheck: {
        lastCheck: new Date("2024-01-22T14:30:00"),
        status: "healthy",
        responseTime: 120,
      },
      usage: {
        requestsToday: 450,
        requestsThisMonth: 12500,
        errorRate: 0.02,
      },
      createdAt: new Date("2023-01-10T09:00:00"),
      updatedAt: new Date("2024-01-22T14:30:00"),
    },
    {
      id: "2",
      name: "SendGrid Email Service",
      type: "marketing",
      provider: "SendGrid",
      status: "connected",
      config: {
        fromEmail: "noreply@mystore.com",
        templates: ["welcome", "order_confirmation", "password_reset"],
      },
      credentials: {
        encrypted: true,
        lastUpdated: new Date("2024-01-10T15:30:00"),
      },
      healthCheck: {
        lastCheck: new Date("2024-01-22T14:25:00"),
        status: "healthy",
        responseTime: 85,
      },
      usage: {
        requestsToday: 125,
        requestsThisMonth: 3200,
        errorRate: 0.01,
      },
      createdAt: new Date("2023-02-20T11:15:00"),
      updatedAt: new Date("2024-01-22T14:25:00"),
    },
    {
      id: "3",
      name: "Google Analytics",
      type: "analytics",
      provider: "Google",
      status: "connected",
      config: {
        trackingId: "GA-123456789",
        enhancedEcommerce: true,
      },
      credentials: {
        encrypted: true,
        lastUpdated: new Date("2023-12-05T14:20:00"),
      },
      healthCheck: {
        lastCheck: new Date("2024-01-22T14:20:00"),
        status: "healthy",
        responseTime: 200,
      },
      usage: {
        requestsToday: 2500,
        requestsThisMonth: 75000,
        errorRate: 0.005,
      },
      createdAt: new Date("2023-01-25T16:45:00"),
      updatedAt: new Date("2024-01-22T14:20:00"),
    },
    {
      id: "4",
      name: "Warehouse Management System",
      type: "inventory",
      provider: "Custom",
      status: "error",
      config: {
        endpoint: "https://wms.warehouse.com/api",
        syncInterval: "15min",
      },
      credentials: {
        encrypted: true,
        lastUpdated: new Date("2024-01-20T09:30:00"),
      },
      healthCheck: {
        lastCheck: new Date("2024-01-22T14:15:00"),
        status: "unhealthy",
        responseTime: 5000,
        errorMessage: "Connection timeout",
      },
      usage: {
        requestsToday: 0,
        requestsThisMonth: 1200,
        errorRate: 0.15,
      },
      createdAt: new Date("2023-06-15T13:20:00"),
      updatedAt: new Date("2024-01-22T14:15:00"),
    },
  ]);

  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const [isCreateApiKeyModalOpen, setIsCreateApiKeyModalOpen] = useState(false);
  const [isCreateWebhookModalOpen, setIsCreateWebhookModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState<Partial<ApiKey>>({
    permissions: [],
    status: "active",
    rateLimit: {
      requests: 100,
      period: "hour",
      current: 0,
    },
  });
  const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
    events: [],
    status: "active",
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
    },
  });

  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "active", label: "Actif", color: "green" },
    { value: "inactive", label: "Inactif", color: "gray" },
    { value: "failed", label: "Échec", color: "red" },
    { value: "error", label: "Erreur", color: "red" },
    { value: "revoked", label: "Révoqué", color: "red" },
    { value: "expired", label: "Expiré", color: "yellow" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "connected":
      case "healthy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
      case "disconnected":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "failed":
      case "error":
      case "revoked":
      case "unhealthy":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "expired":
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "connected":
      case "healthy":
        return CheckCircle;
      case "inactive":
      case "disconnected":
        return Clock;
      case "failed":
      case "error":
      case "revoked":
      case "unhealthy":
        return XCircle;
      case "expired":
      case "pending":
        return AlertTriangle;
      default:
        return Clock;
    }
  };



  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + "***" + key.substring(key.length - 4);
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCreateApiKey = () => {
    const apiKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKey.name || "",
      key: `pk_${newApiKey.name?.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
      description: newApiKey.description,
      permissions: newApiKey.permissions || [],
      status: "active",
      rateLimit: newApiKey.rateLimit || {
        requests: 100,
        period: "hour",
        current: 0,
      },
      usage: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
      },
      restrictions: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "admin@example.com",
    };

    setApiKeys([apiKey, ...apiKeys]);
    setNewApiKey({
      permissions: [],
      status: "active",
      rateLimit: {
        requests: 100,
        period: "hour",
        current: 0,
      },
    });
    setIsCreateApiKeyModalOpen(false);
  };

  const handleCreateWebhook = () => {
    const webhook: Webhook = {
      id: Date.now().toString(),
      name: newWebhook.name || "",
      url: newWebhook.url || "",
      events: newWebhook.events || [],
      status: "active",
      method: newWebhook.method || "POST",
      retryPolicy: newWebhook.retryPolicy || {
        maxRetries: 3,
        backoffMultiplier: 2,
      },
      statistics: {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        averageResponseTime: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWebhooks([webhook, ...webhooks]);
    setNewWebhook({
      events: [],
      status: "active",
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
      },
    });
    setIsCreateWebhookModalOpen(false);
  };

  const handleRevokeApiKey = (keyId: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === keyId
          ? { ...key, status: "revoked", updatedAt: new Date() }
          : key
      )
    );
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId));
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter((webhook) => webhook.id !== webhookId));
  };

  const handleTestWebhook = async (webhookId: string) => {
    // Simulation d'un test de webhook
    const webhook = webhooks.find((w) => w.id === webhookId);
    if (webhook) {
      // Mise à jour simulée du statut
      setWebhooks(
        webhooks.map((w) =>
          w.id === webhookId
            ? {
                ...w,
                lastDelivery: {
                  timestamp: new Date(),
                  status: "success",
                  responseCode: 200,
                  responseTime: Math.floor(Math.random() * 300) + 50,
                },
                updatedAt: new Date(),
              }
            : w
        )
      );
    }
  };

  const getApiStats = () => {
    const totalKeys = apiKeys.length;
    const activeKeys = apiKeys.filter((k) => k.status === "active").length;
    const totalRequests = apiKeys.reduce(
      (sum, key) => sum + key.usage.totalRequests,
      0
    );
    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter((w) => w.status === "active").length;
    const totalIntegrations = integrations.length;
    const connectedIntegrations = integrations.filter(
      (i) => i.status === "connected"
    ).length;

    return {
      totalKeys,
      activeKeys,
      totalRequests,
      totalWebhooks,
      activeWebhooks,
      totalIntegrations,
      connectedIntegrations,
    };
  };

  const stats = getApiStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gestion des API
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos clés API, webhooks et intégrations tierces
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>

            <Button
              onClick={() => console.log("Ouvrir les logs")}
              variant="outline"
              size="sm"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Logs
            </Button>

            <Button
              onClick={() => console.log("Ouvrir la documentation")}
              variant="outline"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Docs
            </Button>

            <Button
              onClick={() => setIsCreateWebhookModalOpen(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau webhook
            </Button>

            <Button onClick={() => setIsCreateApiKeyModalOpen(true)}>
              <Key className="h-4 w-4 mr-2" />
              Nouvelle clé API
            </Button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Clés API"
              value={stats.totalKeys.toString()}
              subtitle="Total des clés"
              icon={<Key className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Clés actives"
              value={stats.activeKeys.toString()}
              trend={{
                value:
                  stats.totalKeys > 0
                    ? (stats.activeKeys / stats.totalKeys) * 100
                    : 0,
                isPositive: true,
              }}
              subtitle="Clés en service"
              icon={<CheckCircle className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Requêtes"
              value={stats.totalRequests.toLocaleString()}
              subtitle="Total des appels"
              icon={<Activity className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Webhooks"
              value={stats.totalWebhooks.toString()}
              subtitle="Total webhooks"
              icon={<Webhook className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StatCard
              title="Webhooks actifs"
              value={stats.activeWebhooks.toString()}
              trend={{
                value:
                  stats.totalWebhooks > 0
                    ? (stats.activeWebhooks / stats.totalWebhooks) * 100
                    : 0,
                isPositive: true,
              }}
              subtitle="En fonctionnement"
              icon={<CheckCircle className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <StatCard
              title="Intégrations"
              value={stats.totalIntegrations.toString()}
              subtitle="Services tiers"
              icon={<Globe className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <StatCard
              title="Connectées"
              value={stats.connectedIntegrations.toString()}
              trend={{
                value:
                  stats.totalIntegrations > 0
                    ? (stats.connectedIntegrations / stats.totalIntegrations) *
                      100
                    : 0,
                isPositive: true,
              }}
              subtitle="Intégrations actives"
              icon={<CheckCircle className="h-5 w-5" />}
            />
          </motion.div>
        </div>

        {/* Graphiques de performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Répartition des requêtes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ModernChart
                  title="Répartition des requêtes"
                  type="bar"
                  data={[
                    { name: "Production API", value: 15420, color: "#3b82f6" },
                    { name: "Development API", value: 2340, color: "#10b981" },
                    { name: "Mobile App API", value: 8750, color: "#f59e0b" },
                  ]}
                  height={200}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-green-500" />
                  Performance Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ModernChart
                  title="Tendance des performances"
                  type="line"
                  data={[
                    { name: "Lun", value: 1200, requests: 1200, errors: 15 },
                    { name: "Mar", value: 1350, requests: 1350, errors: 12 },
                    { name: "Mer", value: 1180, requests: 1180, errors: 8 },
                    { name: "Jeu", value: 1420, requests: 1420, errors: 20 },
                    { name: "Ven", value: 1380, requests: 1380, errors: 10 },
                    { name: "Sam", value: 980, requests: 980, errors: 5 },
                    { name: "Dim", value: 850, requests: 850, errors: 3 },
                  ]}
                  height={200}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Section de gestion avancée */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Statut des serveurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>API Principal</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">En ligne</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Backup</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-600">
                        Maintenance
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Exemples de code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={[
                    {
                      language: "JavaScript",
                      endpoint: "/api/v1/products",
                      method: "GET",
                    },
                    {
                      language: "Python",
                      endpoint: "/api/v1/orders",
                      method: "POST",
                    },
                    {
                      language: "PHP",
                      endpoint: "/api/v1/customers",
                      method: "PUT",
                    },
                  ]}
                  columns={[
                    {
                      accessorKey: "language",
                      header: "Langage",
                    },
                    {
                      accessorKey: "method",
                      header: "Méthode",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Liens rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation API
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    Console de test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Guide d&apos;intégration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Section de monitoring avancé */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Monitoring et Analytics
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Performance des API</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    title="Performance des API"
                    type="line"
                    data={[
                      { name: "Jan", value: 120 },
                      { name: "Fév", value: 135 },
                      { name: "Mar", value: 110 },
                      { name: "Avr", value: 145 },
                      { name: "Mai", value: 125 },
                      { name: "Jun", value: 115 },
                    ]}
                    height={200}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Logs d&apos;activité récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={[
                      {
                        timestamp: "14:30:25",
                        endpoint: "/api/users",
                        status: "200",
                        time: "125ms",
                      },
                      {
                        timestamp: "14:29:18",
                        endpoint: "/api/orders",
                        status: "201",
                        time: "89ms",
                      },
                      {
                        timestamp: "14:28:45",
                        endpoint: "/api/products",
                        status: "200",
                        time: "156ms",
                      },
                      {
                        timestamp: "14:27:32",
                        endpoint: "/api/auth",
                        status: "401",
                        time: "45ms",
                      },
                      {
                        timestamp: "14:26:15",
                        endpoint: "/api/analytics",
                        status: "200",
                        time: "234ms",
                      },
                    ]}
                    columns={[
                      {
                        accessorKey: "timestamp",
                        header: "Heure",
                      },
                      {
                        accessorKey: "endpoint",
                        header: "Endpoint",
                      },
                      {
                        accessorKey: "status",
                        header: "Statut",
                      },
                      {
                        accessorKey: "time",
                        header: "Temps",
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api-keys">Clés API</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          </TabsList>

          {/* Clés API */}
          <TabsContent value="api-keys" className="space-y-6">
            {/* Filtres */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des clés API..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Liste des clés API */}
            <div className="space-y-4">
              {apiKeys.map((apiKey, index) => {
                const StatusIcon = getStatusIcon(apiKey.status);
                const isVisible = showApiKey[apiKey.id];

                return (
                  <motion.div
                    key={apiKey.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassMorphismCard className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {apiKey.name}
                            </h3>
                            <Badge className={getStatusColor(apiKey.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {apiKey.status}
                            </Badge>
                          </div>

                          {apiKey.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {apiKey.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm font-mono">
                                {isVisible
                                  ? apiKey.key
                                  : maskApiKey(apiKey.key)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  toggleApiKeyVisibility(apiKey.id)
                                }
                              >
                                {isVisible ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Limite de taux
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={
                                    (apiKey.rateLimit.current /
                                      apiKey.rateLimit.requests) *
                                    100
                                  }
                                  className="flex-1 h-2"
                                />
                                <span className="text-sm font-medium">
                                  {apiKey.rateLimit.current}/
                                  {apiKey.rateLimit.requests}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                par{" "}
                                {apiKey.rateLimit.period === "hour"
                                  ? "heure"
                                  : apiKey.rateLimit.period === "day"
                                    ? "jour"
                                    : "minute"}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Requêtes totales
                              </div>
                              <div className="text-lg font-semibold">
                                {apiKey.usage.totalRequests.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {apiKey.usage.successfulRequests} succès,{" "}
                                {apiKey.usage.failedRequests} échecs
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Dernière utilisation
                              </div>
                              <div className="text-sm">
                                {apiKey.usage.lastUsed
                                  ? apiKey.usage.lastUsed.toLocaleDateString(
                                      "fr-FR"
                                    )
                                  : "Jamais"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Créé par {apiKey.createdBy}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {apiKey.permissions.map((permission, idx) => (
                              <Badge key={idx} variant="outline">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              console.log("Tester API:", apiKey.id)
                            }
                            title="Tester l'API"
                          >
                            <Play className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApiKey(apiKey)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              console.log("Voir tendances:", apiKey.id)
                            }
                            title="Tendances de performance"
                          >
                            {apiKey.usage.successfulRequests >
                            apiKey.usage.failedRequests ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              console.log("Accéder au serveur:", apiKey.id)
                            }
                            title="Statut du serveur"
                          >
                            <Server className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              console.log("Voir code exemple:", apiKey.id)
                            }
                            title="Code d'exemple"
                          >
                            <Code className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              console.log("Créer lien:", apiKey.id)
                            }
                            title="Créer un lien de partage"
                          >
                            <Link className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(`/api/docs/${apiKey.id}`, "_blank")
                            }
                            title="Documentation externe"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                JSON.stringify(apiKey, null, 2)
                              )
                            }
                            title="Exporter la configuration"
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApiKey(apiKey)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {apiKey.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeApiKey(apiKey.id)}
                              title="Révoquer"
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}

                          {apiKey.status === "revoked" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                console.log("Réactiver clé:", apiKey.id)
                              }
                              title="Réactiver"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteApiKey(apiKey.id)}
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
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            {/* Filtres */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des webhooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Liste des webhooks */}
            <div className="space-y-4">
              {webhooks.map((webhook, index) => {
                const StatusIcon = getStatusIcon(webhook.status);

                return (
                  <motion.div
                    key={webhook.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassMorphismCard className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {webhook.name}
                            </h3>
                            <Badge className={getStatusColor(webhook.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {webhook.status}
                            </Badge>
                          </div>

                          {webhook.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {webhook.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                URL
                              </div>
                              <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm font-mono block truncate">
                                {webhook.url}
                              </code>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Méthode
                              </div>
                              <Badge variant="outline">{webhook.method}</Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Dernière livraison
                              </div>
                              <div className="text-sm">
                                {webhook.lastDelivery
                                  ? webhook.lastDelivery.timestamp.toLocaleDateString(
                                      "fr-FR"
                                    )
                                  : "Jamais"}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Succès
                              </div>
                              <div className="text-lg font-semibold text-green-600">
                                {webhook.statistics.successfulDeliveries}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Échecs
                              </div>
                              <div className="text-lg font-semibold text-red-600">
                                {webhook.statistics.failedDeliveries}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {webhook.events.map((event, idx) => (
                              <Badge key={idx} variant="outline">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestWebhook(webhook.id)}
                            title="Tester le webhook"
                          >
                            <Zap className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                JSON.stringify(webhook, null, 2)
                              )
                            }
                            title="Exporter la configuration"
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedWebhook(webhook)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedWebhook(webhook)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              console.log("Actions webhook:", webhook.id)
                            }
                            title="Plus d'options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteWebhook(webhook.id)}
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
          </TabsContent>

          {/* Intégrations */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Barre d'actions pour les intégrations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-center"
            >
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer config
                </Button>

                <Button variant="outline" size="sm">
                  <Cloud className="h-4 w-4 mr-2" />
                  Synchroniser tout
                </Button>
              </div>

              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter intégration
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration, index) => {
                const StatusIcon = getStatusIcon(integration.status);

                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassMorphismCard className="p-6 h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Globe className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {integration.name}
                            </h3>
                            <Badge
                              className={getStatusColor(integration.status)}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {integration.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {integration.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Version
                          </div>
                          <div className="text-sm font-medium">
                            {integration.version}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Dernière synchronisation
                          </div>
                          <div className="text-sm">
                            {integration.lastSync
                              ? integration.lastSync.toLocaleDateString("fr-FR")
                              : "Jamais"}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={
                            integration.status === "connected"
                              ? "outline"
                              : "default"
                          }
                          className="flex-1"
                          onClick={() => {
                            if (integration.status === "connected") {
                              // Déconnecter
                              setIntegrations((prev) =>
                                prev.map((i) =>
                                  i.id === integration.id
                                    ? { ...i, status: "disconnected" as const }
                                    : i
                                )
                              );
                            } else {
                              // Connecter
                              setIntegrations((prev) =>
                                prev.map((i) =>
                                  i.id === integration.id
                                    ? {
                                        ...i,
                                        status: "connected" as const,
                                        lastSync: new Date(),
                                      }
                                    : i
                                )
                              );
                            }
                          }}
                        >
                          {integration.status === "connected" ? (
                            <>
                              <Unplug className="h-4 w-4 mr-2" />
                              Déconnecter
                            </>
                          ) : (
                            <>
                              <Plug className="h-4 w-4 mr-2" />
                              Connecter
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </GlassMorphismCard>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modales */}
        {/* Modale de création de clé API */}
        <Dialog
          open={isCreateApiKeyModalOpen}
          onOpenChange={setIsCreateApiKeyModalOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle clé API</DialogTitle>
              <DialogDescription>
                Configurez les permissions et les limites pour votre nouvelle
                clé API
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api-name">Nom de la clé</Label>
                  <Input
                    id="api-name"
                    value={newApiKey.name}
                    onChange={(e) =>
                      setNewApiKey((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ex: Production API"
                  />
                </div>

                <div>
                  <Label htmlFor="api-environment">Environnement</Label>
                  <Select
                    value={newApiKey.environment}
                    onValueChange={(
                      value: "production" | "staging" | "development"
                    ) =>
                      setNewApiKey((prev) => ({ ...prev, environment: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Développement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="api-description">Description</Label>
                <Textarea
                  id="api-description"
                  value={newApiKey.description}
                  onChange={(e) =>
                    setNewApiKey((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description de l'utilisation de cette clé API..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rate-limit">Limite de requêtes</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={newApiKey.rateLimit?.requests || ""}
                    onChange={(e) =>
                      setNewApiKey((prev) => ({
                        ...prev,
                        rateLimit: {
                          ...prev.rateLimit,
                          requests: parseInt(e.target.value) || 0,
                          period: prev.rateLimit?.period || "hour",
                          current: prev.rateLimit?.current || 0,
                        },
                      }))
                    }
                    placeholder="1000"
                  />
                </div>

                <div>
                  <Label htmlFor="rate-period">Période</Label>
                  <Select
                    value={newApiKey.rateLimit?.period || "hour"}
                    onValueChange={(value) =>
                      setNewApiKey((prev) => ({
                        ...prev,
                        rateLimit: {
                          ...prev.rateLimit,
                          requests: prev.rateLimit?.requests || 0,
                          period: value as "minute" | "hour" | "day",
                          current: prev.rateLimit?.current || 0,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minute">Par minute</SelectItem>
                      <SelectItem value="hour">Par heure</SelectItem>
                      <SelectItem value="day">Par jour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expires-in">Expire dans (jours)</Label>
                  <Input
                    id="expires-in"
                    type="number"
                    value={newApiKey.expiresIn}
                    onChange={(e) =>
                      setNewApiKey((prev) => ({
                        ...prev,
                        expiresIn: e.target.value,
                      }))
                    }
                    placeholder="365"
                  />
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    "read:products",
                    "write:products",
                    "delete:products",
                    "read:orders",
                    "write:orders",
                    "read:customers",
                    "write:customers",
                    "read:analytics",
                    "admin:all",
                  ].map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={permission}
                        checked={
                          newApiKey.permissions?.includes(permission) || false
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewApiKey((prev) => ({
                              ...prev,
                              permissions: [
                                ...(prev.permissions || []),
                                permission,
                              ],
                            }));
                          } else {
                            setNewApiKey((prev) => ({
                              ...prev,
                              permissions: (prev.permissions || []).filter(
                                (p) => p !== permission
                              ),
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateApiKeyModalOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateApiKey}>
                <Key className="h-4 w-4 mr-2" />
                Créer la clé API
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modale de configuration avancée */}
        <Dialog
          open={!!selectedApiKey}
          onOpenChange={() => setSelectedApiKey(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Configuration avancée - {selectedApiKey?.name}
              </DialogTitle>
              <DialogDescription>
                Gérez les paramètres avancés de votre clé API
              </DialogDescription>
            </DialogHeader>

            {selectedApiKey && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Paramètres de sécurité
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Rotation automatique</Label>
                          <p className="text-sm text-gray-500">
                            Renouveler la clé automatiquement
                          </p>
                        </div>
                        <Switch
                          defaultChecked={selectedApiKey.status === "active"}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notifications d&apos;usage</Label>
                          <p className="text-sm text-gray-500">
                            Alertes de limite atteinte
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Logging détaillé</Label>
                          <p className="text-sm text-gray-500">
                            Enregistrer toutes les requêtes
                          </p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        Restrictions d&apos;accès
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Restriction IP</Label>
                          <p className="text-sm text-gray-500">
                            Limiter par adresse IP
                          </p>
                        </div>
                        <Switch
                          defaultChecked={
                            !!selectedApiKey.restrictions?.ipWhitelist?.length
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Restriction domaine</Label>
                          <p className="text-sm text-gray-500">
                            Limiter par domaine
                          </p>
                        </div>
                        <Switch
                          defaultChecked={
                            !!selectedApiKey.restrictions?.domains?.length
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>CORS strict</Label>
                          <p className="text-sm text-gray-500">
                            Politique CORS restrictive
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Statistiques d&apos;utilisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedApiKey.usage.totalRequests.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Requêtes totales
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedApiKey.usage.successfulRequests.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Succès</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedApiKey.usage.failedRequests.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Échecs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {(
                            (selectedApiKey.usage.successfulRequests /
                              selectedApiKey.usage.totalRequests) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                        <div className="text-sm text-gray-500">
                          Taux de succès
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApiKey(null)}>
                Fermer
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modale de détails webhook */}
        <Dialog
          open={!!selectedWebhook}
          onOpenChange={() => setSelectedWebhook(null)}
        >
          <DialogTrigger asChild>
            <Button style={{ display: "none" }}>Trigger caché</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Détails du webhook - {selectedWebhook?.name}
              </DialogTitle>
              <DialogDescription>
                Informations détaillées et configuration du webhook
              </DialogDescription>
            </DialogHeader>

            {selectedWebhook && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>URL</Label>
                    <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                      {selectedWebhook.url}
                    </code>
                  </div>
                  <div>
                    <Label>Méthode</Label>
                    <Badge variant="outline">{selectedWebhook.method}</Badge>
                  </div>
                </div>

                <div>
                  <Label>Événements écoutés</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedWebhook.events.map((event) => (
                      <Badge key={event} variant="secondary">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">
                      {selectedWebhook.statistics.totalDeliveries}
                    </div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {selectedWebhook.statistics.successfulDeliveries}
                    </div>
                    <div className="text-sm text-gray-500">Succès</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">
                      {selectedWebhook.statistics.failedDeliveries}
                    </div>
                    <div className="text-sm text-gray-500">Échecs</div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedWebhook(null)}
              >
                Fermer
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modale de création de webhook */}
        <Dialog
          open={isCreateWebhookModalOpen}
          onOpenChange={setIsCreateWebhookModalOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau webhook</DialogTitle>
              <DialogDescription>
                Configurez votre webhook pour recevoir des notifications
                d&apos;événements
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhook-name">Nom du webhook</Label>
                  <Input
                    id="webhook-name"
                    value={newWebhook.name}
                    onChange={(e) =>
                      setNewWebhook((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ex: Notifications commandes"
                  />
                </div>

                <div>
                  <Label htmlFor="webhook-method">Méthode HTTP</Label>
                  <Select
                    value={newWebhook.method}
                    onValueChange={(
                      value: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
                    ) => setNewWebhook((prev) => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="webhook-url">URL du webhook</Label>
                <Input
                  id="webhook-url"
                  value={newWebhook.url}
                  onChange={(e) =>
                    setNewWebhook((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://votre-site.com/webhook"
                />
              </div>

              <div>
                <Label htmlFor="webhook-description">Description</Label>
                <Textarea
                  id="webhook-description"
                  value={newWebhook.description}
                  onChange={(e) =>
                    setNewWebhook((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description de ce webhook..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Événements à écouter</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    "order.created",
                    "order.updated",
                    "order.cancelled",
                    "product.created",
                    "product.updated",
                    "product.deleted",
                    "customer.created",
                    "payment.completed",
                    "inventory.low",
                  ].map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <Checkbox
                        id={event}
                        checked={newWebhook.events?.includes(event) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook((prev) => ({
                              ...prev,
                              events: [...(prev.events || []), event],
                            }));
                          } else {
                            setNewWebhook((prev) => ({
                              ...prev,
                              events: (prev.events || []).filter(
                                (e) => e !== event
                              ),
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={event} className="text-sm">
                        {event}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="webhook-secret">Secret (optionnel)</Label>
                <Input
                  id="webhook-secret"
                  value={newWebhook.secret}
                  onChange={(e) =>
                    setNewWebhook((prev) => ({
                      ...prev,
                      secret: e.target.value,
                    }))
                  }
                  placeholder="Secret pour signer les requêtes"
                  type="password"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateWebhookModalOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateWebhook}>
                <Webhook className="h-4 w-4 mr-2" />
                Créer le webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ApiManagement;
