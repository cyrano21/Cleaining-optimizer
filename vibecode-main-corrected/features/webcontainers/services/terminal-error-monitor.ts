"use client";

import { OllamaAI } from "@/lib/ollama-ai";

// Types pour la surveillance des erreurs
interface TerminalError {
  id: string;
  timestamp: Date;
  command: string;
  errorOutput: string;
  exitCode?: number;
  context: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorSuggestion {
  id: string;
  errorId: string;
  suggestion: string;
  correctedCommand?: string;
  explanation: string;
  confidence: number;
  category: 'syntax' | 'permission' | 'dependency' | 'path' | 'configuration' | 'other';
}

interface ErrorPattern {
  pattern: RegExp;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  commonSolutions: string[];
}

// Patterns d'erreurs communes
const ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /command not found|is not recognized/i,
    category: 'command_not_found',
    severity: 'medium',
    commonSolutions: [
      'Vérifiez l\'orthographe de la commande',
      'Installez le package requis avec npm/yarn',
      'Ajoutez le chemin au PATH'
    ]
  },
  {
    pattern: /permission denied|access denied/i,
    category: 'permission',
    severity: 'high',
    commonSolutions: [
      'Utilisez sudo (sur Linux/Mac)',
      'Vérifiez les permissions du fichier',
      'Exécutez en tant qu\'administrateur'
    ]
  },
  {
    pattern: /no such file or directory|cannot find/i,
    category: 'file_not_found',
    severity: 'medium',
    commonSolutions: [
      'Vérifiez le chemin du fichier',
      'Créez le fichier/dossier manquant',
      'Utilisez un chemin relatif ou absolu correct'
    ]
  },
  {
    pattern: /module not found|cannot resolve module/i,
    category: 'module_missing',
    severity: 'high',
    commonSolutions: [
      'Installez le module avec npm install',
      'Vérifiez le nom du module',
      'Ajoutez le module aux dépendances'
    ]
  },
  {
    pattern: /syntax error|unexpected token/i,
    category: 'syntax_error',
    severity: 'high',
    commonSolutions: [
      'Vérifiez la syntaxe du code',
      'Corrigez les parenthèses/crochets manquants',
      'Vérifiez les virgules et points-virgules'
    ]
  },
  {
    pattern: /port.*already in use|address already in use/i,
    category: 'port_conflict',
    severity: 'medium',
    commonSolutions: [
      'Utilisez un port différent',
      'Arrêtez le processus utilisant le port',
      'Utilisez lsof -i :PORT pour identifier le processus'
    ]
  },
  {
    pattern: /npm err|yarn error/i,
    category: 'package_manager',
    severity: 'medium',
    commonSolutions: [
      'Supprimez node_modules et package-lock.json',
      'Exécutez npm cache clean --force',
      'Vérifiez votre connexion internet'
    ]
  }
];

export class TerminalErrorMonitor {
  private errors: TerminalError[] = [];
  private suggestions: ErrorSuggestion[] = [];
  private aiService: OllamaAI;
  private isMonitoring: boolean = false;
  private errorCallbacks: ((error: TerminalError, suggestion?: ErrorSuggestion) => void)[] = [];

  constructor() {
    this.aiService = new OllamaAI();
  }

  // Démarrer la surveillance
  startMonitoring() {
    this.isMonitoring = true;
    console.log('🔍 Terminal Error Monitor started');
  }

