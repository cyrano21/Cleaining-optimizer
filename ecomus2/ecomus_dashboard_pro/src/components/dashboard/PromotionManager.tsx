'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Percent,
  DollarSign,
  Users,
  ShoppingCart,
  Gift,
  Mail,
  Megaphone,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping';
  value: number;
  code?: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  minOrderAmount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  targetCustomers?: 'all' | 'new' | 'returning' | 'vip';
  createdAt: Date;
  updatedAt: Date;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'banner' | 'popup';
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  targetAudience: string;
  budget?: number;
  spent?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  promotions: string[];
  createdAt: Date;
}

interface PromotionManagerProps {
  storeId: string;
}

export default function PromotionManager({ storeId }: PromotionManagerProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('promotions');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    loadPromotions();
    loadCampaigns();
  }, [storeId]);

  const loadPromotions = async () => {
    try {
      const response = await fetch(`/api/promotions?storeId=${storeId}`);
      if (response.ok) {
        const data = await response.json();
        setPromotions(data.promotions || []);
      } else {
        // Données de démonstration
        setPromotions(generateMockPromotions());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des promotions:', error);
      setPromotions(generateMockPromotions());
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`/api/campaigns?storeId=${storeId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } else {
        // Données de démonstration
        setCampaigns(generateMockCampaigns());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error);
      setCampaigns(generateMockCampaigns());
    }
  };

  const generateMockPromotions = (): Promotion[] => [
    {
      id: '1',
      name: 'Soldes d\'hiver',
      description: 'Réduction de 20% sur tous les produits d\'hiver',
      type: 'percentage',
      value: 20,
      code: 'WINTER20',
      isActive: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      usageLimit: 1000,
      usageCount: 245,
      minOrderAmount: 50,
      targetCustomers: 'all',
      createdAt: new Date('2024-12-15'),
      updatedAt: new Date('2025-01-05')
    },
    {
      id: '2',
      name: 'Livraison gratuite',
      description: 'Livraison gratuite pour les commandes de plus de 75€',
      type: 'free_shipping',
      value: 0,
      isActive: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      minOrderAmount: 75,
      targetCustomers: 'all',
      usageCount: 567,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: '3',
      name: 'Nouveaux clients -15%',
      description: 'Réduction de 15% pour les nouveaux clients',
      type: 'percentage',
      value: 15,
      code: 'WELCOME15',
      isActive: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
      usageLimit: 500,
      usageCount: 89,
      targetCustomers: 'new',
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date('2025-01-01')
    }
  ];

  const generateMockCampaigns = (): Campaign[] => [
    {
      id: '1',
      name: 'Campagne Soldes Hiver',
      description: 'Promotion des soldes d\'hiver via email et réseaux sociaux',
      type: 'email',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      targetAudience: 'Tous les clients',
      budget: 1000,
      spent: 450,
      impressions: 15000,
      clicks: 750,
      conversions: 89,
      promotions: ['1'],
      createdAt: new Date('2024-12-20')
    },
    {
      id: '2',
      name: 'Bannière Livraison Gratuite',
      description: 'Bannière sur le site pour promouvoir la livraison gratuite',
      type: 'banner',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      targetAudience: 'Visiteurs du site',
      impressions: 45000,
      clicks: 1200,
      conversions: 234,
      promotions: ['2'],
      createdAt: new Date('2024-12-15')
    }
  ];

  const createPromotion = async (promotionData: Partial<Promotion>) => {
    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...promotionData, storeId })
      });

      if (response.ok) {
        const newPromotion = await response.json();
        setPromotions([...promotions, newPromotion]);
        toast.success('Promotion créée avec succès');
        setShowCreateModal(false);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la promotion:', error);
      toast.error('Erreur lors de la création de la promotion');
    }
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>) => {
    try {
      const response = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedPromotion = await response.json();
        setPromotions(promotions.map(p => p.id === id ? updatedPromotion : p));
        toast.success('Promotion mise à jour');
        setEditingPromotion(null);
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;

    try {
      const response = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPromotions(promotions.filter(p => p.id !== id));
        toast.success('Promotion supprimée');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const togglePromotionStatus = async (id: string, isActive: boolean) => {
    await updatePromotion(id, { isActive });
  };

  const duplicatePromotion = async (promotion: Promotion) => {
    const duplicated = {
      ...promotion,
      id: undefined,
      name: `${promotion.name} (Copie)`,
      code: promotion.code ? `${promotion.code}_COPY` : undefined,
      usageCount: 0,
      createdAt: undefined,
      updatedAt: undefined
    };
    await createPromotion(duplicated);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
  };

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'bogo': return <Gift className="w-4 h-4" />;
      case 'free_shipping': return <ShoppingCart className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getPromotionTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Pourcentage';
      case 'fixed': return 'Montant fixe';
      case 'bogo': return 'Achetez 1, obtenez 1';
      case 'free_shipping': return 'Livraison gratuite';
      default: return type;
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />Inactif</Badge>;
    }
    if (now < start) {
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Programmé</Badge>;
    }
    if (now > end) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expiré</Badge>;
    }
    return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
  };

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'paused':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En pause</Badge>;
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
      default:
        return <Badge variant="secondary">Brouillon</Badge>;
    }
  };

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
          <h1 className="text-2xl font-bold">Promotions & Marketing</h1>
          <p className="text-gray-600">Gérez vos promotions et campagnes marketing</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Nouvelle promotion
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promotions actives</p>
                <p className="text-2xl font-bold">{promotions.filter(p => p.isActive).length}</p>
              </div>
              <Gift className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisations totales</p>
                <p className="text-2xl font-bold">
                  {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campagnes actives</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
              </div>
              <Megaphone className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de conversion</p>
                <p className="text-2xl font-bold">
                  {campaigns.length > 0 
                    ? ((campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0) / 
                        campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-4">
          <div className="grid gap-4">
            {promotions.map((promotion) => (
              <Card key={promotion.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getPromotionTypeIcon(promotion.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{promotion.name}</h3>
                          {getStatusBadge(promotion)}
                        </div>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{getPromotionTypeLabel(promotion.type)}</span>
                          {promotion.code && <span>Code: {promotion.code}</span>}
                          <span>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <p className="font-semibold">
                          {promotion.type === 'percentage' ? `${promotion.value}%` :
                           promotion.type === 'fixed' ? formatCurrency(promotion.value) :
                           promotion.type === 'free_shipping' ? 'Gratuit' : 'BOGO'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {promotion.usageCount} utilisations
                          {promotion.usageLimit && ` / ${promotion.usageLimit}`}
                        </p>
                      </div>
                      
                      <Switch
                        checked={promotion.isActive}
                        onCheckedChange={(checked) => togglePromotionStatus(promotion.id, checked)}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPromotion(promotion)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicatePromotion(promotion)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePromotion(promotion.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Campagnes Marketing</h2>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle campagne
            </Button>
          </div>
          
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {campaign.type === 'email' ? <Mail className="w-4 h-4" /> :
                         campaign.type === 'social' ? <Users className="w-4 h-4" /> :
                         campaign.type === 'banner' ? <Eye className="w-4 h-4" /> :
                         <Target className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          {getCampaignStatusBadge(campaign.status)}
                        </div>
                        <p className="text-sm text-gray-600">{campaign.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{campaign.type}</span>
                          <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                          {campaign.budget && <span>Budget: {formatCurrency(campaign.budget)}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-semibold">{(campaign.impressions || 0).toLocaleString()}</p>
                          <p className="text-gray-600">Impressions</p>
                        </div>
                        <div>
                          <p className="font-semibold">{(campaign.clicks || 0).toLocaleString()}</p>
                          <p className="text-gray-600">Clics</p>
                        </div>
                        <div>
                          <p className="font-semibold">{(campaign.conversions || 0).toLocaleString()}</p>
                          <p className="text-gray-600">Conversions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance des promotions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promotions.slice(0, 5).map((promotion) => (
                    <div key={promotion.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{promotion.name}</p>
                        <p className="text-sm text-gray-600">{promotion.usageCount} utilisations</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {promotion.usageLimit 
                            ? `${((promotion.usageCount / promotion.usageLimit) * 100).toFixed(1)}%`
                            : '∞'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI des campagnes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => {
                    const roi = campaign.budget && campaign.conversions 
                      ? ((campaign.conversions * 50 - campaign.spent!) / campaign.spent! * 100)
                      : 0;
                    
                    return (
                      <div key={campaign.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-gray-600">
                            {campaign.spent ? formatCurrency(campaign.spent) : 'N/A'} dépensé
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de création/édition de promotion */}
      {(showCreateModal || editingPromotion) && (
        <PromotionModal
          promotion={editingPromotion}
          onSave={editingPromotion ? 
            (data) => updatePromotion(editingPromotion.id, data) :
            createPromotion
          }
          onClose={() => {
            setShowCreateModal(false);
            setEditingPromotion(null);
          }}
        />
      )}
    </div>
  );
}

// Modal de création/édition de promotion
interface PromotionModalProps {
  promotion?: Promotion | null;
  onSave: (data: Partial<Promotion>) => void;
  onClose: () => void;
}

function PromotionModal({ promotion, onSave, onClose }: PromotionModalProps) {
  const [formData, setFormData] = useState({
    name: promotion?.name || '',
    description: promotion?.description || '',
    type: promotion?.type || 'percentage',
    value: promotion?.value || 0,
    code: promotion?.code || '',
    startDate: promotion?.startDate || new Date(),
    endDate: promotion?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: promotion?.usageLimit || undefined,
    minOrderAmount: promotion?.minOrderAmount || undefined,
    targetCustomers: promotion?.targetCustomers || 'all',
    isActive: promotion?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {promotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <XCircle className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom de la promotion</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Type de promotion</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage</SelectItem>
                  <SelectItem value="fixed">Montant fixe</SelectItem>
                  <SelectItem value="free_shipping">Livraison gratuite</SelectItem>
                  <SelectItem value="bogo">Achetez 1, obtenez 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.type !== 'free_shipping' && (
              <div>
                <Label>
                  Valeur {formData.type === 'percentage' ? '(%)' : '(€)'}
                </Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  required
                />
              </div>
            )}
            <div>
              <Label>Code promo (optionnel)</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="ex: WINTER20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de début</Label>
              <Input
                type="datetime-local"
                value={new Date(formData.startDate).toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Date de fin</Label>
              <Input
                type="datetime-local"
                value={new Date(formData.endDate).toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Limite d'utilisation (optionnel)</Label>
              <Input
                type="number"
                value={formData.usageLimit || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  usageLimit: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="Illimité"
              />
            </div>
            <div>
              <Label>Montant minimum de commande (€)</Label>
              <Input
                type="number"
                value={formData.minOrderAmount || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  minOrderAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="Aucun minimum"
              />
            </div>
          </div>

          <div>
            <Label>Clients cibles</Label>
            <Select 
              value={formData.targetCustomers} 
              onValueChange={(value) => setFormData({ ...formData, targetCustomers: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                <SelectItem value="new">Nouveaux clients</SelectItem>
                <SelectItem value="returning">Clients fidèles</SelectItem>
                <SelectItem value="vip">Clients VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label>Activer immédiatement</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {promotion ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

