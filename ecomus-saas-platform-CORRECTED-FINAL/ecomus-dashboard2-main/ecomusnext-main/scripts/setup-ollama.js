#!/usr/bin/env node

/**
 * Script de configuration Ollama pour Ecomus SaaS
 * Ce script configure et installe les modèles IA nécessaires pour le chatbot
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration d\'Ollama pour Ecomus SaaS...\n');

// Configuration des modèles IA
const AI_MODELS = [
  {
    name: 'llama3.2',
    description: 'Modèle principal pour le chatbot e-commerce',
    size: '2B'
  },
  {
    name: 'codellama',
    description: 'Modèle pour assistance technique',
    size: '7B'
  }
];

// Vérification de l'installation d'Ollama
function checkOllamaInstallation() {
  return new Promise((resolve, reject) => {
    exec('ollama --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Ollama n\'est pas installé');
        console.log('📥 Installation d\'Ollama...');
        
        // Installation d'Ollama sur Linux/Mac
        exec('curl -fsSL https://ollama.com/install.sh | sh', (installError, installStdout, installStderr) => {
          if (installError) {
            reject('Erreur lors de l\'installation d\'Ollama: ' + installError.message);
          } else {
            console.log('✅ Ollama installé avec succès');
            resolve(true);
          }
        });
      } else {
        console.log('✅ Ollama est déjà installé:', stdout.trim());
        resolve(true);
      }
    });
  });
}

// Démarrage du service Ollama
function startOllamaService() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Démarrage du service Ollama...');
    
    exec('ollama serve', { detached: true }, (error, stdout, stderr) => {
      if (error && !error.message.includes('address already in use')) {
        reject('Erreur lors du démarrage d\'Ollama: ' + error.message);
      } else {
        console.log('✅ Service Ollama démarré');
        resolve(true);
      }
    });
    
    // Attendre que le service démarre
    setTimeout(() => resolve(true), 3000);
  });
}

// Installation des modèles IA
function installModels() {
  return new Promise(async (resolve, reject) => {
    console.log('📦 Installation des modèles IA...\n');
    
    for (const model of AI_MODELS) {
      try {
        console.log(`⬇️  Téléchargement du modèle ${model.name} (${model.size})...`);
        console.log(`   Description: ${model.description}`);
        
        await new Promise((modelResolve, modelReject) => {
          exec(`ollama pull ${model.name}`, (error, stdout, stderr) => {
            if (error) {
              console.log(`❌ Échec du téléchargement de ${model.name}: ${error.message}`);
              modelReject(error);
            } else {
              console.log(`✅ Modèle ${model.name} installé avec succès\n`);
              modelResolve();
            }
          });
        });
        
      } catch (error) {
        console.log(`⚠️  Avertissement: Impossible d'installer ${model.name}`);
      }
    }
    
    resolve(true);
  });
}

// Création du fichier de configuration
function createConfigFile() {
  const config = {
    ollama: {
      baseUrl: 'http://localhost:11434',
      models: AI_MODELS.map(m => m.name),
      timeout: 30000
    },
    huggingface: {
      apiKey: process.env.HUGGINGFACE_API_KEY || 'YOUR_HUGGING_FACE_API_KEY',
      baseUrl: 'https://api-inference.huggingface.co'
    },
    chat: {
      maxTokens: 2048,
      temperature: 0.7,
      contextWindow: 4096
    }
  };
  
  const configPath = path.join(__dirname, '..', 'config', 'ai-config.json');
  const configDir = path.dirname(configPath);
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('📝 Fichier de configuration créé:', configPath);
}

// Test de connexion
function testConnection() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Test de connexion aux services IA...');
    
    exec('curl -s http://localhost:11434/api/tags', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Impossible de se connecter à Ollama');
        reject(error);
      } else {
        try {
          const models = JSON.parse(stdout);
          console.log('✅ Connexion Ollama réussie');
          console.log('📋 Modèles disponibles:', models.models?.map(m => m.name).join(', ') || 'Aucun');
          resolve(true);
        } catch (parseError) {
          console.log('⚠️  Réponse Ollama reçue mais format inattendu');
          resolve(true);
        }
      }
    });
  });
}

// Fonction principale
async function main() {
  try {
    await checkOllamaInstallation();
    await startOllamaService();
    await installModels();
    createConfigFile();
    await testConnection();
    
    console.log('\n🎉 Configuration terminée avec succès!');
    console.log('\n📋 Étapes suivantes:');
    console.log('1. Configurez votre clé API Hugging Face dans .env');
    console.log('2. Démarrez votre application Next.js');
    console.log('3. Testez le chatbot IA dans l\'interface');
    console.log('\n💡 Le service Ollama fonctionne sur http://localhost:11434');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error);
    console.log('\n🔧 Solutions possibles:');
    console.log('- Vérifiez votre connexion internet');
    console.log('- Assurez-vous d\'avoir les droits d\'administration');
    console.log('- Redémarrez le script après avoir résolu les problèmes');
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  main();
}

module.exports = {
  checkOllamaInstallation,
  startOllamaService,
  installModels,
  createConfigFile,
  testConnection
};
