#!/usr/bin/env node

/**
 * 🛡️ ACTIVATION PERMANENTE DU GARDIEN ANTI-STUPIDITÉ
 * Ce fichier lance automatiquement la surveillance à chaque démarrage
 */

const { guardian, startSurveillance } = require('./auto-guardian.js');

// Configuration permanente
const config = {
  autoStart: true,
  strictMode: true,
  maxViolations: 3,
  logLevel: 'verbose',
  enforceRulesReading: true
};

console.log('🚀 LANCEMENT DU GARDIEN PERMANENT');
console.log('📋 Configuration:');
Object.entries(config).forEach(([key, value]) => {
  console.log(`   • ${key}: ${value}`);
});

// Démarrage du gardien
try {
  const activeGuardian = startSurveillance();
  
  console.log('✅ GARDIEN ACTIVÉ EN MODE PERMANENT');
  console.log('🔒 SURVEILLANCE ACTIVE pour toutes les réponses');
  console.log('📊 Violations max autorisées: 3');
  console.log('📝 Logs sauvegardés dans: guardian-log.txt');
  
  // Créer un fichier de statut
  const fs = require('fs');
  const statusFile = {
    guardianStatus: 'ACTIVE',
    startTime: new Date().toISOString(),
    config: config,
    sessionId: activeGuardian.sessionId
  };
  
  fs.writeFileSync('./guardian-status.json', JSON.stringify(statusFile, null, 2));
  console.log('📄 Statut sauvegardé dans: guardian-status.json');
  
} catch (error) {
  console.error('❌ ERREUR lors de l\'activation:', error.message);
  process.exit(1);
}

// Message de confirmation
console.log('\n🎉 SYSTÈME DE SURVEILLANCE PERMANENT ACTIF !');
console.log('💡 Désormais, CHAQUE réponse sera automatiquement vérifiée');
console.log('🚨 Blocage automatique après 3 violations');
console.log('📖 Lecture obligatoire des règles à chaque session');

module.exports = { config, guardian };