  // Arrêter la surveillance
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ Terminal Error Monitor stopped');
  }

  // Ajouter un callback pour les erreurs détectées
  onErrorDetected(callback: (error: TerminalError, suggestion?: ErrorSuggestion) => void) {
    this.errorCallbacks.push(callback);
  }

  // Analyser la sortie du terminal pour détecter les erreurs
  async analyzeTerminalOutput(
    command: string,
    output: string,
    exitCode?: number,
    context: string[] = []
  ): Promise<TerminalError | null> {
    if (!this.isMonitoring) return null;

    // Détecter si c'est une erreur
    const isError = this.detectError(output, exitCode);
    if (!isError) return null;

    // Créer l'objet erreur
    const error: TerminalError = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      command,
      errorOutput: output,
      exitCode,
      context,
      severity: this.determineSeverity(output, exitCode)
    };

    // Stocker l'erreur
    this.errors.push(error);

    // Générer une suggestion automatiquement
    const suggestion = await this.generateSuggestion(error);
    if (suggestion) {
      this.suggestions.push(suggestion);
    }

    // Notifier les callbacks
    this.errorCallbacks.forEach(callback => callback(error, suggestion || undefined));

    return error;
  }

  // Détecter si la sortie contient une erreur
  private detectError(output: string, exitCode?: number): boolean {
    // Exit code non-zéro indique généralement une erreur
    if (exitCode && exitCode !== 0) return true;

    // Mots-clés d'erreur
    const errorKeywords = [
      'error', 'err', 'failed', 'failure', 'exception',
      'not found', 'cannot', 'unable', 'denied', 'forbidden',
      'invalid', 'unexpected', 'syntax error', 'fatal'
    ];

    const lowerOutput = output.toLowerCase();
    return errorKeywords.some(keyword => lowerOutput.includes(keyword));
  }

  // Déterminer la sévérité de l'erreur
  private determineSeverity(output: string, exitCode?: number): 'low' | 'medium' | 'high' | 'critical' {
    // Erreurs critiques
    if (output.toLowerCase().includes('fatal') || output.toLowerCase().includes('critical')) {
      return 'critical';
    }

    // Erreurs de compilation ou de syntaxe
    if (output.toLowerCase().includes('syntax error') || output.toLowerCase().includes('compilation failed')) {
      return 'high';
    }

    // Exit codes spécifiques
    if (exitCode) {
      if (exitCode >= 125) return 'critical';
      if (exitCode >= 2) return 'high';
      if (exitCode === 1) return 'medium';
    }

    return 'low';
  }

  // Générer une suggestion pour corriger l'erreur
  private async generateSuggestion(error: TerminalError): Promise<ErrorSuggestion | null> {
    try {
      // D'abord, essayer les patterns prédéfinis
      const patternSuggestion = this.getPatternBasedSuggestion(error);
      if (patternSuggestion) {
        return patternSuggestion;
      }

      // Ensuite, utiliser l'IA pour une analyse plus approfondie
      const aiSuggestion = await this.getAISuggestion(error);
      return aiSuggestion;
    } catch (aiError) {
      console.error('Erreur lors de la génération de suggestion IA:', aiError);
      // Fallback sur les patterns prédéfinis
      return this.getPatternBasedSuggestion(error);
    }
  }

  // Suggestion basée sur les patterns prédéfinis
  private getPatternBasedSuggestion(error: TerminalError): ErrorSuggestion | null {
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.pattern.test(error.errorOutput)) {
        return {
          id: this.generateSuggestionId(),
          errorId: error.id,
          suggestion: pattern.commonSolutions.join('\n• '),
          explanation: `Erreur de type: ${pattern.category}`,
          confidence: 0.7,
          category: pattern.category as any
        };
      }
    }
    return null;
  }

  // Suggestion générée par l'IA
  private async getAISuggestion(error: TerminalError): Promise<ErrorSuggestion | null> {
    const prompt = `Analysez cette erreur de terminal et proposez une solution:

Commande exécutée: ${error.command}
Sortie d'erreur: ${error.errorOutput}
Code de sortie: ${error.exitCode || 'N/A'}
Contexte: ${error.context.join(', ')}

Veuillez fournir:
1. Une explication claire de l'erreur
2. Une solution étape par étape
3. La commande corrigée si applicable
4. Des conseils pour éviter cette erreur à l'avenir

Répondez en français et soyez concis mais précis.`;

    try {
      const response = await this.aiService.generateResponse([
        { role: 'user', content: prompt }
      ], {
        temperature: 0.2,
        maxTokens: 800
      });

      // Parser la réponse de l'IA
      const suggestion = this.parseAIResponse(response, error);
      return suggestion;
    } catch (error) {
      console.error('Erreur IA:', error);
      return null;
    }
  }

  // Parser la réponse de l'IA
  private parseAIResponse(response: string, error: TerminalError): ErrorSuggestion {
    // Extraire la commande corrigée si présente
    const correctedCommandMatch = response.match(/commande corrigée?:?\s*`([^`]+)`/i);
    const correctedCommand = correctedCommandMatch ? correctedCommandMatch[1] : undefined;

    return {
      id: this.generateSuggestionId(),
      errorId: error.id,
      suggestion: response,
      correctedCommand,
      explanation: 'Suggestion générée par IA',
      confidence: 0.8,
      category: 'other'
    };
  }

  // Obtenir toutes les erreurs
  getErrors(): TerminalError[] {
    return [...this.errors];
  }

  // Obtenir les suggestions pour une erreur
  getSuggestionsForError(errorId: string): ErrorSuggestion[] {
    return this.suggestions.filter(s => s.errorId === errorId);
  }

  // Obtenir les erreurs récentes
  getRecentErrors(limit: number = 10): TerminalError[] {
    return this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Nettoyer les anciennes erreurs
  cleanOldErrors(maxAge: number = 24 * 60 * 60 * 1000) { // 24h par défaut
    const cutoff = new Date(Date.now() - maxAge);
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
    
    // Nettoyer aussi les suggestions orphelines
    const errorIds = new Set(this.errors.map(e => e.id));
    this.suggestions = this.suggestions.filter(s => errorIds.has(s.errorId));
  }

  // Générer un ID unique pour l'erreur
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Générer un ID unique pour la suggestion
  private generateSuggestionId(): string {
    return `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obtenir les statistiques des erreurs
  getErrorStats() {
    const total = this.errors.length;
    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = this.suggestions.reduce((acc, suggestion) => {
      acc[suggestion.category] = (acc[suggestion.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      bySeverity,
      byCategory,
      recentErrors: this.getRecentErrors(5)
    };
  }
}

// Instance singleton
export const terminalErrorMonitor = new TerminalErrorMonitor();