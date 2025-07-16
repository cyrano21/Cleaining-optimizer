// components/ThemeManager.js
import React, { useState, useEffect, useMemo } from "react";

export default function ThemeManager({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
  });

  const themes = useMemo(() => ({
    default: {
      name: "🌈 Coloré (Défaut)",
      gradient: "from-pink-400 via-purple-500 to-indigo-600",
      headerGradient: "from-pink-500 via-purple-600 to-indigo-700",
      cardBg: "bg-white",
      textPrimary: "text-gray-800",
      textSecondary: "text-gray-600",
    },
    dark: {
      name: "🌙 Mode Sombre",
      gradient: "from-gray-900 via-purple-900 to-indigo-900",
      headerGradient: "from-gray-800 via-purple-800 to-indigo-800",
      cardBg: "bg-gray-800",
      textPrimary: "text-white",
      textSecondary: "text-gray-300",
    },
    ocean: {
      name: "🌊 Océan",
      gradient: "from-blue-400 via-cyan-500 to-teal-600",
      headerGradient: "from-blue-500 via-cyan-600 to-teal-700",
      cardBg: "bg-white",
      textPrimary: "text-gray-800",
      textSecondary: "text-gray-600",
    },
    sunset: {
      name: "🌅 Coucher de Soleil",
      gradient: "from-orange-400 via-red-500 to-pink-600",
      headerGradient: "from-orange-500 via-red-600 to-pink-700",
      cardBg: "bg-white",
      textPrimary: "text-gray-800",
      textSecondary: "text-gray-600",
    },
    forest: {
      name: "🌲 Forêt",
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      headerGradient: "from-green-500 via-emerald-600 to-teal-700",
      cardBg: "bg-white",
      textPrimary: "text-gray-800",
      textSecondary: "text-gray-600",
    },
    luxury: {
      name: "✨ Luxe",
      gradient: "from-yellow-400 via-yellow-500 to-orange-600",
      headerGradient: "from-yellow-500 via-yellow-600 to-orange-700",
      cardBg: "bg-white",
      textPrimary: "text-gray-800",
      textSecondary: "text-gray-600",
    },
    minimal: {
      name: "⚪ Minimal",
      gradient: "from-gray-100 via-gray-200 to-gray-300",
      headerGradient: "from-gray-200 via-gray-300 to-gray-400",
      cardBg: "bg-white",
      textPrimary: "text-gray-800",
      textSecondary: "text-gray-600",
    },
    custom: {
      name: "🎨 Personnalisé",
      gradient: "from-purple-400 via-pink-500 to-red-600",
      headerGradient: "from-purple-500 via-pink-600 to-red-700",
      cardBg: "bg-white",
      textPrimary: "text-gray-800",
      textSecondary: "text-gray-600",
    }
  }), []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("hotelTheme");
    if (savedTheme && themes[savedTheme]) {
      onThemeChange(savedTheme);
    }
  }, [themes, onThemeChange]);

  const handleThemeChange = (themeKey) => {
    onThemeChange(themeKey);
    localStorage.setItem("hotelTheme", themeKey);
    setIsOpen(false);
  };

  const generateCustomGradient = () => {
    const { primary, secondary, accent } = customColors;
    return {
      ...themes.custom,
      gradient: `from-[${primary}] via-[${secondary}] to-[${accent}]`,
      headerGradient: `from-[${primary}] via-[${secondary}] to-[${accent}]`,
    };
  };

  const currentThemeData = currentTheme === 'custom' 
    ? generateCustomGradient() 
    : themes[currentTheme] || themes.default;

  return (
    <div className="relative">
      {/* Bouton de thème flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        title="Changer le thème"
      >
        <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      </button>

      {/* Panel de sélection des thèmes */}
      {isOpen && (
        <div className="fixed top-20 left-4 z-50 bg-white rounded-xl shadow-2xl p-6 w-80 border border-gray-200 animate-slide-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">🎨 Choisir un thème</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                  currentTheme === key 
                    ? "border-indigo-500 bg-indigo-50" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.gradient}`}></div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">{theme.name}</div>
                    {currentTheme === key && (
                      <div className="text-xs text-indigo-600">✓ Actuel</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Couleurs personnalisées */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">🎨 Couleurs personnalisées</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Couleur principale</label>
                <input
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Couleur secondaire</label>
                <input
                  type="color"
                  value={customColors.secondary}
                  onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Couleur d'accent</label>
                <input
                  type="color"
                  value={customColors.accent}
                  onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                  className="w-full h-8 rounded border"
                />
              </div>
              <button
                onClick={() => handleThemeChange('custom')}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Appliquer le thème personnalisé
              </button>
            </div>
          </div>

          {/* Prévisualisation */}
          <div className="mt-4 p-3 rounded-lg border">
            <div className="text-xs text-gray-600 mb-2">Aperçu :</div>
            <div className={`h-16 rounded bg-gradient-to-r ${currentThemeData.gradient} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">Hôtel Cleaning Optimizer Pro</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}