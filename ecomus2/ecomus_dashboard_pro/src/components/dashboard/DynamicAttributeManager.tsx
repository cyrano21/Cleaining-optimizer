'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Move,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  List,
  Image as ImageIcon,
  FileText,
  Palette,
  Settings,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface AttributeOption {
  value: string;
  label: string;
  color?: string;
}

interface DynamicAttribute {
  id: string;
  name: string;
  key: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'color' | 'image' | 'textarea';
  required: boolean;
  defaultValue?: any;
  options?: AttributeOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  category: string;
  order: number;
  isActive: boolean;
  applicableToProducts: boolean;
  applicableToCategories: boolean;
  applicableToStores: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DynamicAttributeManagerProps {
  storeId: string;
  entityType?: 'product' | 'category' | 'store';
}

const ATTRIBUTE_TYPES = [
  { value: 'text', label: 'Texte', icon: Type, description: 'Champ de texte simple' },
  { value: 'textarea', label: 'Texte long', icon: FileText, description: 'Zone de texte multiligne' },
  { value: 'number', label: 'Nombre', icon: Hash, description: 'Valeur numérique' },
  { value: 'boolean', label: 'Booléen', icon: ToggleLeft, description: 'Vrai/Faux' },
  { value: 'select', label: 'Liste déroulante', icon: List, description: 'Sélection unique' },
  { value: 'multiselect', label: 'Sélection multiple', icon: List, description: 'Sélection multiple' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Sélecteur de date' },
  { value: 'color', label: 'Couleur', icon: Palette, description: 'Sélecteur de couleur' },
  { value: 'image', label: 'Image', icon: ImageIcon, description: 'Upload d\'image' }
];

const ATTRIBUTE_CATEGORIES = [
  'Général',
  'Spécifications techniques',
  'Dimensions',
  'Matériaux',
  'Couleurs et finitions',
  'Compatibilité',
  'Garantie et service',
  'Marketing',
  'SEO',
  'Personnalisé'
];

export default function DynamicAttributeManager({ storeId, entityType }: DynamicAttributeManagerProps) {
  const [attributes, setAttributes] = useState<DynamicAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<DynamicAttribute | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAttributes();
  }, [storeId, entityType]);

