'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  Card, 
  CardContent, 
  CardHeader,
  Typography, 
  Button, 
  TextField,
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { 
  Palette as PaletteIcon,
  Search as SeoIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Paintbrush as BrandingIcon, Layout as LayoutIcon } from 'lucide-react';
import { ChromePicker } from 'react-color';
import Grid from '@mui/material/Grid';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  homeName: string;
  homeTheme: string;
  isActive: boolean;
  customizations: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    branding: {
      storeName: string;
      logo?: string;
      favicon?: string;
    };
    layout: {
      style: 'default' | 'modern' | 'minimal';
      headerType: 'classic' | 'centered' | 'split';
      footerType: 'simple' | 'detailed' | 'minimal';
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
}

export default function VendorCustomizePage() {
  const { data: session } = useSession();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  
  // États pour les customisations
  const [colors, setColors] = useState({
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745'
  });
  
  const [branding, setBranding] = useState({
    storeName: '',
    logo: '',
    favicon: ''
  });
  
  const [layout, setLayout] = useState({
    style: 'default' as const,
    headerType: 'classic' as const,
    footerType: 'simple' as const
  });
  
  const [seo, setSeo] = useState({
    title: '',
    description: '',
    keywords: [] as string[],
    ogImage: ''
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (session?.user?.role === 'vendor') {
      fetchStoreData();
    }
  }, [session]);

  const fetchStoreData = async () => {
    try {
      const response = await fetch('/api/vendor/stores/customize');
      const data = await response.json();
      
      if (data.success) {
        const storeData = data.store;
        setStore(storeData);
        setColors(storeData.customizations.colors);
        setBranding(storeData.customizations.branding);
        setLayout(storeData.customizations.layout);
        setSeo(storeData.seo);
      } else {
        toast.error('Erreur lors du chargement des données');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/vendor/stores/customize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customizations: {
            colors,
            branding,
            layout
          },
          seo
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Customisations sauvegardées avec succès');
        fetchStoreData(); // Recharger les données
      } else {
        toast.error(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      const response = await fetch('/api/vendor/stores/customize/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customizations: {
            colors,
            branding,
            layout
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        window.open(data.previewData.previewUrl, '_blank');
      } else {
        toast.error('Erreur lors de la génération de la preview');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération de la preview');
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seo.keywords.includes(keywordInput.trim())) {
      setSeo({
        ...seo,
        keywords: [...seo.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeo({
      ...seo,
      keywords: seo.keywords.filter(k => k !== keyword)
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (!store) {
    return (
      <Alert severity="warning" className="m-6">
        Aucune store assignée. Veuillez d'abord demander une store dans la section "Sélection de Store".
      </Alert>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="font-bold">
            Customisation de "{store.homeName}"
          </Typography>
          <div className="flex items-center gap-2 mt-2">
            <Chip 
              label={store.isActive ? 'Active' : 'Inactive'} 
              color={store.isActive ? 'success' : 'default'}
              size="small"
            />
            <Chip label={store.homeTheme} variant="outlined" size="small" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStoreData}
          >
            Actualiser
          </Button>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
          >
            Aperçu
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Paper className="mb-6">
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab icon={<PaletteIcon />} label="Couleurs" />
          <Tab icon={<BrandingIcon />} label="Branding" />
          <Tab icon={<LayoutIcon />} label="Layout" />
          <Tab icon={<SeoIcon />} label="SEO" />
        </Tabs>
      </Paper>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* Onglet Couleurs */}
        {activeTab === 0 && (
          <Card>
            <CardHeader>
              <Typography variant="h6">Personnalisation des couleurs</Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {Object.entries(colors).map(([colorType, colorValue]) => (
                  <Box key={colorType} sx={{ width: { xs: '100%', md: 'calc(33.33% - 24px)' } }}>
                    <div className="space-y-2">
                      <Typography variant="subtitle2" className="capitalize">
                        Couleur {colorType === 'primary' ? 'primaire' : colorType === 'secondary' ? 'secondaire' : "d'accent"}
                      </Typography>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded border cursor-pointer"
                          style={{ backgroundColor: colorValue }}
                          onClick={() => setShowColorPicker(showColorPicker === colorType ? null : colorType)}
                        />
                        <TextField
                          value={colorValue}
                          onChange={(e) => setColors({ ...colors, [colorType]: e.target.value })}
                          size="small"
                          placeholder="#000000"
                        />
                      </div>
                      {showColorPicker === colorType && (
                        <div className="absolute z-10">
                          <div 
                            className="fixed inset-0" 
                            onClick={() => setShowColorPicker(null)}
                          />
                          <ChromePicker
                            color={colorValue}
                            onChange={(color: { hex: string }) => setColors({ ...colors, [colorType]: color.hex })}
                          />
                        </div>
                      )}
                    </div>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Onglet Branding */}
        {activeTab === 1 && (
          <Card>
            <CardHeader>
              <Typography variant="h6">Branding de la store</Typography>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                label="Nom de la store"
                fullWidth
                value={branding.storeName}
                onChange={(e) => setBranding({ ...branding, storeName: e.target.value })}
                helperText="Le nom affiché sur votre store"
              />
              
              <TextField
                label="URL du logo"
                fullWidth
                value={branding.logo}
                onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                helperText="URL de votre logo personnalisé"
              />
              
              <TextField
                label="URL du favicon"
                fullWidth
                value={branding.favicon}
                onChange={(e) => setBranding({ ...branding, favicon: e.target.value })}
                helperText="URL de votre favicon"
              />
            </CardContent>
          </Card>
        )}

        {/* Onglet Layout */}
        {activeTab === 2 && (
          <Card>
            <CardHeader>
              <Typography variant="h6">Configuration du layout</Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 24px)' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Style général</InputLabel>
                    <Select
                      value={layout.style}
                      label="Style général"
                      onChange={(e) => setLayout({ ...layout, style: e.target.value as any })}
                    >
                      <MenuItem value="default">Défaut</MenuItem>
                      <MenuItem value="modern">Moderne</MenuItem>
                      <MenuItem value="minimal">Minimal</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 24px)' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Type de header</InputLabel>
                    <Select
                      value={layout.headerType}
                      label="Type de header"
                      onChange={(e) => setLayout({ ...layout, headerType: e.target.value as any })}
                    >
                      <MenuItem value="classic">Classique</MenuItem>
                      <MenuItem value="centered">Centré</MenuItem>
                      <MenuItem value="split">Divisé</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 24px)' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Type de footer</InputLabel>
                    <Select
                      value={layout.footerType}
                      label="Type de footer"
                      onChange={(e) => setLayout({ ...layout, footerType: e.target.value as any })}
                    >
                      <MenuItem value="simple">Simple</MenuItem>
                      <MenuItem value="detailed">Détaillé</MenuItem>
                      <MenuItem value="minimal">Minimal</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Onglet SEO */}
        {activeTab === 3 && (
          <Card>
            <CardHeader>
              <Typography variant="h6">Optimisation SEO</Typography>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                label="Titre SEO"
                fullWidth
                value={seo.title}
                onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                helperText={`${seo.title.length}/60 caractères recommandés`}
              />
              
              <TextField
                label="Description SEO"
                fullWidth
                multiline
                rows={3}
                value={seo.description}
                onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                helperText={`${seo.description.length}/160 caractères recommandés`}
              />
              
              <div>
                <Typography variant="subtitle2" className="mb-2">
                  Mots-clés SEO
                </Typography>
                <div className="flex gap-2 mb-2">
                  <TextField
                    placeholder="Ajouter un mot-clé"
                    size="small"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword} variant="outlined" size="small">
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {seo.keywords.map((keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      onDelete={() => removeKeyword(keyword)}
                      size="small"
                    />
                  ))}
                </div>
              </div>
              
              <TextField
                label="Image Open Graph (URL)"
                fullWidth
                value={seo.ogImage}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                helperText="Image affichée lors du partage sur les réseaux sociaux"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
