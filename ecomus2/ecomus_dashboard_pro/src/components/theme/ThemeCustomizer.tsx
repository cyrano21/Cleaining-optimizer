"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Settings,
  Sparkles,
  RotateCcw,
  Save,
  Eye,
  Brush,
  Zap,
} from 'lucide-react';
import { useDashboardTheme, DashboardTheme, dashboardThemes } from '@/hooks/useDashboardTheme';

interface ThemeCustomizerProps {
  dashboardType: keyof typeof dashboardThemes;
  onThemeChange?: (theme: DashboardTheme) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  dashboardType,
  onThemeChange,
}) => {
  const { theme, updateTheme, resetTheme, switchTheme, availableThemes } = useDashboardTheme(dashboardType);
  const [isOpen, setIsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Protection contre les thèmes non initialisés
  if (!theme || !theme.colors) {
    return null; // Ne pas rendre le composant si le thème n'est pas prêt
  }

  const handleColorChange = (colorKey: keyof DashboardTheme['colors'], value: string) => {
    const newTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        [colorKey]: value,
      },
    };
    updateTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleGradientChange = (gradientKey: keyof DashboardTheme['gradients'], value: string) => {
    const newTheme = {
      ...theme,
      gradients: {
        ...theme.gradients,
        [gradientKey]: value,
      },
    };
    updateTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handlePresetChange = (presetName: keyof typeof dashboardThemes) => {
    switchTheme(presetName);
    onThemeChange?.(dashboardThemes[presetName]);
  };

  const colorPresets = [
    { name: 'Ocean', primary: '#0ea5e9', secondary: '#38bdf8', background: 'from-sky-50 via-blue-50 to-cyan-100' },
    { name: 'Forest', primary: '#059669', secondary: '#10b981', background: 'from-emerald-50 via-green-50 to-teal-100' },
    { name: 'Sunset', primary: '#ea580c', secondary: '#fb923c', background: 'from-orange-50 via-amber-50 to-yellow-100' },
    { name: 'Purple', primary: '#7c3aed', secondary: '#8b5cf6', background: 'from-purple-50 via-violet-50 to-pink-100' },
    { name: 'Dark', primary: '#374151', secondary: '#4b5563', background: 'from-gray-100 via-slate-50 to-zinc-100' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              size="icon"
            >
              <Palette className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-96"
          >
            <Card className="backdrop-blur-xl bg-white/90 border border-white/20 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Personnalisation
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPreviewMode(!previewMode)}
                    variant="outline"
                    size="sm"
                    className={previewMode ? 'bg-violet-100 border-violet-300' : ''}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Brush className="h-3 w-3" />
                    {theme?.name || 'Thème par défaut'}
                  </Badge>
                  <Badge variant="secondary">{dashboardType}</Badge>
                </div>

                <Tabs defaultValue="presets" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="presets">Presets</TabsTrigger>
                    <TabsTrigger value="colors">Couleurs</TabsTrigger>
                    <TabsTrigger value="advanced">Avancé</TabsTrigger>
                  </TabsList>

                  <TabsContent value="presets" className="space-y-3">                    <div className="grid grid-cols-2 gap-2">
                      {availableThemes.map((themeName) => {
                        const themeData = dashboardThemes[themeName as keyof typeof dashboardThemes];
                        if (!themeData) return null; // Protection contre les thèmes non définis
                        
                        return (
                          <Button
                            key={themeName}
                            onClick={() => handlePresetChange(themeName as keyof typeof dashboardThemes)}
                            variant={dashboardType === themeName ? "default" : "outline"}
                            className="h-12 text-xs"
                          >
                            {themeData.name}
                          </Button>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Palettes rapides</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {colorPresets.map((preset) => (
                          <Button
                            key={preset.name}
                            onClick={() => {
                              handleColorChange('primary', preset.primary);
                              handleColorChange('secondary', preset.secondary);
                              handleColorChange('background', preset.background);
                            }}
                            className="h-8 w-full p-0 rounded-lg border-2 border-transparent hover:border-white"
                            style={{
                              background: `linear-gradient(45deg, ${preset.primary}, ${preset.secondary})`,
                            }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(theme.colors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-xs font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={value.includes('#') ? value : '#3b82f6'}
                              onChange={(e) => handleColorChange(key as keyof DashboardTheme['colors'], e.target.value)}
                              className="w-12 h-8 p-1 border rounded"
                            />
                            <Input
                              type="text"
                              value={value}
                              onChange={(e) => handleColorChange(key as keyof DashboardTheme['colors'], e.target.value)}
                              className="flex-1 text-xs"
                              placeholder="Couleur ou classe CSS"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-3">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Durée d'animation</Label>
                        <Input
                          type="text"
                          value={theme.animations.duration}
                          onChange={(e) => updateTheme({
                            ...theme,
                            animations: { ...theme.animations, duration: e.target.value }
                          })}
                          placeholder="0.3s"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Easing</Label>
                        <Input
                          type="text"
                          value={theme.animations.easing}
                          onChange={(e) => updateTheme({
                            ...theme,
                            animations: { ...theme.animations, easing: e.target.value }
                          })}
                          placeholder="ease-in-out"
                          className="mt-1"
                        />
                      </div>

                      {Object.entries(theme.gradients).map(([key, value]) => (
                        <div key={key}>
                          <Label className="text-sm font-medium capitalize">
                            Gradient {key}
                          </Label>
                          <Input
                            type="text"
                            value={value}
                            onChange={(e) => handleGradientChange(key as keyof DashboardTheme['gradients'], e.target.value)}
                            placeholder="from-blue-500 to-purple-600"
                            className="mt-1 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={resetTheme}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    onClick={() => {
                      // Sauvegarder le thème et fermer
                      setIsOpen(false);
                    }}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Appliquer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeCustomizer;
