/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Utiliser la classe .dark pour le mode sombre
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // indigo-600
        "primary-dark": "#4338CA", // indigo-700
        "primary-darker": "#3730A3", // indigo-800 - amélioration du contraste
        secondary: "#10B981", // emerald-500
        "secondary-dark": "#059669", // emerald-600 - amélioration du contraste
        accent: "#F59E0B", // amber-500
        "accent-dark": "#D97706", // amber-600 - amélioration du contraste
        // Nouvelles couleurs pour meilleur contraste
        "success": "#059669", // emerald-600
        "error": "#DC2626", // red-600
        "warning": "#D97706", // amber-600
        "info": "#2563EB", // blue-600
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      backgroundColor: {
        // Mode clair
        "lesson-light": "#ffffff",
        "primary-light": "#ffffff",
        "secondary-light": "#f8fafc", // slate-50 - plus de contraste
        "tertiary-light": "#f1f5f9", // slate-100 - plus de contraste
        "highlight-light": "#ecf0ff", // Indigo très clair pour mise en évidence
        "nav-light": "#f0f9ff", // slate-100 - plus de contraste pour navigation
        "card-light": "#ffffff",
        "button-light": "#4F46E5", // indigo-600 
        
        // Mode sombre
        "lesson-dark": "#0f172a", // slate-900 - meilleur contraste
        "primary-dark": "#0f172a", // slate-900
        "secondary-dark": "#1e293b", // slate-800 - meilleur contraste
        "tertiary-dark": "#334155", // slate-700 - meilleur contraste 
        "highlight-dark": "#312e81", // indigo-900 - meilleur contraste
        "nav-dark": "#1e293b", // slate-800 - meilleur contraste pour navigation
        "card-dark": "#1e293b", // slate-800
        "button-dark": "#4F46E5", // indigo-600
      },
      textColor: {
        // Mode clair
        "lesson-light": "#0f172a", // slate-900 - meilleur contraste
        "primary-light": "#0f172a", // slate-900 - meilleur contraste
        "secondary-light": "#334155", // slate-700 - meilleur contraste
        "tertiary-light": "#64748b", // slate-500
        "muted-light": "#94a3b8", // slate-400
        "link-light": "#4F46E5", // indigo-600
        "button-text-light": "#ffffff", // Blanc pour texte des boutons
        
        // Mode sombre
        "lesson-dark": "#f8fafc", // slate-50 - meilleur contraste
        "primary-dark": "#f8fafc", // slate-50 - meilleur contraste
        "secondary-dark": "#e2e8f0", // slate-200 - meilleur contraste
        "tertiary-dark": "#cbd5e1", // slate-300
        "muted-dark": "#94a3b8", // slate-400
        "link-dark": "#818cf8", // indigo-400 - meilleur contraste
        "button-text-dark": "#ffffff", // Blanc pour texte des boutons
      },
      boxShadow: {
        "text-enhance": "0 0 2px rgba(0,0,0,0.3)",
        "text-enhance-dark": "0 0 2px rgba(255,255,255,0.3)",
        // Nouvelles ombres pour améliorer le contraste visuel
        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "nav": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "button": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "button-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "focus": "0 0 0 3px rgba(79, 70, 229, 0.45)",
      },
      borderColor: {
        "light-border": "#e2e8f0", // slate-200
        "medium-border": "#cbd5e1", // slate-300
        "dark-border": "#94a3b8", // slate-400
        "primary-border": "#4F46E5", // indigo-600
        "secondary-border": "#10B981", // emerald-500
        "accent-border": "#F59E0B", // amber-500
        "focus-border": "#4F46E5", // indigo-600
      },
      borderRadius: {
        'card': '0.75rem', // 12px
        'button': '0.5rem', // 8px
        'tag': '0.375rem', // 6px
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    // Ajouter un plugin pour générer automatiquement des classes de contraste
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow-light": {
          textShadow: "0 0 1px rgba(0,0,0,0.2)",
        },
        ".text-shadow-dark": {
          textShadow: "0 0 1px rgba(255,255,255,0.2)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
  safelist: [
    // Uniquement les classes essentielles qui sont générées dynamiquement
    "bg-indigo-600",
    "bg-indigo-700",
    "bg-green-500",
    "bg-red-500",
    "text-green-500",
    "text-red-500",
    "border-green-500",
    "border-red-500",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
