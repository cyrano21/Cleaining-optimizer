#!/usr/bin/env node

/**
 * Script de test des services IA pour Ecomus SaaS
 * Teste les connexions et fonctionnalités IA
 */

const aiServiceManager = require('@/utils/aiServiceManager').default;

console.log('🧪 Test des services IA Ecomus...\n');

async function testServices() {
  try {
    // Initialisation des services
    console.log('1. Initialisation des services IA...');
    await aiServiceManager.initialize();
    
    // Vérification du statut
    console.log('\n2. Statut des services:');
    const status = aiServiceManager.getServicesStatus();
    console.log('   Ollama:', status.ollama.available ? '✅ Disponible' : '❌ Non disponible');
    console.log('   Hugging Face:', status.huggingface.available ? '✅ Disponible' : '❌ Non disponible');
    console.log('   Configuration HF:', status.huggingface.configured ? '✅ Configuré' : '⚠️  API Key manquante');
    
    // Test de chat simple
    if (status.ollama.available || status.huggingface.available) {
      console.log('\n3. Test de chat intelligent...');
      try {
        const response = await aiServiceManager.smartChat(
          'Bonjour! Peux-tu m\'aider à trouver des produits de mode?'
        );
        console.log('   ✅ Chat réussi');
        console.log('   Source:', response.source);
        console.log('   Réponse:', response.response.substring(0, 100) + '...');
      } catch (error) {
        console.log('   ❌ Échec du chat:', error.message);
      }
    }
    
    // Test de génération de description produit
    if (status.ollama.available || status.huggingface.available) {
      console.log('\n4. Test de génération de description produit...');
      try {
        const productData = {
          id: 'test-123',
          name: 'T-shirt Premium',
          category: 'Mode',
          price: '29.99€',
          features: {
            material: '100% coton bio',
            colors: ['Blanc', 'Noir', 'Bleu'],
            sizes: ['S', 'M', 'L', 'XL']
          }
        };
        
        const description = await aiServiceManager.generateProductDescription(productData);
        console.log('   ✅ Description générée');
        console.log('   Longueur:', description.description.length, 'caractères');
        console.log('   Aperçu:', description.description.substring(0, 150) + '...');
      } catch (error) {
        console.log('   ❌ Échec génération:', error.message);
      }
    }
    
    // Test d'analyse de sentiment
    if (status.ollama.available || status.huggingface.available) {
      console.log('\n5. Test d\'analyse de sentiment...');
      try {
        const sentimentTest = await aiServiceManager.analyzeSentiment(
          'Ce produit est absolument fantastique! Je le recommande vivement!'
        );
        console.log('   ✅ Sentiment analysé');
        console.log('   Score:', sentimentTest.score + '/5');
        console.log('   Analyse:', sentimentTest.analysis.substring(0, 100) + '...');
      } catch (error) {
        console.log('   ❌ Échec analyse:', error.message);
      }
    }
    
    // Test de génération d'image (uniquement avec Hugging Face)
    if (status.huggingface.available && status.huggingface.configured) {
      console.log('\n6. Test de génération d\'image...');
      try {
        const image = await aiServiceManager.generateImage(
          'A modern e-commerce product photo of a stylish t-shirt'
        );
        console.log('   ✅ Image générée');
        console.log('   URL:', image.imageUrl ? 'Image créée avec succès' : 'Pas d\'URL');
      } catch (error) {
        console.log('   ❌ Échec génération image:', error.message);
      }
    } else {
      console.log('\n6. Test de génération d\'image...');
      console.log('   ⏭️  Ignoré (Hugging Face non disponible ou non configuré)');
    }
    
    console.log('\n🎉 Tests terminés!');
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

async function displayConfiguration() {
  console.log('\n📋 Configuration actuelle:');
  
  const config = require('../config/ai-config.json');
  
  console.log('   Ollama URL:', config.ollama.baseUrl);
  console.log('   Modèles Ollama:', config.ollama.models.join(', '));
  console.log('   Timeout:', config.ollama.timeout + 'ms');
  console.log('   Max Tokens:', config.chat.maxTokens);
  console.log('   Temperature:', config.chat.temperature);
  
  console.log('\n🔧 Variables d\'environnement:');
  console.log('   HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✅ Configuré' : '❌ Manquant');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
}

async function displayHelp() {
  console.log('\n📖 Aide pour les services IA:');
  console.log('\n🔧 Configuration:');
  console.log('   1. Installer Ollama: curl -fsSL https://ollama.com/install.sh | sh');
  console.log('   2. Démarrer Ollama: ollama serve');
  console.log('   3. Installer des modèles: ollama pull llama3.2');
  console.log('   4. Configurer HF: export HUGGINGFACE_API_KEY=your_api_key');
  
  console.log('\n🧪 Commandes de test:');
  console.log('   npm run test:ai          - Test complet');
  console.log('   npm run setup:ollama     - Configuration Ollama');
  
  console.log('\n🔗 Ressources:');
  console.log('   Ollama: https://ollama.com');
  console.log('   Hugging Face: https://huggingface.co/docs/api-inference');
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    await displayHelp();
    return;
  }
  
  if (args.includes('--config') || args.includes('-c')) {
    await displayConfiguration();
    return;
  }
  
  // Test complet par défaut
  await displayConfiguration();
  await testServices();
  
  if (!aiServiceManager.getServicesStatus().ollama.available && 
      !aiServiceManager.getServicesStatus().huggingface.available) {
    console.log('\n💡 Conseil: Exécutez `npm run setup:ollama` pour configurer les services IA');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testServices,
  displayConfiguration,
  displayHelp
};
