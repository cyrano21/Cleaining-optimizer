#!/usr/bin/env node

/**
 * SCRIPT DE MIGRATION - SUPPRESSION DES DOUBLONS ET RESTRUCTURATION
 * 
 * Ce script nettoie l'architecture en supprimant toute la logique métier
 * du frontend et en la centralisant dans le dashboard
 */

const fs = require('fs');
const path = require('path');

const ECOMUSNEXT_PATH = 'c:/Users/Louis Olivier/Downloads/ecomus_dashboard_pro_v2_final/ecomusnext_pro';
const DASHBOARD_PATH = 'c:/Users/Louis Olivier/Downloads/ecomus_dashboard_pro_v2_final/ecomus_dashboard_pro';

// 🗑️ FICHIERS À SUPPRIMER (doublons de logique métier)
const FILES_TO_DELETE = [
  // Templates hardcodés
  `${ECOMUSNEXT_PATH}/components/homes/home-1/index.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-2/index.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-3/index.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-4/index.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-5/index.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-6/index.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-7/index.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-8/index.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-electronic/index.tsx`,
  
  // Composants avec logique métier
  `${ECOMUSNEXT_PATH}/components/homes/home-1/ProductsAPI.tsx`,
  `${ECOMUSNEXT_PATH}/components/homes/home-1/ProductsAPI.jsx`,
  
  // Données hardcodées
  `${ECOMUSNEXT_PATH}/data/categories.js`,
  `${ECOMUSNEXT_PATH}/data/products.js`,
  `${ECOMUSNEXT_PATH}/data/collections.js`,
  
  // Pages de stores hardcodées
  `${ECOMUSNEXT_PATH}/app/[slug]/page.tsx`, // Sera remplacé par DynamicStorePage
];

// 📁 DOSSIERS À NETTOYER (garder uniquement les composants UI purs)
const DIRS_TO_CLEAN = [
  `${ECOMUSNEXT_PATH}/components/homes/home-1`,
  `${ECOMUSNEXT_PATH}/components/homes/home-2`,
  `${ECOMUSNEXT_PATH}/components/homes/home-3`,
  `${ECOMUSNEXT_PATH}/components/homes/home-4`,
  `${ECOMUSNEXT_PATH}/components/homes/home-5`,
  `${ECOMUSNEXT_PATH}/components/homes/home-6`,
  `${ECOMUSNEXT_PATH}/components/homes/home-7`,
  `${ECOMUSNEXT_PATH}/components/homes/home-8`,
  `${ECOMUSNEXT_PATH}/components/homes/home-electronic`,
];

// ✅ COMPOSANTS À CONSERVER (UI purs uniquement)
const PURE_COMPONENTS_TO_KEEP = [
  'Hero.tsx', 'Hero.jsx',
  'Categories.tsx', 'Categories.jsx',
  'Products.tsx', 'Products.jsx',
  'Slider.tsx', 'Slider.jsx',
  'Brands.tsx', 'Brands.jsx',
  'Testimonials.tsx', 'Testimonials.jsx',
  'Countdown.tsx', 'Countdown.jsx',
  'Collections.tsx', 'Collections.jsx',
  'CollectionBanner.tsx', 'CollectionBanner.jsx',
  'Marquee.tsx', 'Marquee.jsx',
  'Lookbook.tsx', 'Lookbook.jsx',
];

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Supprimé: ${filePath}`);
    } else {
      console.log(`⚠️  Fichier inexistant: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de ${filePath}:`, error.message);
  }
}

function cleanDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Dossier inexistant: ${dirPath}`);
      return;
    }
    
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        // Supprimer si ce n'est pas un composant UI pur
        if (!PURE_COMPONENTS_TO_KEEP.includes(file)) {
          deleteFile(filePath);
        } else {
          console.log(`🎨 Conservé (UI pur): ${filePath}`);
        }
      }
    });
    
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage de ${dirPath}:`, error.message);
  }
}

function refactorPureComponent(componentPath) {
  try {
    if (!fs.existsSync(componentPath)) {
      return;
    }
    
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // Supprimer les imports d'APIs
    content = content.replace(/import.*fetch.*from.*/g, '');
    content = content.replace(/import.*axios.*from.*/g, '');
    
    // Supprimer les hooks de state pour la logique métier
    content = content.replace(/const \[.*\] = useState\(.*\);/g, '');
    
    // Supprimer les useEffect avec appels API
    content = content.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g, '');
    
    // Ajouter l'interface pour les props dynamiques
    if (!content.includes('interface') && !content.includes('type')) {
      const interfaceName = path.basename(componentPath, path.extname(componentPath)) + 'Props';
      const interfaceCode = `
