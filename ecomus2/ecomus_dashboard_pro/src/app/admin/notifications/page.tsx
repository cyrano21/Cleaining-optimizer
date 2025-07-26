'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Send,
  Users,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Target,
  Calendar,
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GlassMorphismCard } from '@/components/ui/glass-morphism-card';
import { StatCard } from '@/components/ui/stat-card';
import { ModernChart } from '@/components/ui/modern-chart';
import { Progress } from '@/components/ui/progress';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'push' | 'sms' | 'in-app' | 'all';
  targetAudience: 'all' | 'vendors' | 'customers' | 'admins' | 'custom';
  customAudience?: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  deliveryStats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'sms' | 'in-app';
  subject?: string;
  content: string;
  variables: string[];
  category: 'marketing' | 'transactional' | 'system' | 'security';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nouvelle mise à jour disponible',
      message: 'Une nouvelle version de la plateforme est disponible avec de nouvelles fonctionnalités.',
      type: 'info',
      priority: 'medium',
      channel: 'all',
      targetAudience: 'all',
      status: 'sent',
      sentAt: new Date('2024-01-22T10:00:00'),
      deliveryStats: {
        sent: 1250,
        delivered: 1200,
        opened: 850,
        clicked: 320,
        failed: 50
      },
      createdBy: 'admin@example.com',
      createdAt: new Date('2024-01-22T09:30:00'),
      updatedAt: new Date('2024-01-22T09:30:00'),
      actionUrl: '/updates',
      actionText: 'Voir les nouveautés'
    },
    {
      id: '2',
      title: 'Promotion Flash - 50% de réduction',
      message: 'Profitez de notre promotion flash exceptionnelle sur tous les produits électroniques.',
      type: 'promotion',
      priority: 'high',
      channel: 'email',
      targetAudience: 'customers',
      status: 'scheduled',
      scheduledAt: new Date('2024-01-23T14:00:00'),
      createdBy: 'marketing@example.com',
      createdAt: new Date('2024-01-22T11:00:00'),
      updatedAt: new Date('2024-01-22T11:00:00'),
      expiresAt: new Date('2024-01-25T23:59:59'),
      actionUrl: '/promotions/flash-sale',
      actionText: 'Profiter de l\'offre',
      imageUrl: '/images/flash-sale.jpg'
    },
    {
      id: '3',
      title: 'Maintenance programmée',
      message: 'Une maintenance est programmée ce soir de 2h à 4h. Les services pourraient être temporairement indisponibles.',
      type: 'warning',
      priority: 'high',
      channel: 'all',
      targetAudience: 'all',
      status: 'draft',
      createdBy: 'devops@example.com',
      createdAt: new Date('2024-01-22T12:00:00'),
      updatedAt: new Date('2024-01-22T12:00:00')
    },
    {
      id: '4',
      title: 'Tentative de connexion suspecte',
      message: 'Une tentative de connexion suspecte a été détectée sur votre compte. Vérifiez votre activité récente.',
      type: 'error',
      priority: 'urgent',
      channel: 'email',
      targetAudience: 'custom',
      customAudience: ['user123@example.com'],
      status: 'sent',
      sentAt: new Date('2024-01-22T13:30:00'),
      deliveryStats: {
        sent: 1,
        delivered: 1,
        opened: 1,
        clicked: 0,
        failed: 0
      },
      createdBy: 'security@example.com',
      createdAt: new Date('2024-01-22T13:25:00'),
      updatedAt: new Date('2024-01-22T13:25:00'),
      actionUrl: '/security/activity',
      actionText: 'Vérifier l\'activité'
    },
    {
      id: '5',
      title: 'Commande expédiée',
      message: 'Votre commande #12345 a été expédiée et arrivera dans 2-3 jours ouvrables.',
      type: 'success',
      priority: 'medium',
      channel: 'push',
      targetAudience: 'customers',
      status: 'sending',
      createdBy: 'system@example.com',
      createdAt: new Date('2024-01-22T14:00:00'),
      updatedAt: new Date('2024-01-22T14:00:00'),
      actionUrl: '/orders/12345/tracking',
      actionText: 'Suivre la commande'
    }
  ]);

  const [templates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Bienvenue nouvel utilisateur',
      description: 'Message de bienvenue pour les nouveaux utilisateurs',
      type: 'email',
      subject: 'Bienvenue sur {{platform_name}} !',
      content: 'Bonjour {{user_name}}, bienvenue sur notre plateforme ! Nous sommes ravis de vous compter parmi nous.',
      variables: ['platform_name', 'user_name'],
      category: 'transactional',
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00'),
      updatedAt: new Date('2024-01-20T15:30:00')
    },
    {
      id: '2',
      name: 'Confirmation de commande',
      description: 'Confirmation automatique après une commande',
      type: 'email',
      subject: 'Commande confirmée - #{{order_number}}',
      content: 'Votre commande #{{order_number}} d\'un montant de {{order_total}} a été confirmée.',
      variables: ['order_number', 'order_total'],
      category: 'transactional',
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00'),
      updatedAt: new Date('2024-01-15T10:00:00')
    },
    {
      id: '3',
      name: 'Promotion hebdomadaire',
      description: 'Template pour les promotions hebdomadaires',
      type: 'email',
      subject: 'Offres de la semaine - Jusqu\'à {{discount}}% de réduction',
      content: 'Découvrez nos offres exceptionnelles de la semaine avec jusqu\'à {{discount}}% de réduction sur {{category}}.',
      variables: ['discount', 'category'],
      category: 'marketing',
      isActive: true,
      createdAt: new Date('2024-01-10T10:00:00'),
      updatedAt: new Date('2024-01-18T14:20:00')
    }
  ]);

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    type: 'info',
    priority: 'medium',
    channel: 'email',
    targetAudience: 'all',
    status: 'draft'
  });

  const notificationTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'info', label: 'Information', icon: Info, color: 'blue' },
    { value: 'success', label: 'Succès', icon: CheckCircle, color: 'green' },
    { value: 'warning', label: 'Avertissement', icon: AlertTriangle, color: 'yellow' },
    { value: 'error', label: 'Erreur', icon: XCircle, color: 'red' },
    { value: 'promotion', label: 'Promotion', icon: Zap, color: 'purple' }
  ];

  const channels = [
    { value: 'all', label: 'Tous les canaux' },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'push', label: 'Push', icon: Bell },
    { value: 'sms', label: 'SMS', icon: MessageSquare },
    { value: 'in-app', label: 'In-App', icon: Smartphone }
  ];

  const statuses = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'scheduled', label: 'Programmé' },
    { value: 'sending', label: 'En cours d\'envoi' },
    { value: 'sent', label: 'Envoyé' },
    { value: 'failed', label: 'Échec' }
  ];

  const priorities = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const audiences = [
    { value: 'all', label: 'Tous les utilisateurs' },
    { value: 'vendors', label: 'Vendeurs' },
    { value: 'customers', label: 'Clients' },
    { value: 'admins', label: 'Administrateurs' },
    { value: 'custom', label: 'Audience personnalisée' }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesChannel = channelFilter === 'all' || notification.channel === channelFilter || notification.channel === 'all';
    
    return matchesSearch && matchesStatus && matchesType && matchesChannel;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'promotion': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig?.icon || Info;
  };

  const getChannelIcon = (channel: string) => {
    const channelConfig = channels.find(c => c.value === channel);
    return channelConfig?.icon || Bell;
  };

  const calculateDeliveryRate = (stats?: Notification['deliveryStats']) => {
    if (!stats || stats.sent === 0) return 0;
    return Math.round((stats.delivered / stats.sent) * 100);
  };

  const calculateOpenRate = (stats?: Notification['deliveryStats']) => {
    if (!stats || stats.delivered === 0) return 0;
    return Math.round((stats.opened / stats.delivered) * 100);
  };

  const calculateClickRate = (stats?: Notification['deliveryStats']) => {
    if (!stats || stats.opened === 0) return 0;
    return Math.round((stats.clicked / stats.opened) * 100);
  };

  const getNotificationStats = () => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'sent').length;
    const scheduled = notifications.filter(n => n.status === 'scheduled').length;
    const failed = notifications.filter(n => n.status === 'failed').length;
    
    const totalSent = notifications
      .filter(n => n.deliveryStats)
      .reduce((sum, n) => sum + (n.deliveryStats?.sent || 0), 0);
    
    const totalDelivered = notifications
      .filter(n => n.deliveryStats)
      .reduce((sum, n) => sum + (n.deliveryStats?.delivered || 0), 0);
    
    const avgDeliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
    
    return { total, sent, scheduled, failed, avgDeliveryRate };
  };

  const handleCreateNotification = () => {
    const notification: Notification = {
      id: Date.now().toString(),
      title: newNotification.title || '',
      message: newNotification.message || '',
      type: newNotification.type || 'info',
      priority: newNotification.priority || 'medium',
      channel: newNotification.channel || 'email',
      targetAudience: newNotification.targetAudience || 'all',
      status: 'draft',
      createdBy: 'admin@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setNotifications([notification, ...notifications]);
    setNewNotification({
      type: 'info',
      priority: 'medium',
      channel: 'email',
      targetAudience: 'all',
      status: 'draft'
    });
    setIsCreateModalOpen(false);
  };

  const handleSendNotification = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id 
        ? { 
            ...n, 
            status: 'sent' as const, 
            sentAt: new Date(),
            deliveryStats: {
              sent: Math.floor(Math.random() * 1000) + 100,
              delivered: Math.floor(Math.random() * 950) + 95,
              opened: Math.floor(Math.random() * 800) + 50,
              clicked: Math.floor(Math.random() * 300) + 10,
              failed: Math.floor(Math.random() * 50)
            }
          }
        : n
    ));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const stats = getNotificationStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gestion des Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Créez, programmez et suivez vos campagnes de notifications
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => setIsTemplateModalOpen(true)} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Templates
            </Button>
            
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle notification
            </Button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard
              title="Total notifications"
              value={stats.total.toString()}
              subtitle="Notifications créées"
              icon={<Bell className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard
              title="Envoyées"
              value={stats.sent.toString()}
              trend={{ value: stats.sent > 0 ? ((stats.sent / stats.total) * 100) : 0, isPositive: true, label: "du total" }}
              subtitle="Notifications envoyées"
              icon={<Send className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatCard
              title="Programmées"
              value={stats.scheduled.toString()}
              subtitle="En attente d'envoi"
              icon={<Clock className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <StatCard
              title="Taux de livraison"
              value={`${stats.avgDeliveryRate}%`}
              trend={{ value: stats.avgDeliveryRate, isPositive: stats.avgDeliveryRate > 90, label: "taux moyen" }}
              subtitle="Moyenne de livraison"
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </motion.div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Liste des notifications */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Filtres */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-4"
            >
              <div className="lg:col-span-2">
                <Input
                  placeholder="Rechercher des notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channels.map(channel => (
                    <SelectItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Liste */}
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => {
                const TypeIcon = getTypeIcon(notification.type);
                const ChannelIcon = getChannelIcon(notification.channel);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassMorphismCard className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <TypeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {notification.title}
                              </h3>
                              <Badge className={getTypeColor(notification.type)}>
                                {notification.type}
                              </Badge>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              <Badge className={getStatusColor(notification.status)}>
                                {notification.status}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <ChannelIcon className="h-3 w-3" />
                                {notification.channel}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {notification.targetAudience}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {notification.sentAt 
                                  ? `Envoyé le ${notification.sentAt.toLocaleDateString('fr-FR')}`
                                  : notification.scheduledAt
                                  ? `Programmé le ${notification.scheduledAt.toLocaleDateString('fr-FR')}`
                                  : `Créé le ${notification.createdAt.toLocaleDateString('fr-FR')}`
                                }
                              </span>
                            </div>
                            
                            {notification.deliveryStats && (
                              <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Envoyés:</span>
                                  <span className="ml-1 font-medium">{notification.deliveryStats.sent}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Livrés:</span>
                                  <span className="ml-1 font-medium">{calculateDeliveryRate(notification.deliveryStats)}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Ouverts:</span>
                                  <span className="ml-1 font-medium">{calculateOpenRate(notification.deliveryStats)}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Cliqués:</span>
                                  <span className="ml-1 font-medium">{calculateClickRate(notification.deliveryStats)}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedNotification(notification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {notification.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleSendNotification(notification.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </GlassMorphismCard>
                  </motion.div>
                );
              })}
            </div>

            {filteredNotifications.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucune notification trouvée
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Essayez de modifier vos critères de recherche
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-6">
            <div className="space-y-4">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassMorphismCard className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                          <Badge variant="outline">
                            {template.category}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {template.description}
                        </p>
                        
                        <div className="text-sm text-gray-500">
                          <p><strong>Type:</strong> {template.type}</p>
                          {template.subject && (
                            <p><strong>Sujet:</strong> {template.subject}</p>
                          )}
                          <p><strong>Variables:</strong> {template.variables.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </GlassMorphismCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassMorphismCard className="p-6">
                <CardHeader>
                  <CardTitle>Notifications par jour</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    type="line"
                    data={[
                      { name: 'Lun', value: 45 },
                      { name: 'Mar', value: 52 },
                      { name: 'Mer', value: 38 },
                      { name: 'Jeu', value: 67 },
                      { name: 'Ven', value: 89 },
                      { name: 'Sam', value: 34 },
                      { name: 'Dim', value: 28 }
                    ]}
                    height={300}
                  />
                </CardContent>
              </GlassMorphismCard>

              <GlassMorphismCard className="p-6">
                <CardHeader>
                  <CardTitle>Répartition par canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    type="bar"
                    data={[
                      { name: 'Email', value: 45 },
                      { name: 'Push', value: 30 },
                      { name: 'SMS', value: 15 },
                      { name: 'In-App', value: 10 }
                    ]}
                    height={300}
                  />
                </CardContent>
              </GlassMorphismCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de création */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle notification</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={newNotification.title || ''}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  placeholder="Titre de la notification"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message || ''}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  placeholder="Contenu de la notification"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value) => setNewNotification({...newNotification, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.slice(1).map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select
                    value={newNotification.priority}
                    onValueChange={(value) => setNewNotification({...newNotification, priority: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channel">Canal</Label>
                  <Select
                    value={newNotification.channel}
                    onValueChange={(value) => setNewNotification({...newNotification, channel: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.slice(1).map(channel => (
                        <SelectItem key={channel.value} value={channel.value}>
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="audience">Audience</Label>
                  <Select
                    value={newNotification.targetAudience}
                    onValueChange={(value) => setNewNotification({...newNotification, targetAudience: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map(audience => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateNotification}>
                  Créer la notification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de détails */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la notification</DialogTitle>
            </DialogHeader>
            
            {selectedNotification && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Titre</Label>
                    <p className="text-lg font-semibold">{selectedNotification.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <Badge className={getStatusColor(selectedNotification.status)}>
                      {selectedNotification.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Message</Label>
                  <p className="mt-1">{selectedNotification.message}</p>
                </div>
                
                {selectedNotification.deliveryStats && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-3 block">Statistiques de livraison</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedNotification.deliveryStats.sent}</div>
                        <div className="text-sm text-gray-500">Envoyés</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedNotification.deliveryStats.delivered}</div>
                        <div className="text-sm text-gray-500">Livrés</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{selectedNotification.deliveryStats.opened}</div>
                        <div className="text-sm text-gray-500">Ouverts</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{selectedNotification.deliveryStats.clicked}</div>
                        <div className="text-sm text-gray-500">Cliqués</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{selectedNotification.deliveryStats.failed}</div>
                        <div className="text-sm text-gray-500">Échecs</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NotificationsPage;