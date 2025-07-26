"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types pour les propriétés des sections
interface SectionPropDefinition {
  label: string;
  type: "text" | "number" | "switch" | "select" | "datetime-local";
  options?: string[];
}

interface SectionDefinition {
  name: string;
  description: string;
  icon: string;
  props?: Record<string, SectionPropDefinition>;
}

// Composant SortableItem pour le drag & drop
function SortableItem({
  id,
  sectionConfig,
  definition,
  index,
  toggleSection,
  updateSectionProp,
}: {
  id: string;
  sectionConfig: SectionConfig;
  definition: SectionDefinition;
  index: number;
  toggleSection: (key: string) => void;
  updateSectionProp: (sectionKey: string, propKey: string, value: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg" : ""} ${
        sectionConfig.enabled
          ? "border-green-200 bg-green-50 dark:bg-green-900/20"
          : "border-gray-200 bg-gray-50 dark:bg-gray-800/50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="cursor-grab active:cursor-grabbing"
              {...listeners}
              {...attributes}
            >
              <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </div>
            <span className="text-2xl">{definition.icon}</span>
            <div>
              <h4 className="font-medium">{definition.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {definition.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              Ordre: {sectionConfig.order || index + 1}
            </Badge>
            <Switch
              checked={sectionConfig.enabled}
              onCheckedChange={() => toggleSection(id)}
            />
            {sectionConfig.enabled ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Configuration des propriétés de la section */}
        {sectionConfig.enabled && definition.props && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <h5 className="font-medium text-sm">Configuration</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(definition.props).map(
                ([propKey, propDef]: [string, SectionPropDefinition]) => (
                  <div key={propKey} className="space-y-2">
                    <Label htmlFor={`${id}-${propKey}`}>{propDef.label}</Label>
                    {propDef.type === "text" && (
                      <Input
                        id={`${id}-${propKey}`}
                        value={sectionConfig[propKey] || ""}
                        onChange={(e) =>
                          updateSectionProp(id, propKey, e.target.value)
                        }
                      />
                    )}
                    {propDef.type === "number" && (
                      <Input
                        id={`${id}-${propKey}`}
                        type="number"
                        value={sectionConfig[propKey] || ""}
                        onChange={(e) =>
                          updateSectionProp(
                            id,
                            propKey,
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    )}
                    {propDef.type === "switch" && (
                      <Switch
                        checked={sectionConfig[propKey] || false}
                        onCheckedChange={(checked) =>
                          updateSectionProp(id, propKey, checked)
                        }
                      />
                    )}
                    {propDef.type === "select" && (
                      <Select
                        value={sectionConfig[propKey] || ""}
                        onValueChange={(value) =>
                          updateSectionProp(id, propKey, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {propDef.options &&
                            propDef.options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    {propDef.type === "datetime-local" && (
                      <Input
                        id={`${id}-${propKey}`}
                        type="datetime-local"
                        value={sectionConfig[propKey] || ""}
                        onChange={(e) =>
                          updateSectionProp(id, propKey, e.target.value)
                        }
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import {
  Eye,
  EyeOff,
  GripVertical,
  Settings,
  Save,
  RotateCcw,
  Palette,
  Search,
  Type,
} from "lucide-react";
import {
  TemplateConfig,
  SectionConfig,
  CommonSectionsConfig,
  getDefaultConfigForTemplate,
} from "@/types/templateConfig";

interface TemplateConfigEditorProps {
  templateId: string;
  storeId?: string;
  isGlobal?: boolean;
  onSave?: (config: TemplateConfig) => void;
  onCancel?: () => void;
}

// Configuration des sections disponibles pour tous les templates
const UNIVERSAL_SECTION_DEFINITIONS = {
  header: {
    name: "En-tête",
    description: "Navigation et logo de la boutique",
    icon: "🏠",
    props: {
      type: {
        type: "select" as const,
        options: ["header1", "header2", "header3"],
        label: "Type d'en-tête",
      },
      textClass: {
        type: "text" as const,
        label: "Classe CSS du texte",
      },
    },
  },
  hero: {
    name: "Bannière Hero",
    description: "Bannière principale de la page d'accueil",
    icon: "🎯",
    props: {
      type: {
        type: "select" as const,
        options: ["hero1", "hero2", "hero3", "hero-banner"],
        label: "Type de bannière",
      },
      showStore: {
        type: "switch" as const,
        label: "Afficher les infos boutique",
      },
      customBanner: {
        type: "text" as const,
        label: "URL bannière personnalisée",
      },
      backgroundImage: {
        type: "text" as const,
        label: "Image de fond",
      },
    },
  },
  slider: {
    name: "Slider",
    description: "Carrousel d'images",
    icon: "🎠",
    props: {
      type: {
        type: "select" as const,
        options: ["slider1", "slider2", "slider3"],
        label: "Type de slider",
      },
      autoPlay: {
        type: "switch" as const,
        label: "Lecture automatique",
      },
      showDots: {
        type: "switch" as const,
        label: "Afficher les points",
      },
    },
  },
  categories: {
    name: "Catégories",
    description: "Affichage des catégories de produits",
    icon: "📂",
    props: {
      limit: {
        type: "number" as const,
        label: "Nombre de catégories",
      },
      showTitle: {
        type: "switch" as const,
        label: "Afficher le titre",
      },
      layout: {
        type: "select" as const,
        options: ["grid", "carousel"],
        label: "Type de mise en page",
      },
    },
  },
  products: {
    name: "Produits",
    description: "Liste des produits mis en avant",
    icon: "🛍️",
    props: {
      title: {
        type: "text" as const,
        label: "Titre de la section",
      },
      limit: {
        type: "number" as const,
        label: "Nombre de produits",
      },
      showFilters: {
        type: "switch" as const,
        label: "Afficher les filtres",
      },
      layout: {
        type: "select" as const,
        options: ["grid", "carousel"],
        label: "Type de mise en page",
      },
    },
  },
  collections: {
    name: "Collections",
    description: "Collections de produits",
    icon: "📦",
    props: {
      showTitle: {
        type: "switch" as const,
        label: "Afficher le titre",
      },
      layout: {
        type: "select" as const,
        options: ["grid", "carousel"],
        label: "Type de mise en page",
      },
    },
  },
  collectionBanner: {
    name: "Bannière Collection",
    description: "Bannière promotionnelle",
    icon: "🎨",
    props: {
      bannerImage: {
        type: "text" as const,
        label: "URL de l'image",
      },
      bannerText: {
        type: "text" as const,
        label: "Texte de la bannière",
      },
    },
  },
  countdown: {
    name: "Compte à rebours",
    description: "Section avec timer pour offres limitées",
    icon: "⏰",
    props: {
      title: {
        type: "text" as const,
        label: "Titre",
      },
      endDate: {
        type: "datetime-local" as const,
        label: "Date de fin",
      },
      showProducts: {
        type: "switch" as const,
        label: "Afficher les produits",
      },
    },
  },
  testimonials: {
    name: "Témoignages",
    description: "Avis et témoignages clients",
    icon: "💬",
    props: {
      title: {
        type: "text" as const,
        label: "Titre",
      },
      limit: {
        type: "number" as const,
        label: "Nombre de témoignages",
      },
      layout: {
        type: "select" as const,
        options: ["grid", "carousel"],
        label: "Type de mise en page",
      },
    },
  },
  marquee: {
    name: "Texte défilant",
    description: "Barre de texte défilant",
    icon: "📢",
    props: {
      text: {
        type: "text" as const,
        label: "Texte à afficher",
      },
      speed: {
        type: "number" as const,
        label: "Vitesse de défilement",
      },
    },
  },
  blogs: {
    name: "Articles",
    description: "Articles de blog récents",
    icon: "📝",
    props: {
      title: {
        type: "text" as const,
        label: "Titre",
      },
      limit: {
        type: "number" as const,
        label: "Nombre d'articles",
      },
      layout: {
        type: "select" as const,
        options: ["grid", "carousel"],
        label: "Type de mise en page",
      },
    },
  },
  brands: {
    name: "Marques",
    description: "Logos des marques partenaires",
    icon: "🏷️",
    props: {
      title: {
        type: "text" as const,
        label: "Titre",
      },
      limit: {
        type: "number" as const,
        label: "Nombre de marques",
      },
      showTitle: {
        type: "switch" as const,
        label: "Afficher le titre",
      },
    },
  },
  lookbook: {
    name: "Lookbook",
    description: "Galerie de style et tendances",
    icon: "👗",
    props: {
      title: {
        type: "text" as const,
        label: "Titre",
      },
      showTitle: {
        type: "switch" as const,
        label: "Afficher le titre",
      },
    },
  },
  instagram: {
    name: "Instagram",
    description: "Feed Instagram",
    icon: "📷",
    props: {
      title: {
        type: "text" as const,
        label: "Titre",
      },
      hashtag: {
        type: "text" as const,
        label: "Hashtag",
      },
    },
  },
  newsletter: {
    name: "Newsletter",
    description: "Inscription à la newsletter",
    icon: "📧",
    props: {
      title: {
        type: "text" as const,
        label: "Titre",
      },
      description: {
        type: "text" as const,
        label: "Description",
      },
    },
  },
  footer: {
    name: "Pied de page",
    description: "Informations de bas de page",
    icon: "🦶",
    props: {
      type: {
        type: "select" as const,
        options: ["footer1", "footer2", "footer3"],
        label: "Type de pied de page",
      },
    },
  },
};

// Helper to ensure a valid SectionConfig
function normalizeSectionConfig(section: any): SectionConfig {
  const { enabled, ...rest } = section || {};
  return {
    enabled: typeof enabled === "boolean" ? enabled : false,
    order: typeof rest.order === "number" ? rest.order : undefined,
    props: rest.props ?? undefined,
    ...rest,
  };
}

export default function TemplateConfigEditor({
  templateId,
  storeId,
  isGlobal = false,
  onSave,
  onCancel,
}: TemplateConfigEditorProps) {
  const [config, setConfig] = useState<TemplateConfig>(
    getDefaultConfigForTemplate("home-1")
  );
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Charger la configuration existante
  useEffect(() => {
    loadConfig();
  }, [templateId, storeId, isGlobal]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        templateId,
        ...(storeId && !isGlobal && { storeId }),
        ...(isGlobal && { global: "true" }),
      });

      const response = await fetch(`/api/template-config?${params}`);

      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      } else if (response.status === 404) {
        // Pas de config trouvée, utiliser la config par défaut
        console.log(
          "Aucune configuration trouvée, utilisation de la config par défaut"
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/template-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          storeId: isGlobal ? undefined : storeId,
          isGlobal,
          sections: config.sections,
          theme: config.theme,
          seo: config.seo,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      setHasChanges(false);
      onSave?.(config);
      alert("Configuration sauvegardée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde de la configuration");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser la configuration par défaut ?"
      )
    ) {
      setConfig(getDefaultConfigForTemplate(templateId));
      setHasChanges(true);
    }
  };

  const updateSectionConfig = (
    sectionKey: string,
    updates: Partial<SectionConfig>
  ) => {
    setConfig((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: normalizeSectionConfig({
          ...(prev.sections[sectionKey] as SectionConfig),
          ...updates,
        }),
      },
    }));
    setHasChanges(true);
  };

  const updateSectionProp = (
    sectionKey: string,
    propKey: string,
    value: any
  ) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      sections: {
        ...prevConfig.sections,
        [sectionKey]: normalizeSectionConfig({
          ...(prevConfig.sections[sectionKey] as SectionConfig),
          [propKey]: value,
        }),
      },
    }));
    setHasChanges(true);
  };

  const toggleSection = (sectionKey: string) => {
    updateSectionConfig(sectionKey, {
      enabled: !config.sections[sectionKey]?.enabled,
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const sections = Object.entries(config.sections);
      const oldIndex = sections.findIndex(([key]) => key === active.id);
      const newIndex = sections.findIndex(([key]) => key === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        const reorderedSections = Object.fromEntries(
          newSections.map(([key, section], index) => [
            key,
            normalizeSectionConfig({ ...section, order: index + 1 }),
          ])
        );

        setConfig((prev) => ({
          ...prev,
          sections: reorderedSections,
        }));
        setHasChanges(true);
      }
    }
  };

  const sectionDefinitions = UNIVERSAL_SECTION_DEFINITIONS;
  const orderedSections = Object.entries(config.sections)
    .filter(([, section]) => !!section)
    .sort(([, a], [, b]) => (a?.order ?? 999) - (b?.order ?? 999));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Configuration du Template</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Personnalisez les sections et leur ordre d'affichage
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetToDefault} disabled={loading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={saveConfig} disabled={loading || !hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="theme">Thème</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedSections.map(([key]) => key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {orderedSections.map(
                      ([sectionKey, sectionConfig], index) => {
                        if (!(sectionKey in sectionDefinitions)) return null;
                        const definition =
                          sectionDefinitions[
                            sectionKey as keyof typeof sectionDefinitions
                          ];
                        if (!definition || !sectionConfig) return null;
                        return (
                          <SortableItem
                            key={sectionKey}
                            id={sectionKey}
                            sectionConfig={sectionConfig as SectionConfig}
                            definition={definition}
                            index={index}
                            toggleSection={toggleSection}
                            updateSectionProp={updateSectionProp}
                          />
                        );
                      }
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Thème</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Couleur Principale</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={config.theme?.primaryColor || "#007bff"}
                    onChange={(e) =>
                      setConfig((prev: TemplateConfig) => ({
                        ...prev,
                        theme: { ...prev.theme, primaryColor: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Couleur Secondaire</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={config.theme?.secondaryColor || "#6c757d"}
                    onChange={(e) =>
                      setConfig((prev: TemplateConfig) => ({
                        ...prev,
                        theme: {
                          ...prev.theme,
                          secondaryColor: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="darkMode"
                  checked={config.theme?.darkMode || false}
                  onCheckedChange={(checked) =>
                    setConfig((prev: TemplateConfig) => ({
                      ...prev,
                      theme: { ...prev.theme, darkMode: checked },
                    }))
                  }
                />
                <Label htmlFor="darkMode">Mode sombre par défaut</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Configuration SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Titre de la page</Label>
                <Input
                  id="seoTitle"
                  value={config.seo?.title || ""}
                  onChange={(e) =>
                    setConfig((prev: TemplateConfig) => ({
                      ...prev,
                      seo: { ...prev.seo, title: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Description</Label>
                <Input
                  id="seoDescription"
                  value={config.seo?.description || ""}
                  onChange={(e) =>
                    setConfig((prev: TemplateConfig) => ({
                      ...prev,
                      seo: { ...prev.seo, description: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">
                  Mots-clés (séparés par des virgules)
                </Label>
                <Input
                  id="seoKeywords"
                  value={config.seo?.keywords?.join(", ") || ""}
                  onChange={(e) =>
                    setConfig((prev: TemplateConfig) => ({
                      ...prev,
                      seo: {
                        ...prev.seo,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k),
                      },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Vous avez des modifications non sauvegardées
          </p>
        </div>
      )}
    </div>
  );
}
