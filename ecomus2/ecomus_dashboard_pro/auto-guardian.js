#!/usr/bin/env node

/**
 * 🛡️ GARDIEN AUTOMATIQUE ANTI-STUPIDITÉ
 * Système d'auto-surveillance qui force la lecture des règles
 * SANS nécessiter la surveillance humaine
 */

const fs = require('fs');
const path = require('path');

class AutoGuardian {
  constructor() {
    this.rulesFile = path.join(__dirname, 'ANTI_STUPIDITE_UNIVERSELLE.md');
    this.logFile = path.join(__dirname, 'guardian-log.txt');
    this.sessionId = Date.now();
    this.rulesReadInSession = false;
    this.actionCount = 0;
    this.violations = [];
  }

  // 🚨 CONTRÔLE AUTOMATIQUE : Vérifie CHAQUE réponse
  checkResponseCompliance(responseText) {
    const violations = [];
    
    // Vérification 1 : Commence-t-elle par la lecture des règles ?
    if (!responseText.includes('📖 LECTURE OBLIGATOIRE - ANTI_STUPIDITE_UNIVERSELLE.md')) {
      violations.push('❌ VIOLATION : Réponse sans lecture obligatoire des règles');
    }
    
    // Vérification 2 : Y a-t-il des mots interdits ?
    const forbiddenPatterns = [
      /je m'engage/i,
      /je promets/i,
      /je vais faire/i,
      /dans le futur/i,
      /désormais/i
    ];
    
    forbiddenPatterns.forEach(pattern => {
      if (pattern.test(responseText)) {
        violations.push(`❌ VIOLATION : Engagement vide détecté - ${pattern.source}`);
      }
    });
    
    // Vérification 3 : Y a-t-il des actions sans analyse préalable ?
    const dangerousActions = [
      /créer.*dossier/i,
      /supprimer/i,
      /modifier.*sans/i,
      /remplacer.*tout/i
    ];
    
    dangerousActions.forEach(pattern => {
      if (pattern.test(responseText)) {
        violations.push(`❌ VIOLATION : Action dangereuse potentielle - ${pattern.source}`);
      }
    });
    
    return violations;
  }

  // 📊 LOG AUTOMATIQUE des violations
  logViolation(violation) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] SESSION:${this.sessionId} - ${violation}\n`;
    
    fs.appendFileSync(this.logFile, logEntry);
    this.violations.push({ timestamp, violation });
    
    console.error(`🚨 ${violation}`);
  }

  // 🛑 BLOCAGE AUTOMATIQUE si trop de violations
  checkViolationThreshold() {
    if (this.violations.length >= 3) {
      console.error('🚨 ARRÊT FORCÉ - TROP DE VIOLATIONS !');
      console.error('📋 VIOLATIONS DÉTECTÉES :');
      this.violations.forEach((v, i) => {
        console.error(`   ${i+1}. ${v.violation}`);
      });
      
      throw new Error('SYSTÈME BLOQUÉ - Relire ANTI_STUPIDITE_UNIVERSELLE.md');
    }
  }

  // 🔄 RESET pour nouvelle session
  resetSession() {
    this.sessionId = Date.now();
    this.rulesReadInSession = false;
    this.actionCount = 0;
    this.violations = [];
    
    console.log(`🔄 NOUVELLE SESSION GUARDIAN : ${this.sessionId}`);
  }

  // 📈 RAPPORT DE SESSION
  getSessionReport() {
    return {
      sessionId: this.sessionId,
      actionsCount: this.actionCount,
      violations: this.violations.length,
      rulesRead: this.rulesReadInSession,
      status: this.violations.length < 3 ? 'OK' : 'BLOQUÉ'
    };
  }

  // 🤖 AUTO-SURVEILLANCE : Lance le monitoring
  startAutoSurveillance() {
    console.log('🤖 GARDIEN AUTO-SURVEILLANCE ACTIVÉ');
    console.log('📋 Contrôles automatiques :');
    console.log('   • Lecture obligatoire des règles à chaque réponse');
    console.log('   • Détection des engagements vides');
    console.log('   • Blocage automatique après 3 violations');
    console.log('   • Log de toutes les infractions');
    
    // Intercepter les console.log pour surveiller
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      const violations = this.checkResponseCompliance(message);
      
      violations.forEach(v => this.logViolation(v));
      this.checkViolationThreshold();
      
      return originalConsoleLog(...args);
    };
    
    return this;
  }
}

// Instance globale
const guardian = new AutoGuardian();

// Export
module.exports = {
  guardian,
  startSurveillance: () => guardian.startAutoSurveillance(),
  checkCompliance: (text) => guardian.checkResponseCompliance(text),
  getReport: () => guardian.getSessionReport()
};

// Auto-start si exécuté directement
if (require.main === module) {
  guardian.startAutoSurveillance();
  console.log('✅ Gardien automatique en cours d\'exécution');
}
