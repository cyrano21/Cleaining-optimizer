"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Save,
  RefreshCw,
  Settings,
  Palette,
  Eye,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import AdminGuard from "@/components/admin/admin-guard";
import Image from "next/image";

interface LogoPreviewProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

function LogoPreview({ src, alt, size = "md" }: LogoPreviewProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size === "sm" ? 32 : size === "md" ? 48 : 64}
          height={size === "sm" ? 32 : size === "md" ? 48 : 64}
          className="object-contain"
        />
      ) : (
        <ImageIcon className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
}

interface LogoSettingCardProps {
  settingKey: string;
  setting:
    | {
        value?: string;
        label?: string;
        description?: string;
        isPublic?: boolean;
      }
    | undefined;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

function LogoSettingCard({
  settingKey,
  setting,
  onUpdate,
  isUpdating,
}: LogoSettingCardProps) {
  const [localValue, setLocalValue] = useState(setting?.value || "");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalValue(setting?.value || "");
    setHasChanges(false);
  }, [setting?.value]);

  const handleChange = (value: string) => {
    setLocalValue(value);
    setHasChanges(value !== (setting?.value || ""));
  };

  const handleSave = () => {
    if (hasChanges) {
      onUpdate(settingKey, localValue);
      setHasChanges(false);
    }
  };

  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-start gap-4">
        <LogoPreview
          src={localValue}
          alt={setting?.label || settingKey}
          size="lg"
        />

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{setting?.label || settingKey}</h3>
              {setting?.isPublic && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{setting?.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`logo-${settingKey}`}>URL du Logo</Label>
            <div className="flex gap-2">
              <Input
                id={`logo-${settingKey}`}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="https://entreprise.fr/logo.png ou /images/logo.png"
                className="flex-1"
              />
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isUpdating}
                size="sm"
                className="shrink-0"
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            </div>
            {hasChanges && (
              <p className="text-sm text-amber-600">
                Modifications non sauvegardées
              </p>
            )}
          </div>
        </div>
      </div>
    </GlassmorphismCard>
  );
}

