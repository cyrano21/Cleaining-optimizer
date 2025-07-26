import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Store, Tag, Settings, Zap } from 'lucide-react';

interface ProductCreationHelpProps {
  children: React.ReactNode;
}

export default function ProductCreationHelp({ children }: ProductCreationHelpProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Guide de création de produit multi-store
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section Boutiques */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Sélection de boutique</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-gray-700">
                <strong>Fonctionnalité multi-store :</strong> Chaque produit appartient à une boutique spécifique.
                La sélection de la boutique détermine :
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Les catégories disponibles pour ce produit</li>
                <li>Les attributs prédéfinis accessibles</li>
                <li>Les limitations selon le plan d'abonnement</li>
                <li>L'emplacement où le produit apparaîtra</li>
              </ul>
              
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Plans d'abonnement :</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Badge variant="outline" className="text-gray-500">
                    FREE: 10 produits, 5 attributs
                  </Badge>
                  <Badge variant="outline" className="text-blue-500">
                    BASIC: 100 produits, 15 attributs
                  </Badge>
                  <Badge variant="outline" className="text-purple-500">
                    PREMIUM: 1000 produits, 50 attributs
                  </Badge>
                  <Badge variant="outline" className="text-yellow-600">
                    ENTERPRISE: Illimité
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Section Catégories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Catégories et organisation</h3>
            </div>
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-gray-700">
                <strong>Logique de catégorisation :</strong> Les catégories définissent l'emplacement du produit dans la boutique.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Chaque boutique a ses propres catégories</li>
                <li>La sélection d'une catégorie charge les attributs associés</li>
                <li>Les attributs changent automatiquement selon la catégorie</li>
                <li>Permet une organisation cohérente par type de produit</li>
              </ul>
            </div>
          </div>

          {/* Section Attributs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Gestion des attributs</h3>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-gray-700">
                <strong>Système d'attributs flexible :</strong> Deux approches pour définir les caractéristiques du produit.
              </p>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-400 pl-3">
                  <h4 className="font-medium text-sm text-gray-800">Attributs prédéfinis</h4>
                  <p className="text-xs text-gray-600">
                    Utilisez les attributs existants pour maintenir la cohérence.
                    Ces attributs sont partagés entre les produits de même catégorie.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-400 pl-3">
                  <h4 className="font-medium text-sm text-gray-800">Attributs personnalisés</h4>
                  <p className="text-xs text-gray-600">
                    Créez de nouveaux attributs si les prédéfinis ne suffisent pas.
                    Disponible selon votre plan d'abonnement (Basic+).
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-600">
                  <strong>Astuce :</strong> Les attributs personnalisés créés sont automatiquement 
                  sauvegardés et pourront être réutilisés pour d'autres produits de la même catégorie.
                </p>
              </div>
            </div>
          </div>

          {/* Section Fonctionnalités avancées */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Fonctionnalités avancées</h3>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg space-y-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-800 mb-1">Médias enrichis</h4>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    <li>Images multiples avec gestion optimisée</li>
                    <li>Vidéos (upload, YouTube, Vimeo)</li>
                    <li>Modèles 3D interactifs</li>
                    <li>Vues 360° personnalisables</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-800 mb-1">Optimisation SEO</h4>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    <li>Titre et description SEO dédiés</li>
                    <li>Génération automatique de slug</li>
                    <li>Tags pour améliorer la découvrabilité</li>
                    <li>Optimisation par boutique</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section Workflow */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Workflow recommandé</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li><strong>Sélectionnez la boutique</strong> - Détermine le contexte et les limitations</li>
                <li><strong>Choisissez la catégorie</strong> - Définit l'emplacement et les attributs disponibles</li>
                <li><strong>Remplissez les informations de base</strong> - Titre, description, prix, SKU</li>
                <li><strong>Configurez les attributs</strong> - Utilisez les prédéfinis ou créez des personnalisés</li>
                <li><strong>Ajoutez les médias</strong> - Images, vidéos, modèles 3D selon vos besoins</li>
                <li><strong>Optimisez pour le SEO</strong> - Titre, description et tags appropriés</li>
                <li><strong>Vérifiez et sauvegardez</strong> - Le produit sera créé dans la boutique sélectionnée</li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}