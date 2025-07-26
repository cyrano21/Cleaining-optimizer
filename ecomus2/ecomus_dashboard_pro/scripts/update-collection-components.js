/**
 * Script pour mettre à jour automatiquement tous les composants de collections
 * pour utiliser le nouveau système dynamique
 * 
 * Usage: node scripts/update-collection-components.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration des mappings entre les anciens composants et les nouvelles configurations
const componentMappings = {
  'home-headphone': {
    category: 'headphones',
    variant: 'electronics',
    layout: 'carousel',
    limit: 6,
    featured: true
  },
  'home-electronic': {
    category: 'electronics',
    variant: 'electronics',
    layout: 'grid',
    limit: 8,
    featured: true
  },
  'home-furniture-02': {
    category: 'furniture',
    variant: 'furniture',
    layout: 'grid',
    limit: 6,
    featured: true
  },
  'home-plant': {
    category: 'plants',
    variant: 'nature',
    layout: 'carousel',
    limit: 4,
    featured: true
  },
  'home-pod-store': {
    category: 'electronics',
    variant: 'electronics',
    layout: 'carousel',
    limit: 5,
    featured: true
  },
  'home-5': {
    category: 'fashion',
    variant: 'fashion',
    layout: 'grid',
    limit: 6,
    featured: true
  },
  'home-book-store': {
    category: 'books',
    variant: 'minimal',
    layout: 'grid',
    limit: 8,
    featured: true
  },
  'home-gaming-accessories': {
    category: 'gaming',
    variant: 'gaming',
    layout: 'carousel',
    limit: 6,
    featured: true
  }
};

// Template pour le nouveau composant dynamique
function generateDynamicComponent(homeName, config) {
  const componentName = homeName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('') + 'Collections';
  
  const fallbackComponentName = componentName + 'Fallback';
  
  return `'use client';

import React from 'react';
import DynamicCollections from '@/components/shared/DynamicCollections';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';

// Import des données statiques pour le fallback
import { collections3 } from '@/data/categories';

// Configuration pour les collections ${homeName}
const collectionsConfig = {
  category: '${config.category}',
  featured: ${config.featured},
  limit: ${config.limit},
  layout: '${config.layout}',
  variant: '${config.variant}'
};

// Composant de rendu personnalisé pour ${homeName}
const ${componentName}Renderer = ({ collections, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="tf-section-2 pt_94 pb_140">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="masonry-layout-v4">
                {[...Array(${config.limit})].map((_, index) => (
                  <div key={index} className="collection-item-v4 hover-img">
                    <div className="collection-inner">
                      <div className="collection-image animate-pulse bg-gray-200 h-64"></div>
                      <div className="collection-content">
                        <div className="animate-pulse bg-gray-200 h-4 w-3/4 mb-2"></div>
                        <div className="animate-pulse bg-gray-200 h-3 w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Erreur lors du chargement des collections:', error);
    return <${fallbackComponentName} />;
  }

  if (!collections || collections.length === 0) {
    return <${fallbackComponentName} />;
  }

  return (
    <div className="tf-section-2 pt_94 pb_140">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="masonry-layout-v4">
              ${config.layout === 'carousel' ? `
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                modules={[Navigation, Pagination]}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: ${Math.min(config.limit, 4)} }
                }}
              >
                {collections.map((collection, index) => (
                  <SwiperSlide key={collection._id || index}>
                    <div className="collection-item-v4 hover-img">
                      <div className="collection-inner">
                        <Link href={\`/shop-collection-sub?collection=\${collection.slug}\`} className="collection-image">
                          <Image
                            className="lazyload"
                            data-src={collection.imgSrc || '/images/collections/default.jpg'}
                            alt={collection.altText || collection.title}
                            src={collection.imgSrc || '/images/collections/default.jpg'}
                            width={600}
                            height={721}
                          />
                        </Link>
                        <div className="collection-content">
                          <Link href={\`/shop-collection-sub?collection=\${collection.slug}\`} className="link">
                            <h5>{collection.title}</h5>
                          </Link>
                          {collection.description && (
                            <p className="subheading">{collection.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              ` : `
              {collections.map((collection, index) => (
                <div key={collection._id || index} className="collection-item-v4 hover-img">
                  <div className="collection-inner">
                    <Link href={\`/shop-collection-sub?collection=\${collection.slug}\`} className="collection-image">
                      <Image
                        className="lazyload"
                        data-src={collection.imgSrc || '/images/collections/default.jpg'}
                        alt={collection.altText || collection.title}
                        src={collection.imgSrc || '/images/collections/default.jpg'}
                        width={600}
                        height={721}
                      />
                    </Link>
                    <div className="collection-content">
                      <Link href={\`/shop-collection-sub?collection=\${collection.slug}\`} className="link">
                        <h5>{collection.title}</h5>
                      </Link>
                      {collection.description && (
                        <p className="subheading">{collection.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de fallback utilisant les données statiques
const ${fallbackComponentName} = () => {
  return (
    <div className="tf-section-2 pt_94 pb_140">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="masonry-layout-v4">
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                modules={[Navigation, Pagination]}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 }
                }}
              >
                {collections3.slice(0, ${config.limit}).map((collection, index) => (
                  <SwiperSlide key={index}>
                    <div className="collection-item-v4 hover-img">
                      <div className="collection-inner">
                        <Link href={collection.href} className="collection-image">
                          <Image
                            className="lazyload"
                            data-src={collection.imgSrc}
                            alt={collection.altText}
                            src={collection.imgSrc}
                            width={600}
                            height={721}
                          />
                        </Link>
                        <div className="collection-content">
                          <Link href={collection.href} className="link">
                            <h5>{collection.title}</h5>
                          </Link>
                          <p className="subheading">{collection.subheading}</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const ${componentName} = () => {
  return (
    <DynamicCollections
      config={collectionsConfig}
      customRenderer={${componentName}Renderer}
      fallbackComponent={${fallbackComponentName}}
    />
  );
};

export default ${componentName};
export { ${fallbackComponentName} };`;
}

// Fonction pour trouver tous les fichiers Collections.jsx/tsx
function findCollectionFiles() {
  const pattern = 'components/homes/*/Collections.{js,jsx,ts,tsx}';
  const files = glob.sync(pattern, { cwd: process.cwd() });
  return files;
}

