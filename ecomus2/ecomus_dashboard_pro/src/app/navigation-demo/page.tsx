"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SmartLayout from '@/components/layouts/SmartLayout';
import RoleIndicator from '@/components/ui/RoleIndicator';
import RoleNavigation from '@/components/navigation/RoleNavigation';
import { Separator } from '@/components/ui/separator';

export default function NavigationDemoPage() {
  return (
    <SmartLayout showSidebar={false}>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🧭 Navigation Intelligente</h1>
          <p className="text-gray-600">
            Démonstration du système de navigation adaptatif basé sur les rôles
          </p>
        </div>

        {/* Indicateurs de rôle */}
        <Card>
          <CardHeader>
            <CardTitle>Indicateurs de Rôle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Variant Compact</h3>
              <RoleIndicator variant="compact" />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3">Variant Badge</h3>
              <RoleIndicator variant="badge" />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3">Variant Card</h3>
              <div className="max-w-xs">
                <RoleIndicator variant="card" showPermissions />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3">Variant Full avec Permissions</h3>
              <RoleIndicator variant="full" showPermissions />
            </div>
          </CardContent>
        </Card>

        {/* Navigation en sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Sidebar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <RoleNavigation variant="sidebar" />
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Comment utiliser la Navigation Intelligente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">🎯 Fonctionnalités</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Navigation adaptée automatiquement selon le rôle de l'utilisateur</li>
                <li>Affichage uniquement des dashboards accessibles</li>
                <li>Actions rapides personnalisées par rôle</li>
                <li>Design cohérent avec indicateurs visuels</li>
                <li>Responsive (desktop, tablet, mobile)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🛠️ Composants disponibles</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><code>SmartNavbar</code> - Barre de navigation principale</li>
                <li><code>RoleNavigation</code> - Navigation adaptée aux rôles</li>
                <li><code>RoleIndicator</code> - Indicateur visuel du rôle</li>
                <li><code>SmartLayout</code> - Layout avec sidebar conditionnelle</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🎨 Variants disponibles</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Navigation:</strong> dropdown, sidebar, mobile</li>
                <li><strong>Indicateur:</strong> compact, full, badge, card</li>
                <li><strong>Layout:</strong> avec ou sans sidebar</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🔧 Intégration</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <p>// Dans votre layout</p>
                <p>import SmartLayout from '@/components/layouts/SmartLayout';</p>
                <p>&lt;SmartLayout&gt;...&lt;/SmartLayout&gt;</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statut par rôle */}
        <Card>
          <CardHeader>
            <CardTitle>Accès par Rôle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { role: 'super_admin', name: 'Super Admin', access: '5 dashboards', color: 'text-purple-600' },
                { role: 'admin', name: 'Admin', access: '4 dashboards', color: 'text-red-600' },
                { role: 'vendor', name: 'Vendeur', access: '1 dashboard', color: 'text-blue-600' },
                { role: 'customer', name: 'Client', access: '1 dashboard', color: 'text-green-600' },
                { role: 'moderator', name: 'Modérateur', access: '1 dashboard', color: 'text-yellow-600' },
              ].map(item => (
                <div key={item.role} className="p-3 border rounded-lg">
                  <h4 className={`font-medium ${item.color}`}>{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.access}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SmartLayout>
  );
}
