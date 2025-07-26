"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions, ROLE_DASHBOARDS, type UserRole } from '@/hooks/useRoleManagement';
import { Shield, Store, User, UserCheck, Crown, ArrowRight, Lock } from 'lucide-react';

// Icônes pour chaque rôle
const ROLE_ICONS = {
  super_admin: Crown,
  admin: Shield,
  vendor: Store,
  customer: User,
  moderator: UserCheck,
} as const;

// Couleurs pour chaque rôle
const ROLE_COLORS = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
  vendor: 'bg-blue-100 text-blue-800',
  customer: 'bg-green-100 text-green-800',
  moderator: 'bg-yellow-100 text-yellow-800',
} as const;

export default function RoleSystemTester() {
  const { data: session } = useSession();
  const { userRole, canAccessDashboard, permissions } = usePermissions();
  const router = useRouter();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const testDashboardAccess = async (targetRole: UserRole) => {
    try {
      const canAccess = canAccessDashboard(targetRole);
      const dashboard = ROLE_DASHBOARDS[targetRole];
      
      setTestResults(prev => ({
        ...prev,
        [targetRole]: canAccess
      }));
      
      if (canAccess) {
        router.push(dashboard);
      }
      
      return canAccess;
    } catch (error) {
      console.error(`Erreur lors du test d'accès pour ${targetRole}:`, error);
      return false;
    }
  };

  if (!session) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-center">Non connecté</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Vous devez être connecté pour tester le système de rôles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Testeur du Système de Rôles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Utilisateur actuel:</span>
                <span>{session.user?.name || 'Inconnu'}</span>
              </div>
              <Badge className={ROLE_COLORS[userRole as UserRole] || 'bg-gray-100 text-gray-800'}>
                {userRole?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            
            <div>
              <span className="font-medium">Permissions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {permissions.map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test d'Accès aux Dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(Object.entries(ROLE_DASHBOARDS) as [UserRole, string][]).map(([role, dashboard]) => {
              const Icon = ROLE_ICONS[role];
              const canAccess = canAccessDashboard(role);
              const testResult = testResults[role];
              
              return (
                <Card key={role} className={`border-2 ${canAccess ? 'border-green-200' : 'border-red-200'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4" />
                      {role.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-gray-600">
                      Route: {dashboard}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {canAccess ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ✅ Autorisé
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          🚫 Interdit
                        </Badge>
                      )}
                      
                      {testResult !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {testResult ? '✅ Testé' : '❌ Échec'}
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant={canAccess ? "default" : "secondary"}
                      className="w-full text-xs"
                      onClick={() => testDashboardAccess(role)}
                      disabled={!canAccess}
                    >
                      {canAccess ? (
                        <>
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Tester l'accès
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Accès refusé
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résultats des Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(testResults).length === 0 ? (
            <p className="text-gray-600 text-center">
              Aucun test effectué. Cliquez sur les boutons ci-dessus pour tester l'accès aux dashboards.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(testResults).map(([role, success]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="font-medium">{role.replace('_', ' ').toUpperCase()}</span>
                  <Badge className={success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {success ? '✅ Succès' : '❌ Échec'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Les dashboards <strong>verts</strong> sont accessibles selon vos permissions</p>
          <p>• Les dashboards <strong>rouges</strong> sont interdits pour votre rôle</p>
          <p>• Cliquez sur "Tester l'accès" pour naviguer vers un dashboard autorisé</p>
          <p>• Le système vous redirigera automatiquement si vous tentez d'accéder à une route interdite</p>
        </CardContent>
      </Card>
    </div>
  );
}
