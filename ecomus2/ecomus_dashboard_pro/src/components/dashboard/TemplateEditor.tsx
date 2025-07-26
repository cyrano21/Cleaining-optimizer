'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Settings, 
  Plus, 
  Trash2, 
  Move, 
  Palette, 
  Type, 
  Image as ImageIcon,
  Layout,
  Save,
  Undo,
  Redo
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Section {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  order: number;
  settings: {
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    alignment?: 'left' | 'center' | 'right';
    showTitle?: boolean;
    showSubtitle?: boolean;
    maxItems?: number;
    columns?: number;
    autoplay?: boolean;
    interval?: number;
    [key: string]: any;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: Section[];
  globalSettings: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
    borderRadius: string;
  };
}

const AVAILABLE_SECTIONS = [
  {
    type: 'hero',
    name: 'Section Hero',
    icon: Layout,
    description: 'Bannière principale avec titre et bouton d\'action',
    defaultSettings: {
      title: 'Bienvenue dans notre boutique',
      subtitle: 'Découvrez nos produits exceptionnels',
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      alignment: 'center',
      showTitle: true,
      showSubtitle: true,
      padding: '4rem 0'
    }
  },
  {
    type: 'featured-products',
    name: 'Produits en Vedette',
    icon: ImageIcon,
    description: 'Affichage des produits mis en avant',
    defaultSettings: {
      title: 'Produits en Vedette',
      maxItems: 8,
      columns: 4,
      showTitle: true,
      backgroundColor: '#ffffff',
      textColor: '#212529',
      padding: '3rem 0'
    }
  },
  {
    type: 'categories',
    name: 'Catégories',
    icon: Type,
    description: 'Grille des catégories de produits',
    defaultSettings: {
      title: 'Nos Catégories',
      columns: 3,
      showTitle: true,
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      padding: '3rem 0'
    }
  },
  {
    type: 'carousel',
    name: 'Carrousel',
    icon: Move,
    description: 'Carrousel d\'images ou de produits',
    defaultSettings: {
      autoplay: true,
      interval: 5000,
      showTitle: false,
      backgroundColor: '#ffffff',
      padding: '2rem 0'
    }
  },
  {
    type: 'testimonials',
    name: 'Témoignages',
    icon: Type,
    description: 'Avis et témoignages clients',
    defaultSettings: {
      title: 'Ce que disent nos clients',
      maxItems: 3,
      columns: 3,
      showTitle: true,
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      padding: '3rem 0'
    }
  },
  {
    type: 'newsletter',
    name: 'Newsletter',
    icon: Type,
    description: 'Inscription à la newsletter',
    defaultSettings: {
      title: 'Restez informé',
      subtitle: 'Inscrivez-vous à notre newsletter pour recevoir nos dernières offres',
      backgroundColor: '#007bff',
      textColor: '#ffffff',
      alignment: 'center',
      showTitle: true,
      showSubtitle: true,
      padding: '3rem 0'
    }
  }
];

interface TemplateEditorProps {
  storeId: string;
  templateId?: string;
  onSave?: (template: Template) => void;
}