  const loadAttributes = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        storeId,
        ...(entityType && { entityType })
      });
      
      const response = await fetch(`/api/attributes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAttributes(data.attributes || []);
      } else {
        // Données de démonstration
        setAttributes(generateMockAttributes());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des attributs:', error);
      setAttributes(generateMockAttributes());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAttributes = (): DynamicAttribute[] => [
    {
      id: '1',
      name: 'Matériau principal',
      key: 'main_material',
      description: 'Matériau principal utilisé pour la fabrication',
      type: 'select',
      required: false,
      options: [
        { value: 'cotton', label: 'Coton' },
        { value: 'polyester', label: 'Polyester' },
        { value: 'wool', label: 'Laine' },
        { value: 'silk', label: 'Soie' }
      ],
      category: 'Matériaux',
      order: 0,
      isActive: true,
      applicableToProducts: true,
      applicableToCategories: false,
      applicableToStores: false,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: '2',
      name: 'Dimensions (L x l x H)',
      key: 'dimensions',
      description: 'Dimensions du produit en centimètres',
      type: 'text',
      required: false,
      validation: {
        pattern: '^\\d+\\s*x\\s*\\d+\\s*x\\s*\\d+$',
        message: 'Format attendu: 10 x 20 x 30'
      },
      category: 'Dimensions',
      order: 1,
      isActive: true,
      applicableToProducts: true,
      applicableToCategories: false,
      applicableToStores: false,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: '3',
      name: 'Couleur principale',
      key: 'primary_color',
      description: 'Couleur principale du produit',
      type: 'color',
      required: false,
      category: 'Couleurs et finitions',
      order: 2,
      isActive: true,
      applicableToProducts: true,
      applicableToCategories: false,
      applicableToStores: false,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: '4',
      name: 'Écologique',
      key: 'eco_friendly',
      description: 'Produit respectueux de l\'environnement',
      type: 'boolean',
      required: false,
      defaultValue: false,
      category: 'Marketing',
      order: 3,
      isActive: true,
      applicableToProducts: true,
      applicableToCategories: true,
      applicableToStores: false,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: '5',
      name: 'Garantie (mois)',
      key: 'warranty_months',
      description: 'Durée de la garantie en mois',
      type: 'number',
      required: false,
      validation: {
        min: 0,
        max: 120,
        message: 'La garantie doit être entre 0 et 120 mois'
      },
      category: 'Garantie et service',
      order: 4,
      isActive: true,
      applicableToProducts: true,
      applicableToCategories: false,
      applicableToStores: false,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2025-01-01')
    }
  ];

  const createAttribute = async (attributeData: Partial<DynamicAttribute>) => {
    try {
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...attributeData, storeId })
      });

      if (response.ok) {
        const newAttribute = await response.json();
        setAttributes([...attributes, newAttribute]);
        toast.success('Attribut créé avec succès');
        setShowCreateModal(false);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'attribut:', error);
      toast.error('Erreur lors de la création de l\'attribut');
    }
  };

  const updateAttribute = async (id: string, updates: Partial<DynamicAttribute>) => {
    try {
      const response = await fetch(`/api/attributes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedAttribute = await response.json();
        setAttributes(attributes.map(a => a.id === id ? updatedAttribute : a));
        toast.success('Attribut mis à jour');
        setEditingAttribute(null);
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteAttribute = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet attribut ?')) return;

    try {
      const response = await fetch(`/api/attributes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAttributes(attributes.filter(a => a.id !== id));
        toast.success('Attribut supprimé');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newAttributes = Array.from(attributes);
    const [reorderedAttribute] = newAttributes.splice(result.source.index, 1);
    newAttributes.splice(result.destination.index, 0, reorderedAttribute);

    // Mettre à jour l'ordre
    const updatedAttributes = newAttributes.map((attr, index) => ({
      ...attr,
      order: index
    }));

    setAttributes(updatedAttributes);

    // Sauvegarder l'ordre
    updatedAttributes.forEach((attr, index) => {
      if (attr.order !== index) {
        updateAttribute(attr.id, { order: index });
      }
    });
  };

  const toggleAttributeStatus = async (id: string, isActive: boolean) => {
    await updateAttribute(id, { isActive });
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = ATTRIBUTE_TYPES.find(t => t.value === type);
    const Icon = typeConfig?.icon || Type;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = ATTRIBUTE_TYPES.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  const filteredAttributes = attributes.filter(attr => {
    const matchesCategory = selectedCategory === 'all' || attr.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntityType = !entityType || 
      (entityType === 'product' && attr.applicableToProducts) ||
      (entityType === 'category' && attr.applicableToCategories) ||
      (entityType === 'store' && attr.applicableToStores);
    
    return matchesCategory && matchesSearch && matchesEntityType;
  }).sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Attributs Dynamiques</h1>
          <p className="text-gray-600">
            Gérez les champs personnalisés pour vos {entityType ? entityType + 's' : 'entités'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Nouvel attribut
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total attributs</p>
                <p className="text-2xl font-bold">{attributes.length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attributs actifs</p>
                <p className="text-2xl font-bold">{attributes.filter(a => a.isActive).length}</p>
              </div>
              <ToggleLeft className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Catégories</p>
                <p className="text-2xl font-bold">
                  {new Set(attributes.map(a => a.category)).size}
                </p>
              </div>
              <List className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Obligatoires</p>
                <p className="text-2xl font-bold">{attributes.filter(a => a.required).length}</p>
              </div>
              <Type className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un attribut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {ATTRIBUTE_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste des attributs */}
      <Card>
        <CardHeader>
          <CardTitle>Attributs configurés</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="attributes">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {filteredAttributes.map((attribute, index) => (
                    <Draggable
                      key={attribute.id}
                      draggableId={attribute.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg p-4 bg-white ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move p-1 hover:bg-gray-100 rounded"
                              >
                                <Move className="w-4 h-4 text-gray-400" />
                              </div>
                              
                              <div className="p-2 bg-blue-100 rounded-lg">
                                {getTypeIcon(attribute.type)}
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold">{attribute.name}</h3>
                                  <Badge variant="outline">{getTypeLabel(attribute.type)}</Badge>
                                  <Badge variant="secondary">{attribute.category}</Badge>
                                  {attribute.required && (
                                    <Badge variant="destructive">Obligatoire</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  Clé: <code className="bg-gray-100 px-1 rounded">{attribute.key}</code>
                                </p>
                                {attribute.description && (
                                  <p className="text-sm text-gray-500 mt-1">{attribute.description}</p>
                                )}
                                
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  {attribute.applicableToProducts && <span>Produits</span>}
                                  {attribute.applicableToCategories && <span>Catégories</span>}
                                  {attribute.applicableToStores && <span>Boutiques</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={attribute.isActive}
                                onCheckedChange={(checked) => 
                                  toggleAttributeStatus(attribute.id, checked)
                                }
                              />
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingAttribute(attribute)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAttribute(attribute.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Affichage des options pour les types select */}
                          {(attribute.type === 'select' || attribute.type === 'multiselect') && 
                           attribute.options && attribute.options.length > 0 && (
                            <div className="mt-3 pl-12">
                              <p className="text-sm text-gray-600 mb-2">Options disponibles:</p>
                              <div className="flex flex-wrap gap-1">
                                {attribute.options.map((option, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {option.label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {filteredAttributes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun attribut trouvé</p>
                      <p className="text-sm">Créez votre premier attribut personnalisé</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Modal de création/édition */}
      {(showCreateModal || editingAttribute) && (
        <AttributeModal
          attribute={editingAttribute}
          onSave={editingAttribute ? 
            (data) => updateAttribute(editingAttribute.id, data) :
            createAttribute
          }
          onClose={() => {
            setShowCreateModal(false);
            setEditingAttribute(null);
          }}
        />
      )}
    </div>
  );
}

// Modal de création/édition d'attribut
interface AttributeModalProps {
  attribute?: DynamicAttribute | null;
  onSave: (data: Partial<DynamicAttribute>) => void;
  onClose: () => void;
}

function AttributeModal({ attribute, onSave, onClose }: AttributeModalProps) {
  const [formData, setFormData] = useState({
    name: attribute?.name || '',
    key: attribute?.key || '',
    description: attribute?.description || '',
    type: attribute?.type || 'text',
    required: attribute?.required || false,
    defaultValue: attribute?.defaultValue || '',
    category: attribute?.category || 'Général',
    isActive: attribute?.isActive ?? true,
    applicableToProducts: attribute?.applicableToProducts ?? true,
    applicableToCategories: attribute?.applicableToCategories ?? false,
    applicableToStores: attribute?.applicableToStores ?? false,
    options: attribute?.options || [],
    validation: attribute?.validation || {}
  });

  const [newOption, setNewOption] = useState({ value: '', label: '', color: '' });

  // Générer automatiquement la clé à partir du nom
  useEffect(() => {
    if (!attribute && formData.name) {
      const key = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      setFormData(prev => ({ ...prev, key }));
    }
  }, [formData.name, attribute]);

  const addOption = () => {
    if (newOption.value && newOption.label) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { ...newOption }]
      }));
      setNewOption({ value: '', label: '', color: '' });
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }
    
    if (!formData.key.trim()) {
      toast.error('La clé est obligatoire');
      return;
    }
    
    if ((formData.type === 'select' || formData.type === 'multiselect') && formData.options.length === 0) {
      toast.error('Au moins une option est requise pour les listes déroulantes');
      return;
    }

    onSave(formData);
  };

  const needsOptions = formData.type === 'select' || formData.type === 'multiselect';
  const needsValidation = ['text', 'textarea', 'number'].includes(formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {attribute ? 'Modifier l\'attribut' : 'Nouvel attribut'}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom de l'attribut *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Matériau principal"
                required
              />
            </div>
            <div>
              <Label>Clé technique *</Label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="ex: main_material"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisée dans l'API et la base de données
              </p>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'attribut pour les utilisateurs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type d'attribut *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options pour les listes déroulantes */}
          {needsOptions && (
            <div>
              <Label>Options disponibles</Label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                    <Input value={option.value} readOnly className="flex-1" />
                    <Input value={option.label} readOnly className="flex-1" />
                    {option.color && (
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                  <Input
                    placeholder="Valeur"
                    value={newOption.value}
                    onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                  />
                  <Input
                    placeholder="Libellé"
                    value={newOption.label}
                    onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                  />
                  {formData.type === 'select' && (
                    <Input
                      type="color"
                      value={newOption.color}
                      onChange={(e) => setNewOption({ ...newOption, color: e.target.value })}
                      className="w-16"
                    />
                  )}
                  <Button type="button" onClick={addOption}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Validation */}
          {needsValidation && (
            <div>
              <Label>Règles de validation</Label>
              <div className="grid grid-cols-2 gap-4">
                {formData.type === 'number' && (
                  <>
                    <div>
                      <Label>Valeur minimum</Label>
                      <Input
                        type="number"
                        value={formData.validation.min || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          validation: { 
                            ...formData.validation, 
                            min: e.target.value ? parseFloat(e.target.value) : undefined 
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Valeur maximum</Label>
                      <Input
                        type="number"
                        value={formData.validation.max || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          validation: { 
                            ...formData.validation, 
                            max: e.target.value ? parseFloat(e.target.value) : undefined 
                          }
                        })}
                      />
                    </div>
                  </>
                )}
                
                {(formData.type === 'text' || formData.type === 'textarea') && (
                  <div className="col-span-2">
                    <Label>Expression régulière (optionnel)</Label>
                    <Input
                      value={formData.validation.pattern || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        validation: { 
                          ...formData.validation, 
                          pattern: e.target.value 
                        }
                      })}
                      placeholder="ex: ^[A-Z]{2,}$"
                    />
                  </div>
                )}
                
                <div className="col-span-2">
                  <Label>Message d'erreur personnalisé</Label>
                  <Input
                    value={formData.validation.message || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      validation: { 
                        ...formData.validation, 
                        message: e.target.value 
                      }
                    })}
                    placeholder="Message affiché en cas d'erreur de validation"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Valeur par défaut */}
          {formData.type !== 'image' && (
            <div>
              <Label>Valeur par défaut</Label>
              {formData.type === 'boolean' ? (
                <Switch
                  checked={formData.defaultValue || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, defaultValue: checked })}
                />
              ) : formData.type === 'select' ? (
                <Select 
                  value={formData.defaultValue || ''} 
                  onValueChange={(value) => setFormData({ ...formData, defaultValue: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune valeur par défaut" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={formData.type === 'number' ? 'number' : 
                        formData.type === 'date' ? 'date' :
                        formData.type === 'color' ? 'color' : 'text'}
                  value={formData.defaultValue || ''}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                />
              )}
            </div>
          )}

          {/* Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.required}
                onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
              />
              <Label>Champ obligatoire</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Attribut actif</Label>
            </div>

            <div>
              <Label>Applicable à :</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.applicableToProducts}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      applicableToProducts: checked 
                    })}
                  />
                  <Label>Produits</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.applicableToCategories}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      applicableToCategories: checked 
                    })}
                  />
                  <Label>Catégories</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.applicableToStores}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      applicableToStores: checked 
                    })}
                  />
                  <Label>Boutiques</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-1" />
              {attribute ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

