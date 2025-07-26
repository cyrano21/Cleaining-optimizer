"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Server, 
  Database, 
  Mail, 
  Shield,
  Bell,
  Globe,
  Key,
  Activity,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

interface SystemConfig {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  email: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  security: {
    jwtSecret: string;
    jwtExpiry: string;
    passwordMinLength: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
  notifications: {
    newUserAlert: boolean;
    newOrderAlert: boolean;
    lowStockAlert: boolean;
    systemErrorAlert: boolean;
    backupAlert: boolean;
  };
  features: {
    multiStore: boolean;
    advancedAnalytics: boolean;
    bulkOperations: boolean;
    apiAccess: boolean;
    customThemes: boolean;
    seoTools: boolean;
  };
}

interface SystemLogs {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  module: string;
  details?: any;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    connections: number;
    responseTime: number;
  };
  cache: {
    status: 'active' | 'inactive';
    hitRate: number;
    size: number;
  };
}

export default function SuperAdminSystemPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [logs, setLogs] = useState<SystemLogs[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/super-admin/system');
      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
        setLogs(data.logs);
        setHealth(data.health);
      } else {
        toast.error("Erreur lors du chargement des données système");
      }
    } catch (error) {
      console.error("Error fetching system data:", error);
      toast.error("Erreur lors du chargement des données système");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    try {
      setSaving(true);
      const response = await fetch('/api/super-admin/system', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Configuration sauvegardée avec succès");
      } else {
        toast.error(data.message || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value,
      },
    });
  };

  useEffect(() => {
    fetchSystemData();
    
    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'critical':
        return 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'disconnected':
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!config || !health) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Impossible de charger les données système
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paramètres Système
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configuration et monitoring du système
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchSystemData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={saveConfig} size="sm" disabled={saving}>
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* System Health Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">État Système</CardTitle>
            {getStatusIcon(health.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{health.status}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Uptime: {formatUptime(health.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.cpu.usage.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {health.cpu.cores} cœurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mémoire</CardTitle>
            <MemoryStick className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.memory.percentage.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatBytes(health.memory.used)} / {formatBytes(health.memory.total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disque</CardTitle>
            <HardDrive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.disk.percentage.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatBytes(health.disk.used)} / {formatBytes(health.disk.total)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database & Cache Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de Données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span>Statut</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.database.status)}
                <span className="capitalize">{health.database.status}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span>Connexions</span>
              <span>{health.database.connections}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Temps de réponse</span>
              <span>{health.database.responseTime}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span>Statut</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.cache.status)}
                <span className="capitalize">{health.cache.status}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span>Taux de réussite</span>
              <span>{health.cache.hitRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Taille</span>
              <span>{formatBytes(health.cache.size)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={config.general.siteName}
                    onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL du site</Label>
                  <Input
                    id="siteUrl"
                    value={config.general.siteUrl}
                    onChange={(e) => updateConfig('general', 'siteUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email admin</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={config.general.adminEmail}
                    onChange={(e) => updateConfig('general', 'adminEmail', e.target.value)}
                  />
                </div>                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <select
                    id="timezone"
                    title="Sélectionner le fuseau horaire"
                    aria-label="Fuseau horaire"
                    value={config.general.timezone}
                    onChange={(e) => updateConfig('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode maintenance</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Désactive l'accès public au site
                    </p>
                  </div>
                  <Switch
                    checked={config.general.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('general', 'maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Inscription activée</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permet aux nouveaux utilisateurs de s'inscrire
                    </p>
                  </div>
                  <Switch
                    checked={config.general.registrationEnabled}
                    onCheckedChange={(checked) => updateConfig('general', 'registrationEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vérification email requise</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Oblige la vérification de l'email à l'inscription
                    </p>
                  </div>
                  <Switch
                    checked={config.general.emailVerificationRequired}
                    onCheckedChange={(checked) => updateConfig('general', 'emailVerificationRequired', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Longueur minimum du mot de passe</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={config.security.passwordMinLength}
                    onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Tentatives de connexion max</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Durée de verrouillage (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={config.security.lockoutDuration}
                    onChange={(e) => updateConfig('security', 'lockoutDuration', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout session (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active l'A2F pour tous les utilisateurs
                  </p>
                </div>
                <Switch
                  checked={config.security.twoFactorEnabled}
                  onCheckedChange={(checked) => updateConfig('security', 'twoFactorEnabled', checked)}
                />
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-boutiques</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permet la gestion de plusieurs boutiques
                    </p>
                  </div>
                  <Switch
                    checked={config.features.multiStore}
                    onCheckedChange={(checked) => updateConfig('features', 'multiStore', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics avancées</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Active les rapports d'analytics détaillés
                    </p>
                  </div>
                  <Switch
                    checked={config.features.advancedAnalytics}
                    onCheckedChange={(checked) => updateConfig('features', 'advancedAnalytics', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Opérations en lot</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permet les modifications en masse
                    </p>
                  </div>
                  <Switch
                    checked={config.features.bulkOperations}
                    onCheckedChange={(checked) => updateConfig('features', 'bulkOperations', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Accès API</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Active l'API REST pour les développeurs
                    </p>
                  </div>
                  <Switch
                    checked={config.features.apiAccess}
                    onCheckedChange={(checked) => updateConfig('features', 'apiAccess', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Thèmes personnalisés</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permet l'upload de thèmes personnalisés
                    </p>
                  </div>
                  <Switch
                    checked={config.features.customThemes}
                    onCheckedChange={(checked) => updateConfig('features', 'customThemes', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Outils SEO</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Active les outils d'optimisation SEO
                    </p>
                  </div>
                  <Switch
                    checked={config.features.seoTools}
                    onCheckedChange={(checked) => updateConfig('features', 'seoTools', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Horodatage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.slice(0, 20).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge className={getLogLevelColor(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.module}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {log.message}
                          </TableCell>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString("fr-FR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
