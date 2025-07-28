"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Lightbulb, 
  RefreshCw, 
  X,
  Zap,
  Bug,
  AlertCircle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
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

interface TerminalErrorPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onExecuteCommand?: (command: string) => void;
  className?: string;
}

const TerminalErrorPanel: React.FC<TerminalErrorPanelProps> = ({
  isVisible,
  onClose,
  onExecuteCommand,
  className
}) => {
  const [errors, setErrors] = useState<TerminalError[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, ErrorSuggestion[]>>({});
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les erreurs et suggestions
  const loadErrorsAndSuggestions = () => {
    const recentErrors = terminalErrorMonitor.getRecentErrors(20);
    setErrors(recentErrors);

    // Charger les suggestions pour chaque erreur
    const suggestionsMap: Record<string, ErrorSuggestion[]> = {};
    recentErrors.forEach(error => {
      suggestionsMap[error.id] = terminalErrorMonitor.getSuggestionsForError(error.id);
    });
    setSuggestions(suggestionsMap);
  };

  // Rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    loadErrorsAndSuggestions();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Copier du texte dans le presse-papiers
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  // Exécuter une commande corrigée
  const executeCommand = (command: string) => {
    if (onExecuteCommand) {
      onExecuteCommand(command);
    }
  };

  // Obtenir l'icône selon la sévérité
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Bug className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Obtenir la couleur du badge selon la sévérité
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Obtenir l'icône selon la catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'syntax':
        return <Bug className="h-3 w-3" />;
      case 'permission':
        return <AlertTriangle className="h-3 w-3" />;
      case 'dependency':
        return <ExternalLink className="h-3 w-3" />;
      case 'path':
        return <Info className="h-3 w-3" />;
      case 'configuration':
        return <Zap className="h-3 w-3" />;
      default:
        return <Lightbulb className="h-3 w-3" />;
    }
  };

  // Charger les données au montage et écouter les nouvelles erreurs
  useEffect(() => {
    if (isVisible) {
      loadErrorsAndSuggestions();

      // Écouter les nouvelles erreurs
      const handleNewError = () => {
        loadErrorsAndSuggestions();
      };

      terminalErrorMonitor.onErrorDetected(handleNewError);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg z-50",
      "transform transition-transform duration-300 ease-in-out",
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Erreurs Terminal</h2>
            {errors.length > 0 && (
              <Badge variant="secondary">{errors.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {errors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">Aucune erreur détectée</p>
              <p className="text-xs">Le terminal fonctionne correctement</p>
            </div>
          ) : (
            <div className="space-y-4">
              {errors.map((error) => {
                const errorSuggestions = suggestions[error.id] || [];
                const isSelected = selectedError === error.id;

                return (
                  <Card key={error.id} className={cn(
                    "cursor-pointer transition-colors",
                    isSelected && "ring-2 ring-primary"
                  )}>
                    <CardHeader 
                      className="pb-2"
                      onClick={() => setSelectedError(isSelected ? null : error.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(error.severity)}
                          <div>
                            <CardTitle className="text-sm font-medium">
                              {error.command}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {error.timestamp.toLocaleTimeString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getSeverityColor(error.severity) as any}>
                          {error.severity}
                        </Badge>
                      </div>
                    </CardHeader>

                    {isSelected && (
                      <CardContent className="pt-0">
                        {/* Sortie d'erreur */}
                        <div className="mb-3">
                          <h4 className="text-xs font-medium mb-1 text-muted-foreground">
                            Sortie d'erreur:
                          </h4>
                          <div className="bg-muted p-2 rounded text-xs font-mono max-h-20 overflow-y-auto">
                            {error.errorOutput}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-6 px-2 text-xs"
                            onClick={() => copyToClipboard(error.errorOutput)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copier
                          </Button>
                        </div>

                        {/* Suggestions */}
                        {errorSuggestions.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">
                              Suggestions de correction:
                            </h4>
                            {errorSuggestions.map((suggestion) => (
                              <Alert key={suggestion.id} className="p-3">
                                <div className="flex items-start gap-2">
                                  {getCategoryIcon(suggestion.category)}
                                  <div className="flex-1 min-w-0">
                                    <AlertTitle className="text-xs font-medium mb-1">
                                      {suggestion.explanation}
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {Math.round(suggestion.confidence * 100)}%
                                      </Badge>
                                    </AlertTitle>
                                    <AlertDescription className="text-xs whitespace-pre-wrap">
                                      {suggestion.suggestion}
                                    </AlertDescription>
                                    
                                    {/* Commande corrigée */}
                                    {suggestion.correctedCommand && (
                                      <div className="mt-2">
                                        <div className="bg-green-50 dark:bg-green-950 p-2 rounded border border-green-200 dark:border-green-800">
                                          <div className="flex items-center justify-between">
                                            <code className="text-xs font-mono text-green-700 dark:text-green-300">
                                              {suggestion.correctedCommand}
                                            </code>
                                            <div className="flex gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() => copyToClipboard(suggestion.correctedCommand!)}
                                              >
                                                <Copy className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() => executeCommand(suggestion.correctedCommand!)}
                                              >
                                                <Zap className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Alert>
                            ))}
                          </div>
                        )}

                        {/* Contexte */}
                        {error.context.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-medium mb-1 text-muted-foreground">
                              Contexte:
                            </h4>
                            <div className="text-xs text-muted-foreground">
                              {error.context.join(', ')}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer avec statistiques */}
        {errors.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Total: {errors.length} erreurs</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => terminalErrorMonitor.cleanOldErrors()}
                >
                  Nettoyer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalErrorPanel;