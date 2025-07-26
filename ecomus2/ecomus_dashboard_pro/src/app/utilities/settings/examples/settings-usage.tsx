// Exemple d'utilisation des composants modulaires
// Fichier: examples/settings-usage.tsx

"use client";

import { useState } from "react";
import {
  RecentOrderSettings,
  GeneralInfoSettings,
  CacheSettings,
} from "../components";
import { useSettings } from "../useSettings";

// Exemple 1: Page de paramètres personnalisée avec seulement certaines sections
export function CustomSettingsPage() {
  const { settings, loading, updateSettings, handleSave } = useSettings();

  return (
    <div className="space-y-6">
      <h1>Paramètres Rapides</h1>

      {/* Seulement les paramètres essentiels */}
      <GeneralInfoSettings
        settings={settings.generalInfo}
        onUpdate={(newSettings) => updateSettings("generalInfo", newSettings)}
        onSave={() => handleSave("generalInfo")}
        loading={loading}

      />

      <CacheSettings
        settings={settings.cache}
        onUpdate={(newSettings) => updateSettings("cache", newSettings)}
        onSave={() => handleSave("cache")}
        loading={loading}

      />
    </div>
  );
}

// Exemple 2: Utilisation individuelle d'un composant
export function QuickCacheToggle() {
  const [cacheEnabled, setCacheEnabled] = useState(true);

  const handleCacheUpdate = (settings: any) => {
    setCacheEnabled(settings.enableCache);
    // Logique personnalisée de sauvegarde
  };

  return (
    <CacheSettings
      settings={{ enableCache: cacheEnabled, cacheAutoCleanup: false }}
      onUpdate={handleCacheUpdate}
      onSave={() => console.log("Cache settings saved")}
      loading={false}

    />
  );
}

// Exemple 3: Composant wrapper avec validation personnalisée
export function ValidatedGeneralSettings() {
  const { settings, loading, updateSettings, handleSave } = useSettings();

  const handleValidatedUpdate = (newSettings: any) => {
    // Validation personnalisée
    if (newSettings.adminEmail && newSettings.adminEmail.includes("@")) {
      updateSettings("generalInfo", newSettings);
    } else {
      alert("Email invalide");
    }
  };

  return (
    <GeneralInfoSettings
      settings={settings.generalInfo}
      onUpdate={handleValidatedUpdate}
      onSave={() => handleSave("generalInfo")}
      loading={loading}

    />
  );
}