// Fonction pour extraire le nom du home depuis le chemin
function extractHomeName(filePath) {
  const match = filePath.match(/components\/homes\/([^/]+)\/Collections/);
  return match ? match[1] : null;
}

// Fonction pour créer une sauvegarde
function createBackup(filePath) {
  const backupPath = filePath.replace(/\.(jsx?|tsx?)$/, '.backup.$1');
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`📁 Sauvegarde créée: ${backupPath}`);
  }
}

// Fonction pour mettre à jour un fichier de collection
function updateCollectionFile(filePath) {
  const homeName = extractHomeName(filePath);
  
  if (!homeName || !componentMappings[homeName]) {
    console.log(`⚠️  Configuration non trouvée pour: ${homeName}`);
    return false;
  }
  
  const config = componentMappings[homeName];
  const newContent = generateDynamicComponent(homeName, config);
  
  try {
    // Créer une sauvegarde
    createBackup(filePath);
    
    // Écrire le nouveau contenu
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Mis à jour: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour créer le fichier de configuration globale
function createGlobalConfig() {
  const configContent = `/**
 * Configuration globale pour les collections dynamiques
 * Ce fichier centralise toutes les configurations des collections par home
 */

export const collectionsConfig = {
${Object.entries(componentMappings).map(([homeName, config]) => `  '${homeName}': {
    category: '${config.category}',
    variant: '${config.variant}',
    layout: '${config.layout}',
    limit: ${config.limit},
    featured: ${config.featured}
  }`).join(',\n')}
};

// Configuration par défaut
export const defaultCollectionConfig = {
  category: null,
  variant: 'default',
  layout: 'grid',
  limit: 6,
  featured: false
};

// Fonction utilitaire pour obtenir la configuration d'un home
export function getCollectionConfig(homeName) {
  return collectionsConfig[homeName] || defaultCollectionConfig;
}

// Types de layouts disponibles
export const availableLayouts = ['grid', 'carousel', 'masonry', 'list'];

// Variantes de style disponibles
export const availableVariants = [
  'default',
  'electronics',
  'fashion',
  'furniture',
  'nature',
  'minimal',
  'gaming',
  'luxury'
];
`;
  
  const configPath = 'config/collections.js';
  
  // Créer le dossier config s'il n'existe pas
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log(`✅ Configuration globale créée: ${configPath}`);
}

// Fonction pour créer un guide de migration
function createMigrationGuide() {
  const guideContent = `# Guide de Migration des Collections

## Résumé

Ce script a automatiquement converti vos composants de collections statiques en composants dynamiques qui récupèrent les données depuis la base de données.

## Changements effectués

### 1. Composants mis à jour

${Object.keys(componentMappings).map(homeName => `- \`components/homes/${homeName}/Collections.jsx\` → Version dynamique`).join('\n')}

### 2. Fichiers créés

- \`config/collections.js\` - Configuration globale des collections
- \`scripts/migrate-collections.js\` - Script de migration des données
- \`components/shared/DynamicCollections.tsx\` - Composant partagé
- \`hooks/useCollections.ts\` - Hook personnalisé pour les collections

### 3. Sauvegardes

Tous les fichiers originaux ont été sauvegardés avec l'extension \`.backup.jsx\`

## Étapes suivantes

### 1. Exécuter la migration des données

\`\`\`bash
# Installer les dépendances si nécessaire
npm install

# Exécuter la migration
node scripts/migrate-collections.js

# Pour nettoyer et recréer toutes les collections
node scripts/migrate-collections.js --clean
\`\`\`

### 2. Vérifier le fonctionnement

1. Démarrez votre serveur de développement
2. Visitez les pages d'accueil pour vérifier que les collections s'affichent
3. Vérifiez le dashboard des collections

### 3. Personnaliser les configurations

Modifiez \`config/collections.js\` pour ajuster:
- Les catégories affichées
- Le nombre d'éléments
- Le style de mise en page
- Les filtres

### 4. Ajouter de vraies données

1. Connectez-vous au dashboard
2. Allez dans "Collections"
3. Créez ou modifiez les collections
4. Associez des produits réels
5. Mettez à jour les images

## Configuration par home

${Object.entries(componentMappings).map(([homeName, config]) => `### ${homeName}
- **Catégorie**: ${config.category}
- **Variante**: ${config.variant}
- **Layout**: ${config.layout}
- **Limite**: ${config.limit}
- **Vedette uniquement**: ${config.featured ? 'Oui' : 'Non'}`).join('\n\n')}

## Rollback

Pour revenir aux composants statiques:

\`\`\`bash
# Restaurer les fichiers de sauvegarde
find components/homes -name "*.backup.jsx" -exec sh -c 'mv "$1" "\${1%.backup.jsx}.jsx"' _ {} \;
\`\`\`

## Support

En cas de problème:
1. Vérifiez les logs de la console
2. Assurez-vous que MongoDB est connecté
3. Vérifiez que les collections existent dans la base de données
4. Utilisez les composants de fallback en cas d'erreur
`;
  
  fs.writeFileSync('MIGRATION_GUIDE.md', guideContent, 'utf8');
  console.log('✅ Guide de migration créé: MIGRATION_GUIDE.md');
}