export default function TemplateEditor({ storeId, templateId, onSave }: TemplateEditorProps) {
  const [template, setTemplate] = useState<Template>({
    id: templateId || '',
    name: 'Nouveau Template',
    description: '',
    category: 'custom',
    sections: [],
    globalSettings: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      fontFamily: 'Inter',
      fontSize: '16px',
      borderRadius: '8px'
    }
  });

  const [activeTab, setActiveTab] = useState('sections');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Template[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Charger le template existant
  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/templates/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
        addToHistory(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du template:', error);
      toast.error('Erreur lors du chargement du template');
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = (newTemplate: Template) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...newTemplate });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTemplate({ ...history[historyIndex - 1] });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTemplate({ ...history[historyIndex + 1] });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newSections = Array.from(template.sections);
    const [reorderedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedSection);

    // Mettre à jour l'ordre
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    const updatedTemplate = { ...template, sections: updatedSections };
    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
  };

  const addSection = (sectionType: string) => {
    const sectionTemplate = AVAILABLE_SECTIONS.find(s => s.type === sectionType);
    if (!sectionTemplate) return;

    const newSection: Section = {
      id: `section_${Date.now()}`,
      type: sectionType,
      name: sectionTemplate.name,
      enabled: true,
      order: template.sections.length,
      settings: { ...sectionTemplate.defaultSettings }
    };

    const updatedTemplate = {
      ...template,
      sections: [...template.sections, newSection]
    };

    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
    setSelectedSection(newSection);
    toast.success('Section ajoutée avec succès');
  };

  const removeSection = (sectionId: string) => {
    const updatedTemplate = {
      ...template,
      sections: template.sections.filter(s => s.id !== sectionId)
    };

    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
    setSelectedSection(null);
    toast.success('Section supprimée');
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    const updatedTemplate = {
      ...template,
      sections: template.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    };

    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
  };

  const updateSectionSettings = (sectionId: string, settings: any) => {
    updateSection(sectionId, { settings: { ...selectedSection?.settings, ...settings } });
  };

  const saveTemplate = async () => {
    try {
      setIsLoading(true);
      const url = templateId ? `/api/templates/${templateId}` : '/api/templates';
      const method = templateId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          storeId
        })
      });

      if (response.ok) {
        const savedTemplate = await response.json();
        setTemplate(savedTemplate);
        toast.success('Template sauvegardé avec succès');
        onSave?.(savedTemplate);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du template');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSectionPreview = (section: Section) => {
    const { settings } = section;
    
    return (
      <div 
        className="border rounded-lg p-4 mb-4"
        style={{
          backgroundColor: settings.backgroundColor || '#ffffff',
          color: settings.textColor || '#212529',
          padding: settings.padding || '2rem',
          textAlign: settings.alignment || 'left'
        }}
      >
        {settings.showTitle && settings.title && (
          <h3 className="text-xl font-bold mb-2">{settings.title}</h3>
        )}
        {settings.showSubtitle && settings.subtitle && (
          <p className="text-gray-600 mb-4">{settings.subtitle}</p>
        )}
        
        {section.type === 'featured-products' && (
          <div className={`grid grid-cols-${settings.columns || 4} gap-4`}>
            {Array.from({ length: Math.min(settings.maxItems || 8, 8) }).map((_, i) => (
              <div key={i} className="bg-gray-100 h-32 rounded flex items-center justify-center">
                <span className="text-gray-500">Produit {i + 1}</span>
              </div>
            ))}
          </div>
        )}
        
        {section.type === 'categories' && (
          <div className={`grid grid-cols-${settings.columns || 3} gap-4`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 h-24 rounded flex items-center justify-center">
                <span className="text-gray-500">Catégorie {i + 1}</span>
              </div>
            ))}
          </div>
        )}
        
        {section.type === 'hero' && (
          <div className="text-center py-8">
            <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
              <span className="text-gray-500">Image Hero</span>
            </div>
          </div>
        )}
        
        {section.type === 'carousel' && (
          <div className="bg-gray-100 h-48 rounded flex items-center justify-center">
            <span className="text-gray-500">Carrousel</span>
          </div>
        )}
        
        {section.type === 'testimonials' && (
          <div className={`grid grid-cols-${settings.columns || 3} gap-4`}>
            {Array.from({ length: settings.maxItems || 3 }).map((_, i) => (
              <div key={i} className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">"Excellent service et produits de qualité!"</p>
                <span className="text-xs text-gray-500">Client {i + 1}</span>
              </div>
            ))}
          </div>
        )}
        
        {section.type === 'newsletter' && (
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <Input placeholder="Votre email" className="mb-2" />
              <Button>S'inscrire</Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar gauche - Sections disponibles */}
      <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sections Disponibles</h3>
          <Button size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-1" />
            {previewMode ? 'Éditer' : 'Aperçu'}
          </Button>
        </div>
        
        <div className="space-y-2">
          {AVAILABLE_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card 
                key={section.type} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addSection(section.type)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{section.name}</p>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Input
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="w-64"
              placeholder="Nom du template"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="w-4 h-4 mr-1" />
              {previewMode ? 'Éditer' : 'Aperçu'}
            </Button>
            <Button onClick={saveTemplate} disabled={isLoading}>
              <Save className="w-4 h-4 mr-1" />
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Zone de construction */}
          <div className="flex-1 p-4 overflow-y-auto">
            {previewMode ? (
              <div className="max-w-4xl mx-auto">
                {template.sections
                  .filter(section => section.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div key={section.id}>
                      {renderSectionPreview(section)}
                    </div>
                  ))}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {template.sections.map((section, index) => (
                        <Draggable
                          key={section.id}
                          draggableId={section.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-lg p-4 bg-white ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              } ${selectedSection?.id === section.id ? 'ring-2 ring-blue-500' : ''}`}
                              onClick={() => setSelectedSection(section)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-move p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Move className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <span className="font-medium">{section.name}</span>
                                  <Switch
                                    checked={section.enabled}
                                    onCheckedChange={(enabled) =>
                                      updateSection(section.id, { enabled })
                                    }
                                  />
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSection(section)}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSection(section.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {renderSectionPreview(section)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {template.sections.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Layout className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Aucune section ajoutée</p>
                          <p className="text-sm">Glissez des sections depuis la sidebar pour commencer</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* Sidebar droite - Paramètres */}
          {selectedSection && !previewMode && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="settings">Paramètres</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
                
                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <Label>Nom de la section</Label>
                    <Input
                      value={selectedSection.name}
                      onChange={(e) =>
                        updateSection(selectedSection.id, { name: e.target.value })
                      }
                    />
                  </div>
                  
                  {selectedSection.settings.title !== undefined && (
                    <div>
                      <Label>Titre</Label>
                      <Input
                        value={selectedSection.settings.title || ''}
                        onChange={(e) =>
                          updateSectionSettings(selectedSection.id, { title: e.target.value })
                        }
                      />
                    </div>
                  )}
                  
                  {selectedSection.settings.subtitle !== undefined && (
                    <div>
                      <Label>Sous-titre</Label>
                      <Textarea
                        value={selectedSection.settings.subtitle || ''}
                        onChange={(e) =>
                          updateSectionSettings(selectedSection.id, { subtitle: e.target.value })
                        }
                      />
                    </div>
                  )}
                  
                  {selectedSection.settings.maxItems !== undefined && (
                    <div>
                      <Label>Nombre d'éléments</Label>
                      <Input
                        type="number"
                        value={selectedSection.settings.maxItems || 8}
                        onChange={(e) =>
                          updateSectionSettings(selectedSection.id, { maxItems: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  )}
                  
                  {selectedSection.settings.columns !== undefined && (
                    <div>
                      <Label>Nombre de colonnes</Label>
                      <Input
                        type="number"
                        min="1"
                        max="6"
                        value={selectedSection.settings.columns || 3}
                        onChange={(e) =>
                          updateSectionSettings(selectedSection.id, { columns: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  )}
                  
                  {selectedSection.settings.autoplay !== undefined && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedSection.settings.autoplay || false}
                        onCheckedChange={(autoplay) =>
                          updateSectionSettings(selectedSection.id, { autoplay })
                        }
                      />
                      <Label>Lecture automatique</Label>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label>Couleur de fond</Label>
                    <Input
                      type="color"
                      value={selectedSection.settings.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        updateSectionSettings(selectedSection.id, { backgroundColor: e.target.value })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label>Couleur du texte</Label>
                    <Input
                      type="color"
                      value={selectedSection.settings.textColor || '#212529'}
                      onChange={(e) =>
                        updateSectionSettings(selectedSection.id, { textColor: e.target.value })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label>Alignement</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={selectedSection.settings.alignment || 'left'}
                      onChange={(e) =>
                        updateSectionSettings(selectedSection.id, { alignment: e.target.value })
                      }
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label>Espacement (padding)</Label>
                    <Input
                      value={selectedSection.settings.padding || '2rem 0'}
                      onChange={(e) =>
                        updateSectionSettings(selectedSection.id, { padding: e.target.value })
                      }
                      placeholder="ex: 2rem 0"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

