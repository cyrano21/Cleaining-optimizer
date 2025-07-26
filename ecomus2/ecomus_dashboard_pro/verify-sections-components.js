#!/usr/bin/env node

/**
 * SCRIPT DE VÉRIFICATION - CORRESPONDANCE SECTIONS ↔ COMPOSANTS
 * 
 * Vérifie que les sections créées dans les templates correspondent
 * exactement aux composants qui existent dans le frontend hardcodé
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus_dashboard';
const FRONTEND_PATH = '../ecomusnext_pro/components/homes';

// Schéma simplifié pour lire les templates
const TemplateSchema = new mongoose.Schema({
  name: String,
  category: String,
  sections: [{
    type: String,
    component: String,
    name: String,
    order: Number,
    isActive: Boolean,
    defaultProps: mongoose.Schema.Types.Mixed
  }]
}, { strict: false });

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function analyzeRealComponents() {
  console.log('🔍 ANALYSE DES COMPOSANTS RÉELS DANS LE FRONTEND...\n');
  
  const results = {};
  
  try {
    const homesDirs = fs.readdirSync(FRONTEND_PATH);
    
    for (const homeDir of homesDirs) {
      const homePath = path.join(FRONTEND_PATH, homeDir);
      
      if (fs.statSync(homePath).isDirectory()) {
        const components = fs.readdirSync(homePath)
          .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'))
          .filter(file => file !== 'index.tsx' && file !== 'index.jsx');
        
        results[homeDir] = {
          components: components.map(comp => comp.replace(/\.(tsx|jsx)$/, '')),
          hasIndex: fs.existsSync(path.join(homePath, 'index.tsx')) || fs.existsSync(path.join(homePath, 'index.jsx'))
        };
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse du frontend:', error.message);
    return {};
  }
}

function analyzeIndexFile(homeDir) {
  try {
    const indexPath = path.join(FRONTEND_PATH, homeDir, 'index.tsx');
    const indexPathJsx = path.join(FRONTEND_PATH, homeDir, 'index.jsx');
    
    let indexFile;
    if (fs.existsSync(indexPath)) {
      indexFile = indexPath;
    } else if (fs.existsSync(indexPathJsx)) {
      indexFile = indexPathJsx;
    } else {
      return { imports: [], order: [] };
    }
    
    const content = fs.readFileSync(indexFile, 'utf8');
    
    // Extraire les imports
    const importRegex = /import\s+(\w+)\s+from\s+['"]\.\/([\w-]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        component: match[1],
        file: match[2]
      });
    }
    
    // Extraire l'ordre d'utilisation dans le JSX
    const jsxStart = content.indexOf('return (') || content.indexOf('return(');
    const jsxContent = content.substring(jsxStart);
    
    const componentOrder = [];
    imports.forEach(imp => {
      const componentRegex = new RegExp(`<${imp.component}[^>]*>|<${imp.component}\\s*/>`, 'g');
      const matches = [...jsxContent.matchAll(componentRegex)];
      if (matches.length > 0) {
        componentOrder.push({
          component: imp.component,
          file: imp.file,
          position: matches[0].index
        });
      }
    });
    
    componentOrder.sort((a, b) => a.position - b.position);
    
    return {
      imports,
      order: componentOrder.map((item, index) => ({
        ...item,
        order: index + 1
      }))
    };
    
  } catch (error) {
    console.log(`⚠️  Impossible d'analyser l'index de ${homeDir}:`, error.message);
    return { imports: [], order: [] };
  }
}

async function compareWithTemplates() {
  const Template = mongoose.model('Template', TemplateSchema);
  const templates = await Template.find({ sections: { $exists: true, $not: { $size: 0 } } }).lean();
  
  console.log('📊 COMPARAISON SECTIONS ↔ COMPOSANTS RÉELS\n');
  console.log('============================================\n');
  
  for (const template of templates) {
    console.log(`📄 TEMPLATE: ${template.name} (${template.category})`);
    console.log('─'.repeat(50));
    
    // Trouver le répertoire correspondant
    const possibleDirs = [
      template.name?.toLowerCase().replace(/\s+/g, '-'),
      template.slug,
      `home-${template.name?.toLowerCase().replace(/\s+/g, '-')}`,
      template.category?.toLowerCase()
    ].filter(Boolean);
    
    let correspondingDir = null;
    const frontendComponents = await analyzeRealComponents();
    
    for (const dir of possibleDirs) {
      if (frontendComponents[dir]) {
        correspondingDir = dir;
        break;
      }
    }
    
    if (correspondingDir) {
      console.log(`✅ Frontend trouvé: ${correspondingDir}`);
      
      const realComponents = frontendComponents[correspondingDir];
      const indexAnalysis = analyzeIndexFile(correspondingDir);
      
      console.log(`📁 Composants réels: ${realComponents.components.join(', ')}`);
      console.log(`📋 Ordre d'utilisation:`);
      indexAnalysis.order.forEach(item => {
        console.log(`   ${item.order}. ${item.component} (${item.file})`);
      });
      
      console.log(`🔧 Sections configurées:`);
      template.sections
        .sort((a, b) => a.order - b.order)
        .forEach(section => {
          const match = realComponents.components.includes(section.component) ? '✅' : '❌';
          console.log(`   ${section.order}. ${section.name} (${section.component}) ${match}`);
        });
      
      // Vérifier les correspondances
      const missingInTemplate = realComponents.components.filter(comp => 
        !template.sections.some(section => section.component === comp)
      );
      
      const missingInFrontend = template.sections.filter(section =>
        !realComponents.components.includes(section.component)
      );
      
      if (missingInTemplate.length > 0) {
        console.log(`⚠️  Composants réels manquants en template: ${missingInTemplate.join(', ')}`);
      }
      
      if (missingInFrontend.length > 0) {
        console.log(`❌ Composants configurés inexistants: ${missingInFrontend.map(s => s.component).join(', ')}`);
      }
      
      if (missingInTemplate.length === 0 && missingInFrontend.length === 0) {
        console.log(`🎉 PARFAIT: Correspondance complète !`);
      }
      
    } else {
      console.log(`❌ Aucun répertoire frontend correspondant trouvé`);
      console.log(`   Cherché: ${possibleDirs.join(', ')}`);
      console.log(`   Disponibles: ${Object.keys(frontendComponents).join(', ')}`);
    }
    
    console.log('');
  }
}

async function main() {
  console.log('🔍 VÉRIFICATION CORRESPONDANCE SECTIONS ↔ COMPOSANTS');
  console.log('=====================================================\n');
  
  await connectDB();
  
  console.log('📂 ANALYSE DU FRONTEND...');
  const frontendComponents = await analyzeRealComponents();
  
  console.log(`📊 ${Object.keys(frontendComponents).length} répertoires trouvés:\n`);
  
  Object.entries(frontendComponents).forEach(([dir, info]) => {
    console.log(`📁 ${dir}: ${info.components.length} composants ${info.hasIndex ? '✅' : '❌'}`);
    console.log(`   Composants: ${info.components.join(', ')}`);
  });
  
  console.log('\n');
  
  await compareWithTemplates();
  
  console.log('✅ VÉRIFICATION TERMINÉE !\n');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeRealComponents,
  compareWithTemplates
};