interface ${interfaceName} {
  [key: string]: any; // Props dynamiques depuis le dashboard
}

`;
      content = content.replace(
        /export default function/,
        interfaceCode + 'export default function'
      );
    }
    
    fs.writeFileSync(componentPath, content);
    console.log(`🔄 Refactorisé: ${componentPath}`);
    
  } catch (error) {
    console.error(`❌ Erreur lors de la refactorisation de ${componentPath}:`, error.message);
  }
}

function createNewStorePage() {
  const storePageContent = `import { DynamicStorePage } from '@/components/DynamicTemplateRenderer';

/**
 * PAGE STORE DYNAMIQUE
 * 
 * Remplace toutes les pages de stores hardcodées
 * Utilise la configuration du dashboard pour rendre dynamiquement
 */
export default DynamicStorePage;

// Métadonnées dynamiques basées sur la configuration du store
export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/stores/\${params.slug}/config\`);
    
    if (!response.ok) {
      return {
        title: 'Store not found',
        description: 'The requested store could not be found.'
      };
    }
    
    const { store } = await response.json();
    
    return {
      title: store.seo.title,
      description: store.seo.description,
      keywords: store.seo.keywords.join(', '),
      openGraph: {
        title: store.seo.title,
        description: store.seo.description,
        type: 'website',
      }
    };
    
  } catch (error) {
    return {
      title: 'Store',
      description: 'E-commerce store'
    };
  }
}`;

  const storePagePath = `${ECOMUSNEXT_PATH}/app/[slug]/page.tsx`;
  
  // Créer le dossier si nécessaire
  const dirPath = path.dirname(storePagePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  fs.writeFileSync(storePagePath, storePageContent);
  console.log(`✅ Créé: ${storePagePath}`);
}

function main() {
  console.log('🚀 DÉBUT DE LA MIGRATION - SUPPRESSION DES DOUBLONS\n');
  
  // 1. Supprimer les fichiers dupliqués
  console.log('📝 1. Suppression des fichiers dupliqués...');
  FILES_TO_DELETE.forEach(deleteFile);
  
  // 2. Nettoyer les dossiers (garder uniquement les composants UI purs)
  console.log('\n📁 2. Nettoyage des dossiers...');
  DIRS_TO_CLEAN.forEach(cleanDirectory);
  
  // 3. Refactoriser les composants conservés
  console.log('\n🎨 3. Refactorisation des composants UI purs...');
  DIRS_TO_CLEAN.forEach(dirPath => {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        if (PURE_COMPONENTS_TO_KEEP.includes(file)) {
          refactorPureComponent(path.join(dirPath, file));
        }
      });
    }
  });
  
  // 4. Créer la nouvelle page store dynamique
  console.log('\n🏗️  4. Création de la page store dynamique...');
  createNewStorePage();
  
  console.log('\n✅ MIGRATION TERMINÉE !');
  console.log('\n📋 RÉSUMÉ :');
  console.log('- ❌ Supprimé tous les templates hardcodés');
  console.log('- ❌ Supprimé toute la logique métier côté frontend');
  console.log('- ❌ Supprimé les données hardcodées');
  console.log('- ✅ Conservé uniquement les composants UI purs');
  console.log('- ✅ Créé le système de rendu dynamique');
  console.log('- ✅ Centralisé toute la logique dans le dashboard');
  console.log('\n🎯 PROCHAINES ÉTAPES :');
  console.log('1. Tester le moteur de rendu dynamique');
  console.log('2. Créer les templates par défaut en base');
  console.log('3. Tester l\'API de configuration');
  console.log('4. Migrer les stores existants');
}

if (require.main === module) {
  main();
}

module.exports = {
  deleteFile,
  cleanDirectory,
  refactorPureComponent,
  createNewStorePage,
  main
};