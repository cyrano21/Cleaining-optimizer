"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  X,
  Palette,
  Layout,
  Sun,
  Moon,
  Laptop,
  Settings,
  Monitor,
  Smartphone,
  Menu,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Upload,
  Zap,
  Type,
  Grid,
  Square,
  Circle,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import styles from "./theme-settings-modal.module.css";

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSettingsModal({
  isOpen,
  onClose,
}: ThemeSettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Theme Mode & Direction
  const [themeMode, setThemeMode] = useState("system");
  const [direction, setDirection] = useState("ltr");

  // Layout Settings
  const [layoutStyle, setLayoutStyle] = useState("boxed");
  const [pageStyle, setPageStyle] = useState("container-fluid");
  const [fullWidth, setFullWidth] = useState(false);

  // Menu Settings
  const [menuStyle, setMenuStyle] = useState("sidebar-mini");
  const [menuColor, setMenuColor] = useState("default");
  const [activeMenuStyle, setActiveMenuStyle] = useState("rounded-one-side");
  const [menuHidden, setMenuHidden] = useState(false);

  // Navbar Settings
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [navbarStyle, setNavbarStyle] = useState("default");

  // Card Settings
  const [cardStyle, setCardStyle] = useState("card-default");

  // Footer Settings
  const [footerSticky, setFooterSticky] = useState(false);

  // Color Settings
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [successColor, setSuccessColor] = useState("#10b981");
  const [infoColor, setInfoColor] = useState("#06b6d4");
  const [warningColor, setWarningColor] = useState("#f59e0b");
  const [dangerColor, setDangerColor] = useState("#ef4444");
  const [lightColor, setLightColor] = useState("#f8fafc");
  const [darkColor, setDarkColor] = useState("#1e293b");

  // Background Settings
  const [menuBgColor, setMenuBgColor] = useState("#ffffff");
  const [headerBgColor, setHeaderBgColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [backgroundImage, setBackgroundImage] = useState("none");

  // Advanced Settings
  const [appName, setAppName] = useState("Hope UI");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState([14]);
  const [storageType, setStorageType] = useState("localStorage");
  const [saveLocal, setSaveLocal] = useState(true);
  const [resetSettings, setResetSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSettingsFromStorage();
  }, []);

  // Load settings from localStorage
  const loadSettingsFromStorage = () => {
    if (typeof window !== "undefined" && saveLocal) {
      const saved = localStorage.getItem("hope-ui-theme-settings");
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          setThemeMode(settings.themeMode || "system");
          setDirection(settings.direction || "ltr");
          setLayoutStyle(settings.layoutStyle || "boxed");
          setMenuStyle(settings.menuStyle || "sidebar-mini");
          setMenuColor(settings.menuColor || "default");
          setActiveMenuStyle(settings.activeMenuStyle || "rounded-one-side");
          setPrimaryColor(settings.primaryColor || "#3b82f6");
          setAppName(settings.appName || "Hope UI");
          setFontFamily(settings.fontFamily || "Inter");
          // ... autres paramètres
        } catch (error) {
          console.error("Error loading theme settings:", error);
        }
      }
    }
  };

  // Save settings to localStorage
  const saveSettingsToStorage = () => {
    if (typeof window !== "undefined" && saveLocal) {
      const settings = {
        themeMode,
        direction,
        layoutStyle,
        pageStyle,
        fullWidth,
        menuStyle,
        menuColor,
        activeMenuStyle,
        menuHidden,
        navbarHidden,
        navbarStyle,
        cardStyle,
        footerSticky,
        primaryColor,
        secondaryColor,
        successColor,
        infoColor,
        warningColor,
        dangerColor,
        lightColor,
        darkColor,
        menuBgColor,
        headerBgColor,
        backgroundColor,
        backgroundImage,
        appName,
        fontFamily,
        fontSize: fontSize[0],
        storageType,
        saveLocal,
      };
      localStorage.setItem("hope-ui-theme-settings", JSON.stringify(settings));
    }
  };

  // Apply settings to the document
  const applySettings = () => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;

      // Apply theme mode
      setTheme(themeMode);

      // Apply direction
      root.setAttribute("dir", direction);

      // Apply CSS custom properties
      root.style.setProperty("--primary-color", primaryColor);
      root.style.setProperty("--secondary-color", secondaryColor);
      root.style.setProperty("--success-color", successColor);
      root.style.setProperty("--info-color", infoColor);
      root.style.setProperty("--warning-color", warningColor);
      root.style.setProperty("--danger-color", dangerColor);
      root.style.setProperty("--light-color", lightColor);
      root.style.setProperty("--dark-color", darkColor);
      root.style.setProperty("--menu-bg-color", menuBgColor);
      root.style.setProperty("--header-bg-color", headerBgColor);
      root.style.setProperty("--body-bg-color", backgroundColor);
      root.style.setProperty("--font-family", fontFamily);
      root.style.setProperty("--font-size", `${fontSize[0]}px`);

      // Apply layout classes
      document.body.className = `
        ${layoutStyle} 
        ${menuStyle} 
        ${menuColor} 
        ${activeMenuStyle}
        ${cardStyle}
        ${pageStyle}
        ${menuHidden ? "sidebar-none" : ""}
        ${navbarHidden ? "navbar-none" : ""}
        ${footerSticky ? "footer-sticky" : ""}
        ${fullWidth ? "full-width" : ""}
      `
        .trim()
        .replace(/\s+/g, " ");

      saveSettingsToStorage();
    }
  };

  // Reset to default settings
  const resetToDefaults = () => {
    setThemeMode("system");
    setDirection("ltr");
    setLayoutStyle("boxed");
    setPageStyle("container-fluid");
    setFullWidth(false);
    setMenuStyle("sidebar-mini");
    setMenuColor("default");
    setActiveMenuStyle("rounded-one-side");
    setMenuHidden(false);
    setNavbarHidden(false);
    setNavbarStyle("default");
    setCardStyle("card-default");
    setFooterSticky(false);
    setPrimaryColor("#3b82f6");
    setSecondaryColor("#64748b");
    setSuccessColor("#10b981");
    setInfoColor("#06b6d4");
    setWarningColor("#f59e0b");
    setDangerColor("#ef4444");
    setLightColor("#f8fafc");
    setDarkColor("#1e293b");
    setMenuBgColor("#ffffff");
    setHeaderBgColor("#ffffff");
    setBackgroundColor("#f8fafc");
    setBackgroundImage("none");
    setAppName("Hope UI");
    setFontFamily("Inter");
    setFontSize([14]);
    setStorageType("localStorage");
    setSaveLocal(true);

    if (typeof window !== "undefined") {
      localStorage.removeItem("hope-ui-theme-settings");
    }
  };

  // Export settings
  const exportSettings = () => {
    const settings = {
      themeMode,
      direction,
      layoutStyle,
      pageStyle,
      fullWidth,
      menuStyle,
      menuColor,
      activeMenuStyle,
      menuHidden,
      navbarHidden,
      navbarStyle,
      cardStyle,
      footerSticky,
      primaryColor,
      secondaryColor,
      successColor,
      infoColor,
      warningColor,
      dangerColor,
      lightColor,
      darkColor,
      menuBgColor,
      headerBgColor,
      backgroundColor,
      backgroundImage,
      appName,
      fontFamily,
      fontSize: fontSize[0],
      storageType,
      saveLocal,
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hope-ui-theme-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import settings
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          // Apply imported settings
          Object.entries(settings).forEach(([key, value]) => {
            switch (key) {
              case "themeMode":
                setThemeMode(value as string);
                break;
              case "direction":
                setDirection(value as string);
                break;
              case "layoutStyle":
                setLayoutStyle(value as string);
                break;
              case "menuStyle":
                setMenuStyle(value as string);
                break;
              case "primaryColor":
                setPrimaryColor(value as string);
                break;
              // ... autres cas
            }
          });
        } catch (error) {
          console.error("Error importing settings:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Helper function to get font class
  const getFontClass = (fontName: string): string => {
    const fontMap: { [key: string]: string } = {
      Inter: styles.fontInter,
      Roboto: styles.fontRoboto,
      "Open Sans": styles.fontOpenSans,
      Lato: styles.fontLato,
      Montserrat: styles.fontMontserrat,
      Poppins: styles.fontPoppins,
      Nunito: styles.fontNunito,
      "Source Sans Pro": styles.fontSourceSans,
    };
    return fontMap[fontName] || "";
  };

  if (!mounted) return null;
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const themeOptions = [
    {
      value: "light",
      label: "Clair",
      icon: Sun,
      description: "Interface claire et lumineuse",
    },
    {
      value: "dark",
      label: "Sombre",
      icon: Moon,
      description: "Interface sombre pour réduire la fatigue oculaire",
    },
    {
      value: "system",
      label: "Auto",
      icon: Laptop,
      description: "Suit automatiquement les préférences de votre système",
    },
  ];

  const colorPresets = [
    { name: "Bleu", color: "#3b82f6", class: "bg-blue-500" },
    { name: "Violet", color: "#8b5cf6", class: "bg-violet-500" },
    { name: "Vert", color: "#10b981", class: "bg-green-500" },
    { name: "Orange", color: "#f59e0b", class: "bg-orange-500" },
    { name: "Rouge", color: "#ef4444", class: "bg-red-500" },
    { name: "Rose", color: "#ec4899", class: "bg-pink-500" },
    { name: "Indigo", color: "#6366f1", class: "bg-indigo-500" },
    { name: "Cyan", color: "#06b6d4", class: "bg-cyan-500" },
  ];

  const menuStyles = [
    {
      value: "sidebar-mini",
      label: "Mini",
      description: "Menu compact avec icônes",
    },
    {
      value: "sidebar-hover",
      label: "Hover",
      description: "Menu s'étend au survol",
    },
    {
      value: "sidebar-boxed",
      label: "Encadré",
      description: "Menu dans un cadre",
    },
    {
      value: "sidebar-soft",
      label: "Doux",
      description: "Menu avec coins arrondis",
    },
  ];

  const menuColors = [
    { value: "default", label: "Par défaut", description: "Couleur standard" },
    { value: "dark", label: "Sombre", description: "Menu avec fond sombre" },
    {
      value: "color",
      label: "Coloré",
      description: "Menu avec couleur primaire",
    },
    {
      value: "transparent",
      label: "Transparent",
      description: "Menu transparent",
    },
    { value: "glass", label: "Verre", description: "Effet de verre" },
  ];

  const activeMenuStyles = [
    { value: "rounded-one-side", label: "Arrondi d'un côté" },
    { value: "rounded-all", label: "Complètement arrondi" },
    { value: "right-bordered", label: "Bordure droite" },
    { value: "fill", label: "Remplissage complet" },
  ];

  const cardStyles = [
    {
      value: "card-default",
      label: "Par défaut",
      description: "Style de carte standard",
    },
    {
      value: "card-glass",
      label: "Verre",
      description: "Effet de verre transparent",
    },
    {
      value: "card-border",
      label: "Bordure",
      description: "Carte avec bordure visible",
    },
  ];

  const fontFamilies = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Source Sans Pro",
    "Nunito",
    "Ubuntu",
    "Raleway",
  ];

  const backgroundPatterns = [
    { name: "Aucun", value: "none", preview: "bg-gray-100" },
    {
      name: "Géométrique 1",
      value: "pattern1",
      preview: "bg-gradient-to-br from-blue-50 to-indigo-100",
    },
    {
      name: "Géométrique 2",
      value: "pattern2",
      preview: "bg-gradient-to-br from-purple-50 to-pink-100",
    },
    {
      name: "Géométrique 3",
      value: "pattern3",
      preview: "bg-gradient-to-br from-green-50 to-emerald-100",
    },
    {
      name: "Dots",
      value: "dots",
      preview: "bg-gradient-to-br from-orange-50 to-red-100",
    },
    {
      name: "Lignes",
      value: "lines",
      preview: "bg-gradient-to-br from-cyan-50 to-blue-100",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50"
      onClick={handleOverlayClick}

    >
      <div
        className="h-full w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"

      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50"

        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2
                className="text-lg font-semibold text-gray-900"

              >
                Live Customizer
              </h2>
              <p className="text-sm text-gray-600">
                Personnalisez votre interface en temps réel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={exportSettings}
              title="Exporter les paramètres"

            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                document.getElementById("import-settings")?.click()
              }
              title="Importer les paramètres"

            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetToDefaults}
              title="Réinitialiser"

            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}

            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Hidden file input for import */}
        <input
          id="import-settings"
          type="file"
          accept=".json"
          className="hidden"
          onChange={importSettings}

          aria-label="Importer un fichier de paramètres"
          title="Sélectionner un fichier JSON de paramètres à importer"
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="theme" className="space-y-6">
            <TabsList
              className="grid w-full grid-cols-4 p-1"

            >
              <TabsTrigger
                value="theme"
                className="flex items-center gap-1 text-xs"

              >
                <Palette className="h-3 w-3" />
                Thème
              </TabsTrigger>
              <TabsTrigger
                value="layout"
                className="flex items-center gap-1 text-xs"

              >
                <Layout className="h-3 w-3" />
                Layout
              </TabsTrigger>
              <TabsTrigger
                value="colors"
                className="flex items-center gap-1 text-xs"

              >
                <Circle className="h-3 w-3" />
                Couleurs
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex items-center gap-1 text-xs"

              >
                <Zap className="h-3 w-3" />
                Avancé
              </TabsTrigger>
            </TabsList>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6">
              {/* Theme Mode */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-base flex items-center gap-2"

                  >
                    <Monitor className="h-4 w-4" />
                    Mode de thème
                  </CardTitle>
                  <CardDescription>
                    Choisissez entre clair, sombre ou automatique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                          themeMode === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setThemeMode(option.value)}

                      >
                        <div
                          className="flex flex-col items-center text-center"

                        >
                          <option.icon
                            className="h-6 w-6 mb-2"

                          />

                          <span
                            className="text-sm font-medium"

                          >
                            {option.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Direction */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-base flex items-center gap-2"

                  >
                    <ArrowLeft className="h-4 w-4" />
                    Direction
                  </CardTitle>
                  <CardDescription>
                    Configuration de la direction du texte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        direction === "ltr"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setDirection("ltr")}

                    >
                      <div
                        className="flex items-center gap-2"

                      >
                        <ArrowRight className="h-4 w-4" />
                        <span
                          className="text-sm font-medium"

                        >
                          LTR (Gauche à droite)
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        direction === "rtl"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setDirection("rtl")}

                    >
                      <div
                        className="flex items-center gap-2"

                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span
                          className="text-sm font-medium"

                        >
                          RTL (Droite à gauche)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent
              value="layout"
              className="space-y-6"

            >
              {/* Menu Style */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-base flex items-center gap-2"

                  >
                    <Menu className="h-4 w-4" />
                    Style de menu
                  </CardTitle>
                  <CardDescription>
                    Choisissez le style d'affichage du menu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {menuStyles.map((style) => (
                      <div
                        key={style.value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          menuStyle === style.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setMenuStyle(style.value)}

                      >
                        <div className="text-sm font-medium">
                          {style.label}
                        </div>
                        <div
                          className="text-xs text-gray-500 mt-1"

                        >
                          {style.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Menu Color */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Couleur du menu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {menuColors.map((color) => (
                      <div
                        key={color.value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          menuColor === color.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setMenuColor(color.value)}

                      >
                        <div
                          className="flex justify-between items-center"

                        >
                          <div>
                            <div
                              className="text-sm font-medium"

                            >
                              {color.label}
                            </div>
                            <div
                              className="text-xs text-gray-500"

                            >
                              {color.description}
                            </div>
                          </div>
                          {menuColor === color.value && (
                            <div
                              className="h-2 w-2 bg-blue-500 rounded-full"

                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Menu Style */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Style de menu actif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeMenuStyles.map((style) => (
                      <div
                        key={style.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          activeMenuStyle === style.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveMenuStyle(style.value)}

                      >
                        <div className="text-sm font-medium">
                          {style.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Layout Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Options de layout
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="flex items-center justify-between"

                  >
                    <div>
                      <label
                        htmlFor="menu-hidden"
                        className="font-medium"

                      >
                        Masquer le menu
                      </label>
                      <p className="text-sm text-gray-500">
                        Cacher complètement le menu latéral
                      </p>
                    </div>
                    <Switch
                      id="menu-hidden"
                      checked={menuHidden}
                      onCheckedChange={setMenuHidden}

                    />
                  </div>

                  <Separator />

                  <div
                    className="flex items-center justify-between"

                  >
                    <div>
                      <label
                        htmlFor="navbar-hidden"
                        className="font-medium"

                      >
                        Masquer la navbar
                      </label>
                      <p className="text-sm text-gray-500">
                        Cacher la barre de navigation
                      </p>
                    </div>
                    <Switch
                      id="navbar-hidden"
                      checked={navbarHidden}
                      onCheckedChange={setNavbarHidden}

                    />
                  </div>

                  <Separator />

                  <div
                    className="flex items-center justify-between"

                  >
                    <div>
                      <label
                        htmlFor="footer-sticky"
                        className="font-medium"

                      >
                        Footer collant
                      </label>
                      <p className="text-sm text-gray-500">
                        Maintenir le footer en bas de page
                      </p>
                    </div>
                    <Switch
                      id="footer-sticky"
                      checked={footerSticky}
                      onCheckedChange={setFooterSticky}

                    />
                  </div>
                </CardContent>
              </Card>

              {/* Card Style */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-base flex items-center gap-2"

                  >
                    <Square className="h-4 w-4" />
                    Style des cartes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cardStyles.map((style) => (
                      <div
                        key={style.value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          cardStyle === style.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setCardStyle(style.value)}

                      >
                        <div className="text-sm font-medium">
                          {style.label}
                        </div>
                        <div
                          className="text-xs text-gray-500 mt-1"

                        >
                          {style.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent
              value="colors"
              className="space-y-6"

            >
              {/* Color Customizer */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-base flex items-center gap-2"

                  >
                    <Palette className="h-4 w-4" />
                    Personnalisateur de couleurs
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez des thèmes prédéfinis ou créez vos propres
                    couleurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Preset Colors */}
                    <div>
                      <label
                        className="text-sm font-medium mb-3 block"

                      >
                        Thèmes prédéfinis
                      </label>
                      <div
                        className="grid grid-cols-4 gap-3"

                      >
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.color}
                            className={`relative h-16 w-full rounded-lg border-2 transition-all hover:scale-105 group ${
                              primaryColor === preset.color
                                ? "border-gray-900 ring-2 ring-offset-2 ring-gray-900"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setPrimaryColor(preset.color)}
                            title={preset.name}

                          >
                            <div
                              className={`w-full h-full rounded-md ${preset.class}`}

                            />

                            {primaryColor === preset.color && (
                              <div
                                className="absolute inset-0 flex items-center justify-center"

                              >
                                <div
                                  className="h-4 w-4 rounded-full bg-white shadow-lg"

                                />
                              </div>
                            )}
                            <div
                              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"

                            >
                              {preset.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Primary Color */}
                    <div className="pt-4 border-t">
                      <label
                        className="text-sm font-medium mb-3 block"

                      >
                        Couleur primaire personnalisée
                      </label>
                      <div
                        className="flex items-center gap-3"

                      >
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"

                          aria-label="Couleur primaire"
                          title="Sélectionner la couleur primaire"
                        />

                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          placeholder="#3b82f6"
                          className="font-mono"

                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Colors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Couleurs du système
                  </CardTitle>
                  <CardDescription>
                    Personnalisez toutes les couleurs de l'interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"

                      >
                        Secondaire
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur secondaire"
                          title="Sélectionner la couleur secondaire"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {secondaryColor}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"

                      >
                        Succès
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={successColor}
                          onChange={(e) => setSuccessColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur de succès"
                          title="Sélectionner la couleur de succès"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {successColor}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"

                      >
                        Information
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={infoColor}
                          onChange={(e) => setInfoColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur d'information"
                          title="Sélectionner la couleur d'information"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {infoColor}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"

                      >
                        Avertissement
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={warningColor}
                          onChange={(e) => setWarningColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur d'avertissement"
                          title="Sélectionner la couleur d'avertissement"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {warningColor}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"

                      >
                        Danger
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={dangerColor}
                          onChange={(e) => setDangerColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur de danger"
                          title="Sélectionner la couleur de danger"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {dangerColor}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium mb-2 block"

                      >
                        Sombre
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={darkColor}
                          onChange={(e) => setDarkColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur sombre"
                          title="Sélectionner la couleur sombre"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {darkColor}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background Colors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Arrière-plans
                  </CardTitle>
                  <CardDescription>
                    Couleurs des différentes zones de l'interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div
                      className="flex items-center justify-between"

                    >
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Menu
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={menuBgColor}
                          onChange={(e) => setMenuBgColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur de fond du menu"
                          title="Sélectionner la couleur de fond du menu"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {menuBgColor}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between"

                    >
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        En-tête
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={headerBgColor}
                          onChange={(e) => setHeaderBgColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur de fond de l'en-tête"
                          title="Sélectionner la couleur de fond de l'en-tête"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {headerBgColor}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between"

                    >
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Corps
                      </label>
                      <div
                        className="flex items-center gap-2"

                      >
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="h-8 w-12 rounded border"

                          aria-label="Couleur de fond du corps"
                          title="Sélectionner la couleur de fond du corps"
                        />

                        <Badge
                          variant="outline"
                          className="text-xs font-mono"

                        >
                          {backgroundColor}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background Image */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-base flex items-center gap-2"

                  >
                    <ImageIcon className="h-4 w-4" />
                    Image d'arrière-plan
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez un motif d'arrière-plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {backgroundPatterns.map((pattern) => (
                      <div
                        key={pattern.value}
                        className={`aspect-square rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                          backgroundImage === pattern.value
                            ? "border-blue-500 ring-2 ring-offset-2 ring-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setBackgroundImage(pattern.value)}
                        title={pattern.name}

                      >
                        <div
                          className={`w-full h-full rounded-md ${pattern.preview} flex items-center justify-center`}

                        >
                          <span
                            className="text-xs text-gray-600 font-medium text-center px-2"

                          >
                            {pattern.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent
              value="advanced"
              className="space-y-6"

            >
              {/* App Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-base flex items-center gap-2"

                  >
                    <Zap className="h-4 w-4" />
                    Paramètres de l'application
                  </CardTitle>
                  <CardDescription>
                    Configuration avancée de l'interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="app-name"
                      className="text-sm font-medium mb-2 block"

                    >
                      Nom de l'application
                    </label>
                    <Input
                      id="app-name"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Hope UI"

                    />
                  </div>

                  <div>
                    <label
                      htmlFor="font-family"
                      className="text-sm font-medium mb-2 block"

                    >
                      Police de caractères
                    </label>
                    <Select
                      value={fontFamily}
                      onValueChange={setFontFamily}

                    >
                      <SelectTrigger id="font-family">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem
                            key={font}
                            value={font}

                          >
                            <span>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      className="text-sm font-medium mb-2 block"

                    >
                      Taille de police: {fontSize[0]}px
                    </label>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={12}
                      max={20}
                      step={1}
                      className="py-4"

                    />

                    <div
                      className="flex justify-between text-xs text-gray-500 mt-1"

                    >
                      <span>12px</span>
                      <span>20px</span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="page-style"
                      className="text-sm font-medium mb-2 block"

                    >
                      Style de page
                    </label>
                    <Select
                      value={pageStyle}
                      onValueChange={setPageStyle}

                    >
                      <SelectTrigger id="page-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="container-fluid">
                          Container Fluide
                        </SelectItem>
                        <SelectItem value="container">
                          Container Fixe
                        </SelectItem>
                        <SelectItem value="container-sm">
                          Container Small
                        </SelectItem>
                        <SelectItem value="container-lg">
                          Container Large
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Storage Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Stockage des paramètres
                  </CardTitle>
                  <CardDescription>
                    Gestion de la sauvegarde des préférences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="storage-type"
                      className="text-sm font-medium mb-2 block"

                    >
                      Type de stockage
                    </label>
                    <Select
                      value={storageType}
                      onValueChange={setStorageType}

                    >
                      <SelectTrigger id="storage-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="localStorage">
                          Local Storage
                        </SelectItem>
                        <SelectItem value="sessionStorage">
                          Session Storage
                        </SelectItem>
                        <SelectItem value="none">
                          Aucun stockage
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div
                    className="flex items-center justify-between pt-4 border-t"

                  >
                    <div>
                      <label
                        htmlFor="save-local"
                        className="font-medium"

                      >
                        Sauvegarder localement
                      </label>
                      <p className="text-sm text-gray-500">
                        Conserver les paramètres dans le navigateur
                      </p>
                    </div>
                    <Switch
                      id="save-local"
                      checked={saveLocal}
                      onCheckedChange={setSaveLocal}

                    />
                  </div>
                </CardContent>
              </Card>

              {/* Reset Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-base text-red-600"

                  >
                    Zone de danger
                  </CardTitle>
                  <CardDescription>
                    Actions irréversibles de réinitialisation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={resetToDefaults}
                    className="w-full"

                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Réinitialiser tous les paramètres
                  </Button>
                  <p
                    className="text-sm text-gray-500 mt-2 text-center"

                  >
                    Cette action supprimera tous vos paramètres personnalisés
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"

            >
              Fermer
            </Button>
            <Button
              onClick={applySettings}
              className="flex-1"

            >
              <Zap className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          </div>
          <p
            className="text-xs text-gray-500 text-center mt-2"

          >
            Les changements sont appliqués en temps réel
          </p>
        </div>
      </div>
    </div>
  );
}
