"use client";

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface SystemSetting {
  value: any;
  label: string;
  description: string;
  type: string;
  isEditable: boolean;
  isPublic: boolean;
}

interface SystemSettings {
  logos?: {
    [key: string]: SystemSetting;
  };
  branding?: {
    [key: string]: SystemSetting;
  };
  [category: string]: {
    [key: string]: SystemSetting;
  } | undefined;
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Array<{ settingKey: string; settingValue: any }>) => Promise<boolean>;
  getLogo: (logoKey: string) => string;
  getBranding: (brandingKey: string) => any;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/system-settings?public=true');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des paramètres');
      }
      
      const data = await response.json();
      setSettings(data.data || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur lors du chargement des paramètres système:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Array<{ settingKey: string; settingValue: any }>) => {
    try {
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des paramètres');
      }

      const data = await response.json();
      if (data.success) {
        await refreshSettings(); // Recharger les paramètres après mise à jour
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paramètres:', err);
      return false;
    }
  }, [refreshSettings]);

  const getLogo = useCallback((logoKey: string): string => {
    const defaultLogos: { [key: string]: string } = {
      mainLogo: '/images/logo.png',
      authLogo: '/auth/logo.png',
      ecommerceLogo: '/e-commerce/logo.png',
      storeLogo: '/images/store-logo.png',
      adminLogo: '/images/logo.png',
      emailLogo: '/images/logo.png',
      faviconLogo: '/favicon.ico'
    };

    return settings.logos?.[logoKey]?.value || defaultLogos[logoKey] || '/images/placeholder.svg';
  }, [settings]);

  const getBranding = useCallback((brandingKey: string): any => {
    const defaultBranding: { [key: string]: any } = {
      companyName: 'Ecomus Dashboard',
      tagline: 'Plateforme de gestion e-commerce moderne',
      primaryColor: '#8b5cf6',
      secondaryColor: '#06b6d4',
      accentColor: '#10b981'
    };

    return settings.branding?.[brandingKey]?.value || defaultBranding[brandingKey];
  }, [settings]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const contextValue: SystemSettingsContextType = {
    settings,
    loading,
    error,
    refreshSettings,
    updateSettings,
    getLogo,
    getBranding
  };

  return (
    <SystemSettingsContext.Provider value={contextValue}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
}

// Hook simple pour récupérer seulement les logos
export function useLogos() {
  const { getLogo, loading } = useSystemSettings();
  
  return {
    getLogo,
    loading,
    logos: {
      main: getLogo('mainLogo'),
      auth: getLogo('authLogo'),
      ecommerce: getLogo('ecommerceLogo'),
      store: getLogo('storeLogo'),
      admin: getLogo('adminLogo'),
      email: getLogo('emailLogo'),
      favicon: getLogo('faviconLogo')
    }
  };
}

// Hook simple pour récupérer seulement le branding
export function useBranding() {
  const { getBranding, loading } = useSystemSettings();
  
  return {
    getBranding,
    loading,
    branding: {
      companyName: getBranding('companyName'),
      tagline: getBranding('tagline'),
      primaryColor: getBranding('primaryColor'),
      secondaryColor: getBranding('secondaryColor'),
      accentColor: getBranding('accentColor')
    }
  };
}
