import { useState, useEffect } from 'react';

export interface DashboardTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  gradients: {
    main: string;
    card: string;
    button: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

// Thèmes prédéfinis pour différents dashboards
export const dashboardThemes: Record<string, DashboardTheme> = {
  admin: {
    name: 'Admin Pro',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#6366f1',
      background: 'from-slate-50 via-blue-50 to-indigo-100',
      surface: 'bg-white/80 backdrop-blur-sm',
      text: '#1f2937',
      textSecondary: '#6b7280',
    },
    gradients: {
      main: 'from-blue-600 to-indigo-600',
      card: 'from-white/80 to-white/60',
      button: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg shadow-blue-500/20',
    },
    animations: {
      duration: '0.6s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  vendor: {
    name: 'Vendor Focus',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: 'from-emerald-50 via-green-50 to-teal-100',
      surface: 'bg-white/85 backdrop-blur-sm',
      text: '#064e3b',
      textSecondary: '#6b7280',
    },
    gradients: {
      main: 'from-emerald-600 to-teal-600',
      card: 'from-white/85 to-white/70',
      button: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg shadow-emerald-500/20',
    },
    animations: {
      duration: '0.5s',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
  client: {
    name: 'Client Experience',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: 'from-purple-50 via-violet-50 to-pink-100',
      surface: 'bg-white/90 backdrop-blur-sm',
      text: '#581c87',
      textSecondary: '#6b7280',
    },
    gradients: {
      main: 'from-purple-600 to-pink-600',
      card: 'from-white/90 to-white/75',
      button: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg shadow-purple-500/20',
    },
    animations: {
      duration: '0.7s',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  gamified: {
    name: 'Gamified',
    colors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#fcd34d',
      background: 'from-amber-50 via-orange-50 to-yellow-100',
      surface: 'bg-white/95 backdrop-blur-md',
      text: '#92400e',
      textSecondary: '#6b7280',
    },
    gradients: {
      main: 'from-amber-500 to-orange-500',
      card: 'from-white/95 to-white/80',
      button: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg shadow-amber-500/25',
    },
    animations: {
      duration: '0.4s',
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
  analytics: {
    name: 'Analytics Pro',
    colors: {
      primary: '#0f172a',
      secondary: '#334155',
      accent: '#64748b',
      background: 'from-slate-100 via-gray-50 to-zinc-100',
      surface: 'bg-white/95 backdrop-blur-sm',
      text: '#0f172a',
      textSecondary: '#64748b',
    },
    gradients: {
      main: 'from-slate-700 to-gray-800',
      card: 'from-white/95 to-white/85',
      button: 'from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900',
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg shadow-slate-500/15',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  super_admin: {
    name: 'Super Admin Elite',
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#c084fc',
      background: 'from-purple-50 via-violet-50 to-indigo-50',
      surface: 'bg-white/90 backdrop-blur-sm',
      text: '#1f2937',
      textSecondary: '#6b7280',
    },
    gradients: {
      main: 'from-purple-600 to-violet-600',
      card: 'from-white/90 to-white/70',
      button: 'from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700',
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg shadow-purple-500/25',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

export const useDashboardTheme = (dashboardType: keyof typeof dashboardThemes = 'admin') => {
  // Protection: utiliser le thème admin par défaut si le type demandé n'existe pas
  const selectedTheme = dashboardThemes[dashboardType] || dashboardThemes.admin;
  const [currentTheme, setCurrentTheme] = useState<DashboardTheme>(selectedTheme);
  const [customTheme, setCustomTheme] = useState<Partial<DashboardTheme> | null>(null);

  // Sauvegarder le thème dans localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(`dashboard-theme-${dashboardType}`);
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setCustomTheme(parsed);
      } catch (error) {
        console.warn('Erreur lors du chargement du thème sauvegardé:', error);
      }
    }
  }, [dashboardType]);

  // Appliquer le thème personnalisé s'il existe
  useEffect(() => {
    if (customTheme) {
      setCurrentTheme(prevTheme => ({
        ...prevTheme,
        ...customTheme,
        colors: { ...prevTheme.colors, ...customTheme.colors },
        gradients: { ...prevTheme.gradients, ...customTheme.gradients },
        shadows: { ...prevTheme.shadows, ...customTheme.shadows },
        animations: { ...prevTheme.animations, ...customTheme.animations },
      }));
    }
  }, [customTheme]);

  const updateTheme = (newTheme: Partial<DashboardTheme>) => {
    setCustomTheme(newTheme);
    localStorage.setItem(`dashboard-theme-${dashboardType}`, JSON.stringify(newTheme));
  };

  const resetTheme = () => {
    setCustomTheme(null);
    setCurrentTheme(dashboardThemes[dashboardType]);
    localStorage.removeItem(`dashboard-theme-${dashboardType}`);
  };

  const switchTheme = (newDashboardType: keyof typeof dashboardThemes) => {
    setCurrentTheme(dashboardThemes[newDashboardType]);
    setCustomTheme(null);
  };  // Classes CSS générées dynamiquement
  const getThemeClasses = () => {
    // Protection contre les thèmes non initialisés
    if (!currentTheme || !currentTheme.colors) {
      return {
        background: 'min-h-screen bg-gray-100',
        card: 'bg-white shadow rounded-xl',
        button: 'bg-blue-600 text-white shadow',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        accent: 'text-blue-600',
      };
    }

    return {
      background: 'min-h-screen bg-gradient-to-br',
      card: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-md rounded-xl',
      button: 'bg-gradient-to-r text-white shadow-sm',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      accent: 'text-blue-600',
    };
  };
  // Variables CSS personnalisées pour les animations et couleurs
  const getCSSVariables = () => {
    if (!currentTheme || !currentTheme.colors) {
      return {};
    }

    return {
      '--dashboard-primary': currentTheme.colors.primary,
      '--dashboard-secondary': currentTheme.colors.secondary,
      '--dashboard-accent': currentTheme.colors.accent,
      '--dashboard-text': currentTheme.colors.text,
      '--dashboard-text-secondary': currentTheme.colors.textSecondary,
      '--dashboard-surface': currentTheme.colors.surface,
      '--dashboard-animation-duration': currentTheme.animations.duration,
      '--dashboard-animation-easing': currentTheme.animations.easing,
    } as React.CSSProperties;
  };

  return {
    theme: currentTheme,
    updateTheme,
    resetTheme,
    switchTheme,
    getThemeClasses,
    getCSSVariables,
    availableThemes: Object.keys(dashboardThemes),
  };
};
