'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Shield,
  Database,
  Mail,
  Globe,
  Users,
  Store,
  Zap,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
    allowedRoles: string[];
  };
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number;
  };
  features: {
    userRegistration: boolean;
    vendorRegistration: boolean;
    guestCheckout: boolean;
    reviews: boolean;
    wishlist: boolean;
    multiStore: boolean;
  };
  email: {
    enabled: boolean;
    provider: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
  };
  storage: {
    provider: string;
    maxFileSize: number;
    allowedTypes: string[];
  };
  api: {
    rateLimit: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
  };
  performance: {
    cacheEnabled: boolean;
    cacheDuration: number;
  };
}

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fonction utilitaire pour accéder aux propriétés imbriquées de manière sécurisée
  const getSettingValue = (path: string, defaultValue: any = '') => {
    if (!settings) return defaultValue;
    
    const keys = path.split('.');
    let current: any = settings;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current !== undefined ? current : defaultValue;
  };

  useEffect(() => {
    fetchSettings();
  }, []);
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/super-admin/system/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        throw new Error('Erreur lors du chargement des paramètres');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/super-admin/system/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        toast.success('Paramètres sauvegardés avec succès');
        setHasChanges(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    if (!settings) return;

    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-semibold">Erreur de chargement</p>
              <p className="text-muted-foreground">Impossible de charger les paramètres système</p>
              <Button onClick={fetchSettings} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres Système</h1>
          <p className="text-muted-foreground">
            Configuration globale de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Modifications non sauvegardées
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={!hasChanges || saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Fonctionnalités
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Stockage
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Mode Maintenance
              </CardTitle>
              <CardDescription>
                Contrôlez l'accès au site pendant les maintenances
              </CardDescription>
            </CardHeader>            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-enabled">Activer la maintenance</Label>
                <Switch
                  id="maintenance-enabled"
                  checked={getSettingValue('maintenance.enabled', false)}
                  onCheckedChange={(checked) => updateSetting('maintenance.enabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Message de maintenance</Label>
                <Textarea
                  id="maintenance-message"
                  value={getSettingValue('maintenance.message', '')}
                  onChange={(e) => updateSetting('maintenance.message', e.target.value)}
                  placeholder="Message affiché aux utilisateurs"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres de Sécurité
              </CardTitle>
              <CardDescription>
                Configuration de la sécurité et de l'authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Tentatives de connexion max</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    value={getSettingValue('security.maxLoginAttempts', 5)}
                    onChange={(e) => updateSetting('security.maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Durée de verrouillage (min)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    value={getSettingValue('security.lockoutDuration', 15)}
                    onChange={(e) => updateSetting('security.lockoutDuration', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Politique de mot de passe</h4>
                <div className="grid grid-cols-2 gap-4">                  <div className="space-y-2">
                    <Label htmlFor="min-length">Longueur minimale</Label>
                    <Input
                      id="min-length"
                      type="number"
                      value={getSettingValue('security.passwordPolicy.minLength', 8)}
                      onChange={(e) => updateSetting('security.passwordPolicy.minLength', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Timeout session (h)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={getSettingValue('security.sessionTimeout', 30)}
                      onChange={(e) => updateSetting('security.sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-uppercase">Majuscules requises</Label>
                    <Switch
                      id="require-uppercase"
                      checked={getSettingValue('security.passwordPolicy.requireUppercase', true)}
                      onCheckedChange={(checked) => updateSetting('security.passwordPolicy.requireUppercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-lowercase">Minuscules requises</Label>
                    <Switch
                      id="require-lowercase"
                      checked={getSettingValue('security.passwordPolicy.requireLowercase', true)}
                      onCheckedChange={(checked) => updateSetting('security.passwordPolicy.requireLowercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-numbers">Chiffres requis</Label>
                    <Switch
                      id="require-numbers"
                      checked={getSettingValue('security.passwordPolicy.requireNumbers', true)}
                      onCheckedChange={(checked) => updateSetting('security.passwordPolicy.requireNumbers', checked)}
                    />
                  </div>                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-special">Caractères spéciaux requis</Label>
                    <Switch
                      id="require-special"
                      checked={getSettingValue('security.passwordPolicy.requireSpecialChars', false)}
                      onCheckedChange={(checked) => updateSetting('security.passwordPolicy.requireSpecialChars', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Fonctionnalités de la Plateforme
              </CardTitle>
              <CardDescription>
                Activez ou désactivez les fonctionnalités globales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-registration">Inscription utilisateurs</Label>
                  <Switch
                    id="user-registration"
                    checked={getSettingValue('features.userRegistration', true)}
                    onCheckedChange={(checked) => updateSetting('features.userRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vendor-registration">Inscription vendeurs</Label>
                  <Switch
                    id="vendor-registration"
                    checked={getSettingValue('features.vendorRegistration', true)}
                    onCheckedChange={(checked) => updateSetting('features.vendorRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="guest-checkout">Commande invité</Label>
                  <Switch
                    id="guest-checkout"
                    checked={getSettingValue('features.guestCheckout', true)}
                    onCheckedChange={(checked) => updateSetting('features.guestCheckout', checked)}
                  />
                </div>                <div className="flex items-center justify-between">
                  <Label htmlFor="reviews">Avis clients</Label>
                  <Switch
                    id="reviews"
                    checked={getSettingValue('features.reviews', true)}
                    onCheckedChange={(checked) => updateSetting('features.reviews', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="wishlist">Liste de souhaits</Label>
                  <Switch
                    id="wishlist"
                    checked={getSettingValue('features.wishlist', true)}
                    onCheckedChange={(checked) => updateSetting('features.wishlist', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="multi-store">Multi-boutiques</Label>
                  <Switch
                    id="multi-store"
                    checked={getSettingValue('features.multiStore', true)}
                    onCheckedChange={(checked) => updateSetting('features.multiStore', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuration Email
              </CardTitle>
              <CardDescription>
                Paramètres d'envoi d'emails
              </CardDescription>
            </CardHeader>            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-enabled">Emails activés</Label>
                <Switch
                  id="email-enabled"
                  checked={getSettingValue('email.enabled', false)}
                  onCheckedChange={(checked) => updateSetting('email.enabled', checked)}
                />
              </div>

              {getSettingValue('email.enabled', false) && (
                <div className="space-y-4">                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">Serveur SMTP</Label>
                      <Input
                        id="smtp-host"
                        value={getSettingValue('email.smtp.host', '')}
                        onChange={(e) => updateSetting('email.smtp.host', e.target.value)}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">Port SMTP</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        value={getSettingValue('email.smtp.port', 587)}
                        onChange={(e) => updateSetting('email.smtp.port', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">Utilisateur SMTP</Label>
                      <Input
                        id="smtp-user"
                        value={getSettingValue('email.smtp.user', '')}
                        onChange={(e) => updateSetting('email.smtp.user', e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smtp-secure">Connexion sécurisée</Label>
                      <Switch
                        id="smtp-secure"
                        checked={getSettingValue('email.smtp.secure', false)}
                        onCheckedChange={(checked) => updateSetting('email.smtp.secure', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Stockage de fichiers
              </CardTitle>
              <CardDescription>
                Configuration du stockage des médias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Taille max de fichier (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={getSettingValue('storage.maxFileSize', 10)}
                  onChange={(e) => updateSetting('storage.maxFileSize', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuration API
              </CardTitle>
              <CardDescription>
                Paramètres des APIs et limites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">              <div className="flex items-center justify-between">
                <Label htmlFor="rate-limit-enabled">Limitation de taux activée</Label>
                <Switch
                  id="rate-limit-enabled"
                  checked={getSettingValue('api.rateLimit.enabled', true)}
                  onCheckedChange={(checked) => updateSetting('api.rateLimit.enabled', checked)}
                />
              </div>

              {getSettingValue('api.rateLimit.enabled', true) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-requests">Requêtes max</Label>
                    <Input
                      id="max-requests"
                      type="number"
                      value={getSettingValue('api.rateLimit.maxRequests', 100)}
                      onChange={(e) => updateSetting('api.rateLimit.maxRequests', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="window-ms">Fenêtre (ms)</Label>
                    <Input
                      id="window-ms"
                      type="number"
                      value={getSettingValue('api.rateLimit.windowMs', 15)}
                      onChange={(e) => updateSetting('api.rateLimit.windowMs', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Performance
              </CardTitle>
              <CardDescription>
                Optimisations et cache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cache-enabled">Cache activé</Label>
                <Switch
                  id="cache-enabled"
                  checked={getSettingValue('performance.cacheEnabled', true)}
                  onCheckedChange={(checked) => updateSetting('performance.cacheEnabled', checked)}
                />
              </div>

              {getSettingValue('performance.cacheEnabled', true) && (
                <div className="space-y-2">
                  <Label htmlFor="cache-duration">Durée du cache (min)</Label>
                  <Input
                    id="cache-duration"
                    type="number"
                    value={getSettingValue('performance.cacheDuration', 60)}
                    onChange={(e) => updateSetting('performance.cacheDuration', parseInt(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

