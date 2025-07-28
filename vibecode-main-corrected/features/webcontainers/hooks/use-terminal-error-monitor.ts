"use client";

import { useState, useEffect, useCallback } from "react";
import { terminalErrorMonitor } from "../services/terminal-error-monitor";

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

interface ErrorStats {
  total: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  recentErrors: TerminalError[];
}

export interface UseTerminalErrorMonitorReturn {
  // État
  errors: TerminalError[];
  errorCount: number;
  isMonitoring: boolean;
  stats: ErrorStats;
  
  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  analyzeCommand: (command: string, output: string, exitCode?: number, context?: string[]) => Promise<TerminalError | null>;
  getSuggestionsForError: (errorId: string) => ErrorSuggestion[];
  clearOldErrors: (maxAge?: number) => void;
  refreshErrors: () => void;
  
  // Utilitaires
  getErrorById: (id: string) => TerminalError | undefined;
  getErrorsBySeverity: (severity: string) => TerminalError[];
  getRecentErrors: (limit?: number) => TerminalError[];
}

/**
 * Hook personnalisé pour utiliser le système de surveillance des erreurs du terminal
 * 
 * @param autoStart - Démarrer automatiquement la surveillance (défaut: true)
 * @param maxErrors - Nombre maximum d'erreurs à conserver en mémoire (défaut: 50)
 * @returns Objet contenant l'état et les méthodes de gestion des erreurs
 */
export const useTerminalErrorMonitor = (
  autoStart: boolean = true,
  maxErrors: number = 50
): UseTerminalErrorMonitorReturn => {
  const [errors, setErrors] = useState<TerminalError[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    bySeverity: {},
    byCategory: {},
    recentErrors: []
  });

  // Rafraîchir les erreurs depuis le service
  const refreshErrors = useCallback(() => {
    const recentErrors = terminalErrorMonitor.getRecentErrors(maxErrors);
    const errorStats = terminalErrorMonitor.getErrorStats();
    
    setErrors(recentErrors);
    setErrorCount(recentErrors.length);
    setStats(errorStats);
  }, [maxErrors]);

  // Démarrer la surveillance
  const startMonitoring = useCallback(() => {
    terminalErrorMonitor.startMonitoring();
    setIsMonitoring(true);
    refreshErrors();
  }, [refreshErrors]);

  // Arrêter la surveillance
  const stopMonitoring = useCallback(() => {
    terminalErrorMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  // Analyser une commande pour détecter les erreurs
  const analyzeCommand = useCallback(async (
    command: string,
    output: string,
    exitCode?: number,
    context: string[] = []
  ): Promise<TerminalError | null> => {
    const error = await terminalErrorMonitor.analyzeTerminalOutput(
      command,
      output,
      exitCode,
      context
    );
    
    if (error) {
      refreshErrors();
    }
    
    return error;
  }, [refreshErrors]);

  // Obtenir les suggestions pour une erreur
  const getSuggestionsForError = useCallback((errorId: string): ErrorSuggestion[] => {
    return terminalErrorMonitor.getSuggestionsForError(errorId);
  }, []);

  // Nettoyer les anciennes erreurs
  const clearOldErrors = useCallback((maxAge?: number) => {
    terminalErrorMonitor.cleanOldErrors(maxAge);
    refreshErrors();
  }, [refreshErrors]);

  // Obtenir une erreur par ID
  const getErrorById = useCallback((id: string): TerminalError | undefined => {
    return errors.find(error => error.id === id);
  }, [errors]);

  // Obtenir les erreurs par sévérité
  const getErrorsBySeverity = useCallback((severity: string): TerminalError[] => {
    return errors.filter(error => error.severity === severity);
  }, [errors]);

  // Obtenir les erreurs récentes
  const getRecentErrors = useCallback((limit: number = 10): TerminalError[] => {
    return errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }, [errors]);

  // Gérer les nouvelles erreurs détectées
  useEffect(() => {
    const handleNewError = (error: TerminalError, suggestion?: ErrorSuggestion) => {
      refreshErrors();
      
      // Optionnel: Log pour le debug
      console.log('🚨 Nouvelle erreur détectée:', {
        command: error.command,
        severity: error.severity,
        hasSuggestion: !!suggestion
      });
    };

    // S'abonner aux nouvelles erreurs
    terminalErrorMonitor.onErrorDetected(handleNewError);

    // Démarrage automatique si demandé
    if (autoStart) {
      startMonitoring();
    }

    // Nettoyage au démontage
    return () => {
      if (autoStart) {
        stopMonitoring();
      }
    };
  }, [autoStart, startMonitoring, stopMonitoring, refreshErrors]);

  // Nettoyage périodique des anciennes erreurs
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Nettoyer les erreurs de plus de 24h
      clearOldErrors(24 * 60 * 60 * 1000);
    }, 60 * 60 * 1000); // Toutes les heures

    return () => clearInterval(cleanupInterval);
  }, [clearOldErrors]);

  return {
    // État
    errors,
    errorCount,
    isMonitoring,
    stats,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    analyzeCommand,
    getSuggestionsForError,
    clearOldErrors,
    refreshErrors,
    
    // Utilitaires
    getErrorById,
    getErrorsBySeverity,
    getRecentErrors
  };
};

/**
 * Hook simplifié pour surveiller uniquement les erreurs critiques
 */
export const useCriticalErrors = () => {
  const { errors, errorCount, getErrorsBySeverity } = useTerminalErrorMonitor();
  
  const criticalErrors = getErrorsBySeverity('critical');
  const highErrors = getErrorsBySeverity('high');
  const importantErrors = [...criticalErrors, ...highErrors];
  
  return {
    criticalErrors,
    highErrors,
    importantErrors,
    hasCriticalErrors: criticalErrors.length > 0,
    hasImportantErrors: importantErrors.length > 0,
    totalErrors: errorCount
  };
};

/**
 * Hook pour obtenir des statistiques en temps réel
 */
export const useErrorStats = () => {
  const { stats, refreshErrors } = useTerminalErrorMonitor();
  
  // Rafraîchir les stats toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(refreshErrors, 30000);
    return () => clearInterval(interval);
  }, [refreshErrors]);
  
  return stats;
};

export default useTerminalErrorMonitor;