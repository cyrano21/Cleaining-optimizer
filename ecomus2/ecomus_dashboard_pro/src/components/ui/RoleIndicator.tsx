"use client";

import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions, type UserRole } from '@/hooks/useRoleManagement';
import { Shield, Store, User, UserCheck, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configuration visuelle des rôles
const ROLE_STYLES = {
  super_admin: {
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-800',
    name: 'Super Administrateur',
    description: 'Contrôle total de la plateforme',
    emoji: '👑'
  },
  admin: {
    icon: Shield,
    gradient: 'from-red-500 to-orange-500',
    bgGradient: 'from-red-50 to-orange-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-800',
    name: 'Administrateur',
    description: 'Gestion de la plateforme',
    emoji: '🛡️'
  },
  vendor: {
    icon: Store,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800',
    name: 'Vendeur',
    description: 'Gestion de boutique',
    emoji: '🏪'
  },
  customer: {
    icon: User,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-800',
    name: 'Client',
    description: 'Utilisateur standard',
    emoji: '👤'
  },
  moderator: {
    icon: UserCheck,
    gradient: 'from-yellow-500 to-amber-500',
    bgGradient: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    name: 'Modérateur',
    description: 'Modération du contenu',
    emoji: '🎯'
  }
} as const;

interface RoleIndicatorProps {
  variant?: 'compact' | 'full' | 'badge' | 'card';
  showPermissions?: boolean;
  className?: string;
}

export function RoleIndicator({ 
  variant = 'compact', 
  showPermissions = false,
  className 
}: RoleIndicatorProps) {
  const { data: session } = useSession();
  const { userRole, permissions } = usePermissions();

  if (!session || !userRole) {
    return null;
  }

  const roleStyle = ROLE_STYLES[userRole as UserRole];
  if (!roleStyle) {
    return null;
  }

  const RoleIcon = roleStyle.icon;

  // Variant badge simple
  if (variant === 'badge') {
    return (
      <Badge className={cn(roleStyle.badgeColor, className)}>
        <span className="mr-1">{roleStyle.emoji}</span>
        {roleStyle.name}
      </Badge>
    );
  }

  // Variant compact
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "p-1.5 rounded-lg bg-gradient-to-r",
          roleStyle.gradient
        )}>
          <RoleIcon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">{session.user?.name}</p>
          <p className={cn("text-xs", roleStyle.textColor)}>{roleStyle.name}</p>
        </div>
      </div>
    );
  }

  // Variant full
  if (variant === 'full') {
    return (
      <div className={cn(
        "p-4 rounded-lg bg-gradient-to-r border",
        roleStyle.bgGradient,
        roleStyle.borderColor,
        className
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg bg-gradient-to-r",
            roleStyle.gradient
          )}>
            <RoleIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{session.user?.name}</h3>
              <span className="text-lg">{roleStyle.emoji}</span>
            </div>
            <Badge className={roleStyle.badgeColor}>
              {roleStyle.name}
            </Badge>
            <p className="text-sm text-gray-600 mt-1">
              {roleStyle.description}
            </p>
            
            {showPermissions && permissions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Permissions :
                </p>
                <div className="flex flex-wrap gap-1">
                  {permissions.slice(0, 5).map(permission => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {permissions.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{permissions.length - 5} autres
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Variant card
  if (variant === 'card') {
    return (
      <Card className={cn(roleStyle.borderColor, className)}>
        <CardContent className={cn(
          "p-4 bg-gradient-to-r",
          roleStyle.bgGradient
        )}>
          <div className="text-center space-y-3">
            <div className={cn(
              "w-12 h-12 mx-auto rounded-full bg-gradient-to-r flex items-center justify-center",
              roleStyle.gradient
            )}>
              <RoleIcon className="h-6 w-6 text-white" />
            </div>
            
            <div>
              <h3 className="font-semibold flex items-center justify-center gap-1">
                {session.user?.name}
                <span>{roleStyle.emoji}</span>
              </h3>
              <Badge className={cn("mt-1", roleStyle.badgeColor)}>
                {roleStyle.name}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600">
              {roleStyle.description}
            </p>
            
            {showPermissions && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Sparkles className="h-3 w-3" />
                  {permissions.length} permission{permissions.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default RoleIndicator;
