"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Store,
  Palette,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Camera,
  Upload,
  Settings,
  Building,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface StoreSettings {
  // Informations de base
  name: string;
  description: string;
  logo: string;
  banner: string;

  // Contact
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Personnalisation
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;

  // Réseaux sociaux
  socialMedia: {
    website: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };

  // Paramètres commerciaux
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;

  // Paramètres de visibilité
  isPublic: boolean;
  featured: boolean;

  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: "",
    description: "",
    logo: "",
    banner: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    primaryColor: "#1F2937",
    accentColor: "#3B82F6",
    secondaryColor: "#6B7280",
    socialMedia: {
      website: "",
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
    currency: "EUR",
    taxRate: 20,
    freeShippingThreshold: 50,
    isPublic: true,
    featured: false,
    seo: {
      title: "",
      description: "",
      keywords: [],
    },
  });

  const [newKeyword, setNewKeyword] = useState("");

  // Charger les données de la boutique
  useEffect(() => {
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vendor/store/current");
      const result = await response.json();

      if (response.ok && result.success) {
        const store = result.store;
        setStoreSettings({
          name: store.name || "",
          description: store.description || "",
          logo: store.logo || store.logoUrl || "",
          banner: store.banner || "",
          email: store.email || store.contact?.email || "",
          phone: store.phone || store.contact?.phone || "",
          address: {
            street: store.address?.street || "",
            city: store.address?.city || "",
            state: store.address?.state || "",
            postalCode: store.address?.postalCode || "",
            country: store.address?.country || "",
          },
          primaryColor:
            store.primaryColor ||
            store.customizations?.colors?.primary ||
            "#1F2937",
          accentColor:
            store.accentColor ||
            store.customizations?.colors?.accent ||
            "#3B82F6",
          secondaryColor:
            store.secondaryColor ||
            store.customizations?.colors?.secondary ||
            "#6B7280",
          socialMedia: {
            website: store.socialMedia?.website || "",
            facebook: store.socialMedia?.facebook || "",
            instagram: store.socialMedia?.instagram || "",
            twitter: store.socialMedia?.twitter || "",
            linkedin: "",
          },
          currency: store.settings?.currency || "EUR",
          taxRate: store.settings?.taxRate || 20,
          freeShippingThreshold: store.settings?.freeShippingThreshold || 50,
          isPublic: store.isPublic !== false,
          featured: store.featured || false,
          seo: {
            title: store.seo?.title || "",
            description: store.seo?.description || "",
            keywords: store.seo?.keywords || [],
          },
        });
      } else {
        toast.error("Erreur lors du chargement des paramètres");
      }
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch("/api/vendor/store/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storeSettings),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Paramètres sauvegardés avec succès!");
      } else {
        toast.error(result.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStoreSettings((prev) => ({
          ...prev,
          logo: result.data.url,
        }));
        toast.success("Logo mis à jour avec succès!");
      } else {
        toast.error(result.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur upload logo:", error);
      toast.error("Erreur lors de l'upload du logo");
    }
  };

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "banner");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStoreSettings((prev) => ({
          ...prev,
          banner: result.data.url,
        }));
        toast.success("Bannière mise à jour avec succès!");
      } else {
        toast.error(result.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur upload bannière:", error);
      toast.error("Erreur lors de l'upload de la bannière");
    }
  };

  const addKeyword = () => {
    if (
      newKeyword.trim() &&
      !storeSettings.seo.keywords.includes(newKeyword.trim())
    ) {
      setStoreSettings((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, newKeyword.trim()],
        },
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setStoreSettings((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter((_, i) => i !== index),
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Chargement des paramètres...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Paramètres de la Boutique
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les paramètres de votre boutique et personnalisez son
            apparence
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
          <TabsTrigger value="business">Commerce</TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations de base */}
            <GlassmorphismCard className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Informations de base
                </CardTitle>
                <CardDescription>
                  Configurez les informations principales de votre boutique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la boutique *</Label>
                  <Input
                    id="name"
                    value={storeSettings.name}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Nom de votre boutique"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={storeSettings.description}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description de votre boutique"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo de la boutique</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                      {storeSettings.logo ? (
                        <img
                          src={storeSettings.logo}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                        aria-label="Sélectionner un fichier pour le logo"
                      />
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Changer le logo
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bannière de la boutique</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                      {storeSettings.banner ? (
                        <img
                          src={storeSettings.banner}
                          alt="Bannière"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Globe className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        id="banner-upload"
                        aria-label="Sélectionner un fichier pour la bannière"
                      />
                      <Label htmlFor="banner-upload" className="cursor-pointer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Changer la bannière
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassmorphismCard>

            {/* Paramètres de visibilité */}
            <GlassmorphismCard className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visibilité
                </CardTitle>
                <CardDescription>
                  Contrôlez la visibilité de votre boutique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Boutique publique</Label>
                    <p className="text-sm text-gray-600">
                      Rendre la boutique visible publiquement
                    </p>
                  </div>
                  <Switch
                    checked={storeSettings.isPublic}
                    onCheckedChange={(checked) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        isPublic: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Boutique en vedette</Label>
                    <p className="text-sm text-gray-600">
                      Mettre en avant la boutique
                    </p>
                  </div>
                  <Switch
                    checked={storeSettings.featured}
                    onCheckedChange={(checked) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        featured: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </GlassmorphismCard>
          </div>

          {/* SEO */}
          <GlassmorphismCard className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Optimisation SEO
              </CardTitle>
              <CardDescription>
                Améliorez le référencement de votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Titre SEO</Label>
                  <Input
                    id="seo-title"
                    value={storeSettings.seo.title}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, title: e.target.value },
                      }))
                    }
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-description">Description SEO</Label>
                  <Textarea
                    id="seo-description"
                    value={storeSettings.seo.description}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, description: e.target.value },
                      }))
                    }
                    placeholder="Description pour les moteurs de recherche"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mots-clés SEO</Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Ajouter un mot-clé"
                    onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                  />
                  <Button onClick={addKeyword} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {storeSettings.seo.keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(index)}
                        className="ml-1 hover:text-red-500"
                        aria-label={`Supprimer le mot-clé ${keyword}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </GlassmorphismCard>
        </TabsContent>

        {/* Onglet Apparence */}
        <TabsContent value="appearance" className="space-y-6">
          <GlassmorphismCard className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Personnalisation des couleurs
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Couleur principale</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={storeSettings.primaryColor}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="w-16 h-10"
                      title="Sélectionner la couleur principale"
                    />
                    <Input
                      value={storeSettings.primaryColor}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      placeholder="#1F2937"
                      title="Code hexadécimal de la couleur principale"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent-color">Couleur d'accent</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={storeSettings.accentColor}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          accentColor: e.target.value,
                        }))
                      }
                      className="w-16 h-10"
                      title="Sélectionner la couleur d'accent"
                    />
                    <Input
                      value={storeSettings.accentColor}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          accentColor: e.target.value,
                        }))
                      }
                      placeholder="#3B82F6"
                      title="Code hexadécimal de la couleur d'accent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Couleur secondaire</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={storeSettings.secondaryColor}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      className="w-16 h-10"
                      title="Sélectionner la couleur secondaire"
                    />
                    <Input
                      value={storeSettings.secondaryColor}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      placeholder="#6B7280"
                      title="Code hexadécimal de la couleur secondaire"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Aperçu des couleurs</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: storeSettings.primaryColor }}
                    />
                    <span className="text-sm">Principale</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: storeSettings.accentColor }}
                    />
                    <span className="text-sm">Accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: storeSettings.secondaryColor }}
                    />
                    <span className="text-sm">Secondaire</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </GlassmorphismCard>
        </TabsContent>

        {/* Onglet Contact */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations de contact */}
            <GlassmorphismCard className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Informations de contact
                </CardTitle>
                <CardDescription>Coordonnées de votre boutique</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="contact@boutique.fr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={storeSettings.phone}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </CardContent>
            </GlassmorphismCard>

            {/* Adresse */}
            <GlassmorphismCard className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adresse
                </CardTitle>
                <CardDescription>Adresse de votre boutique</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Rue</Label>
                  <Input
                    id="street"
                    value={storeSettings.address.street}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value },
                      }))
                    }
                    placeholder="123 Rue de la Paix"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={storeSettings.address.city}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value },
                        }))
                      }
                      placeholder="Paris"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Code postal</Label>
                    <Input
                      id="postal-code"
                      value={storeSettings.address.postalCode}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            postalCode: e.target.value,
                          },
                        }))
                      }
                      placeholder="75001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Région/État</Label>
                    <Input
                      id="state"
                      value={storeSettings.address.state}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          address: { ...prev.address, state: e.target.value },
                        }))
                      }
                      placeholder="Île-de-France"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={storeSettings.address.country}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          address: { ...prev.address, country: e.target.value },
                        }))
                      }
                      placeholder="France"
                    />
                  </div>
                </div>
              </CardContent>
            </GlassmorphismCard>
          </div>
        </TabsContent>

        {/* Onglet Réseaux sociaux */}
        <TabsContent value="social" className="space-y-6">
          <GlassmorphismCard className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Réseaux sociaux
              </CardTitle>
              <CardDescription>
                Liens vers vos réseaux sociaux et votre site web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={storeSettings.socialMedia.website}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        website: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://www.boutique.fr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={storeSettings.socialMedia.facebook}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        facebook: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://facebook.com/boutique"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={storeSettings.socialMedia.instagram}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        instagram: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://instagram.com/boutique"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  type="url"
                  value={storeSettings.socialMedia.twitter}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        twitter: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://twitter.com/boutique"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={storeSettings.socialMedia.linkedin}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        linkedin: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://linkedin.com/company/boutique"
                />
              </div>
            </CardContent>
          </GlassmorphismCard>
        </TabsContent>

        {/* Onglet Commerce */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paramètres commerciaux */}
            <GlassmorphismCard className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Paramètres commerciaux
                </CardTitle>
                <CardDescription>
                  Configuration des paramètres de vente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={storeSettings.currency}
                    onValueChange={(value) =>
                      setStoreSettings((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Taux de TVA (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={storeSettings.taxRate}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        taxRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="free-shipping">
                    Seuil livraison gratuite
                  </Label>
                  <Input
                    id="free-shipping"
                    type="number"
                    min="0"
                    step="0.01"
                    value={storeSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        freeShippingThreshold: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="50"
                  />
                  <p className="text-sm text-gray-600">
                    Montant minimum pour la livraison gratuite
                  </p>
                </div>
              </CardContent>
            </GlassmorphismCard>

            {/* Informations légales */}
            <GlassmorphismCard className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Informations légales
                </CardTitle>
                <CardDescription>
                  Informations légales de votre boutique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Ces informations sont importantes pour la conformité légale
                    de votre boutique en ligne.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Numéro SIRET</Label>
                  <Input placeholder="123 456 789 00012" />
                </div>

                <div className="space-y-2">
                  <Label>Numéro de TVA</Label>
                  <Input placeholder="FR12345678901" />
                </div>

                <div className="space-y-2">
                  <Label>Conditions générales de vente</Label>
                  <Textarea placeholder="URL vers vos CGV" rows={2} />
                </div>

                <div className="space-y-2">
                  <Label>Politique de confidentialité</Label>
                  <Textarea
                    placeholder="URL vers votre politique de confidentialité"
                    rows={2}
                  />
                </div>
              </CardContent>
            </GlassmorphismCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
