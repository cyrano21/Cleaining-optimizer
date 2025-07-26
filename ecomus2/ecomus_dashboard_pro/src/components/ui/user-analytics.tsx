"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Shield, Clock, ShoppingBag } from 'lucide-react';
import { GlassmorphismCard } from './glass-morphism-card';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinDate?: string;
  lastLogin?: string;
  isNew?: boolean;
  isActive?: boolean;
  orderCount?: number;
  totalSpent?: number;
  avgOrderValue?: number;
}

interface UserAnalyticsProps {
  recentUsers: User[];
  topUsers: User[];
  overview: {
    totalUsers: number;
    newUsersWeek: number;
    activeUsersWeek: number;
    growthRate: number;
  };
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Crown className="h-4 w-4 text-yellow-500" />;
    case 'moderator':
      return <Shield className="h-4 w-4 text-blue-500" />;
    default:
      return <User className="h-4 w-4 text-gray-500" />;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'moderator':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function UserAnalytics({ recentUsers, topUsers, overview }: UserAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Utilisateurs récents */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassmorphismCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Utilisateurs Récents</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                {overview.newUsersWeek} nouveaux cette semaine
              </span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="relative">
                  <img
                    src={user.avatar || '/images/avatar.webp'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {user.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  {user.isNew && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{user.name}</h4>
                    {getRoleIcon(user.role)}
                    {user.isNew && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                    {user.lastLogin && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassmorphismCard>
      </motion.div>

      {/* Top utilisateurs */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassmorphismCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Top Clients</h3>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-600">
                Par volume d'achat
              </span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {topUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <img
                    src={user.avatar || '/images/avatar.webp'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{user.name}</h4>
                    {getRoleIcon(user.role)}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        €{user.totalSpent?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {user.orderCount}
                      </div>
                      <div className="text-xs text-gray-500">Commandes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        €{user.avgOrderValue}
                      </div>
                      <div className="text-xs text-gray-500">Panier moy.</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassmorphismCard>
      </motion.div>
    </div>
  );
}