// Fonction principale
function main() {
  console.log('🚀 Début de la mise à jour des composants de collections...');
  
  // Trouver tous les fichiers de collections
  const collectionFiles = findCollectionFiles();
  
  if (collectionFiles.length === 0) {
    console.log('⚠️  Aucun fichier de collection trouvé');
    return;
  }
  
  console.log(`📁 ${collectionFiles.length} fichiers de collection trouvés`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  // Mettre à jour chaque fichier
  for (const filePath of collectionFiles) {
    const homeName = extractHomeName(filePath);
    
    if (componentMappings[homeName]) {
      if (updateCollectionFile(filePath)) {
        updatedCount++;
      }
    } else {
      console.log(`⚠️  Ignoré (pas de configuration): ${filePath}`);
      skippedCount++;
    }
  }
  
  // Créer les fichiers de configuration
  createGlobalConfig();
  createMigrationGuide();
  
  console.log('\n📊 Résumé:');
  console.log(`✅ Fichiers mis à jour: ${updatedCount}`);
  console.log(`⚠️  Fichiers ignorés: ${skippedCount}`);
  console.log('\n🎉 Mise à jour terminée!');
  console.log('\n💡 Prochaines étapes:');
  console.log('1. Exécutez: node scripts/migrate-collections.js');
  console.log('2. Testez vos pages d\'accueil');
  console.log('3. Consultez MIGRATION_GUIDE.md pour plus de détails');
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  updateCollectionFile,
  generateDynamicComponent,
  componentMappings,
  findCollectionFiles
};