interface BrandingSettingCardProps {
  settingKey: string;
  setting:
    | {
        value?: string;
        label?: string;
        description?: string;
        isPublic?: boolean;
      }
    | undefined;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

function BrandingSettingCard({
  settingKey,
  setting,
  onUpdate,
  isUpdating,
}: BrandingSettingCardProps) {
  const [localValue, setLocalValue] = useState(setting?.value || "");
  const [hasChanges, setHasChanges] = useState(false);
  const colorPreviewRef = useRef<HTMLDivElement>(null);
  const isColorSetting =
    settingKey.includes("color") || settingKey.includes("Color");

  useEffect(() => {
    if (colorPreviewRef.current && localValue) {
      colorPreviewRef.current.style.backgroundColor = localValue;
    }
  }, [localValue]);

  useEffect(() => {
    setLocalValue(setting?.value || "");
    setHasChanges(false);
  }, [setting?.value]);

  const handleChange = (value: string) => {
    setLocalValue(value);
    setHasChanges(value !== (setting?.value || ""));
  };

  const handleSave = () => {
    if (hasChanges) {
      onUpdate(settingKey, localValue);
      setHasChanges(false);
    }
  };

  return (
    <GlassmorphismCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {isColorSetting && (
            <div
              className="w-12 h-12 rounded-lg border-2 border-white shadow-sm color-preview"
              data-color={localValue}
              ref={colorPreviewRef}
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{setting?.label || settingKey}</h3>
            <p className="text-sm text-gray-600">{setting?.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`branding-${settingKey}`}>
            {isColorSetting ? "Couleur (hex)" : "Valeur"}
          </Label>
          <div className="flex gap-2">
            <Input
              id={`branding-${settingKey}`}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={isColorSetting ? "#8b5cf6" : "Valeur..."}
              type={isColorSetting ? "color" : "text"}
              className="flex-1"
            />
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
              size="sm"
              className="shrink-0"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </Button>
          </div>
          {hasChanges && (
            <p className="text-sm text-amber-600">
              Modifications non sauvegardées
            </p>
          )}
        </div>
      </div>
    </GlassmorphismCard>
  );
}

export default function SystemSettingsPage() {
  const { settings, loading, error, refreshSettings, updateSettings } =
    useSystemSettings();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isInitializing, setIsInitializing] = useState(false);

  const handleUpdateSetting = async (
    settingKey: string,
    settingValue: string
  ) => {
    setIsUpdating(true);
    setUpdateStatus({ type: null, message: "" });

    try {
      const success = await updateSettings([{ settingKey, settingValue }]);

      if (success) {
        setUpdateStatus({
          type: "success",
          message: `${settingKey} mis à jour avec succès`,
        });
      } else {
        setUpdateStatus({
          type: "error",
          message: `Erreur lors de la mise à jour de ${settingKey}`,
        });
      }
    } catch {
      setUpdateStatus({
        type: "error",
        message: "Erreur réseau lors de la mise à jour",
      });
    } finally {
      setIsUpdating(false);
      // Effacer le message après 3 secondes
      setTimeout(() => setUpdateStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleInitializeSettings = async () => {
    setIsInitializing(true);

    try {
      const response = await fetch("/api/system-settings/initialize", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setUpdateStatus({
          type: "success",
          message: `Initialisation terminée: ${data.summary.created} paramètres créés`,
        });
        await refreshSettings();
      } else {
        setUpdateStatus({
          type: "error",
          message: "Erreur lors de l'initialisation",
        });
      }
    } catch {
      setUpdateStatus({
        type: "error",
        message: "Erreur réseau lors de l'initialisation",
      });
    } finally {
      setIsInitializing(false);
      setTimeout(() => setUpdateStatus({ type: null, message: "" }), 5000);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <span className="ml-2">Chargement des paramètres...</span>
          </div>
        </div>
      </AdminGuard>
    );
  }

  const hasNoSettings = !settings.logos && !settings.branding;

  return (
    <AdminGuard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Paramètres Système
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les logos, couleurs et paramètres de branding de votre
              plateforme
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={refreshSettings}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>

            {hasNoSettings && (
              <Button
                onClick={handleInitializeSettings}
                disabled={isInitializing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isInitializing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4 mr-2" />
                )}
                Initialiser les Paramètres
              </Button>
            )}
          </div>
        </motion.div>

        {/* Status Messages */}
        {updateStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              className={
                updateStatus.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              {updateStatus.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  updateStatus.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }
              >
                {updateStatus.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* No Settings Notice */}
        {hasNoSettings ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun paramètre configuré
            </h3>
            <p className="text-gray-500 mb-6">
              Initialisez les paramètres par défaut pour commencer à
              personnaliser votre plateforme
            </p>
            <Button
              onClick={handleInitializeSettings}
              disabled={isInitializing}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isInitializing ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Settings className="w-5 h-5 mr-2" />
              )}
              Initialiser les Paramètres
            </Button>
          </motion.div>
        ) : (
          /* Settings Tabs */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="logos" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="logos" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Logos ({Object.keys(settings.logos || {}).length})
                </TabsTrigger>
                <TabsTrigger
                  value="branding"
                  className="flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Branding ({Object.keys(settings.branding || {}).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logos" className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Ces paramètres sont utilisés dans toute l&apos;application
                    et peuvent être absolues.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {settings.logos &&
                    Object.entries(settings.logos).map(([key, setting]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <LogoSettingCard
                          settingKey={key}
                          setting={setting}
                          onUpdate={handleUpdateSetting}
                          isUpdating={isUpdating}
                        />
                      </motion.div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="branding" className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Les paramètres de branding définissent l&apos;identité
                    visuelle de votre plateforme.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {settings.branding &&
                    Object.entries(settings.branding).map(([key, setting]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <BrandingSettingCard
                          settingKey={key}
                          setting={setting}
                          onUpdate={handleUpdateSetting}
                          isUpdating={isUpdating}
                        />
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </AdminGuard>
  );
}
