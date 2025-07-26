#!/usr/bin/env node

/**
 * 🚨 SYSTÈME DE BLOCAGE TOTAL 🚨
 * EMPÊCHE TOUTE ACTION TANT QUE LES RÈGLES NE SONT PAS LUES
 * L'IA NE PEUT RIEN FAIRE SANS PASSER PAR ICI
 */

const fs = require('fs');
const path = require('path');

class RulesBlocker {
  constructor() {
    this.rulesFile = path.join(__dirname, 'ANTI_STUPIDITE_UNIVERSELLE.md');
    this.hasReadRules = false;
    this.sessionStartTime = Date.now();
  }

  // 🚨 BLOCAGE TOTAL : Aucune action possible sans cette lecture
  MANDATORY_RULES_READ_OR_BLOCK() {
    if (this.hasReadRules) {
      console.log('✅ Règles déjà lues dans cette session');
      return true;
    }

    console.log('🚨 BLOCAGE ACTIF - LECTURE OBLIGATOIRE EN COURS...');
    
    if (!fs.existsSync(this.rulesFile)) {
      throw new Error('❌ IMPOSSIBLE DE CONTINUER : ANTI_STUPIDITE_UNIVERSELLE.md INTROUVABLE !');
    }

    // FORCER la lecture complète
    const rulesContent = fs.readFileSync(this.rulesFile, 'utf8');
    
    console.log('📖 LECTURE FORCÉE COMPLÈTE :');
    console.log('═'.repeat(80));
    console.log(rulesContent);
    console.log('═'.repeat(80));
    
    // Marquer comme lu pour cette session
    this.hasReadRules = true;
    console.log('✅ RÈGLES LUES ET INTÉGRÉES - DÉBLOCAGE AUTORISÉ');
    
    // Questions de sécurité obligatoires
    console.log('\n🔒 QUESTIONS DE SÉCURITÉ AVANT DÉBLOCAGE :');
    console.log('   ❓ Ai-je vérifié l\'existant avant de créer/modifier ?');
    console.log('   ❓ Ai-je analysé TOUS les impacts possibles ?');
    console.log('   ❓ Ai-je écouté EXACTEMENT la demande utilisateur ?');
    console.log('   ❓ Est-ce que je pense en SYSTÈME global ?');
    console.log('   ❓ Vais-je respecter LEUR architecture, pas la mienne ?');
    
    return true;
  }

  // Wrapper qui BLOQUE toute fonction critique
  BLOCK_UNTIL_RULES_READ(functionName, originalFunction) {
    return (...args) => {
      console.log(`\n� TENTATIVE D'EXÉCUTION : ${functionName}`);
      
      // BLOQUER si les règles ne sont pas lues
      if (!this.MANDATORY_RULES_READ_OR_BLOCK()) {
        throw new Error(`❌ BLOQUÉ : Impossible d'exécuter ${functionName} sans lire les règles !`);
      }
      
      console.log(`✅ AUTORISÉ : Exécution de ${functionName}`);
      return originalFunction(...args);
    };
  }
}

// Instance globale de blocage
const rulesBlocker = new RulesBlocker();

// WRAPPING OBLIGATOIRE de toutes les fonctions critiques
const ORIGINAL_CONSOLE_LOG = console.log;
console.log = rulesBlocker.BLOCK_UNTIL_RULES_READ('console.log', ORIGINAL_CONSOLE_LOG);

// Export du bloqueur
module.exports = {
  FORCE_READ_OR_BLOCK: () => rulesBlocker.MANDATORY_RULES_READ_OR_BLOCK(),
  WRAP_FUNCTION: (name, fn) => rulesBlocker.BLOCK_UNTIL_RULES_READ(name, fn),
  RulesBlocker
};

// Test si exécuté directement
if (require.main === module) {
  console.log('🧪 TEST DU SYSTÈME D\'ENFORCEMENT :');
  rulesEnforcer.enforceRulesReading();
  console.log('✅ Test réussi !');
}
