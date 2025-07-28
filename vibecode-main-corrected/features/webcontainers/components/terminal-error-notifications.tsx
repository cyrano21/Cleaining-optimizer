"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  X, 
  Zap, 
  Copy,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCriticalErrors } from "../hooks/use-terminal-error-monitor";

interface TerminalError {
  id: string;
  timestamp: Date;
  command: string;
  errorOutput: string;
  exitCode?: number;
  context: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationProps {
  error: TerminalError;
  onDismiss: (id: string) => void;
  onFix?: (command: string) => void;
  className?: string;
}

const ErrorNotification: React.FC<NotificationProps> = ({
  error,
  onDismiss,
  onFix,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeAgo, setTimeAgo] = useState('');

  // Calculer le temps écoulé
  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - error.timestamp.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        setTimeAgo(`il y a ${hours}h`);
      } else if (minutes > 0) {
        setTimeAgo(`il y a ${minutes}min`);
      } else {
        setTimeAgo(`il y a ${seconds}s`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);

    return () => clearInterval(interval);
  }, [error.timestamp]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(error.id), 300);
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      default:
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (!isVisible) return null;

  return (
    <Card className={cn(
      "transition-all duration-300 ease-in-out",
      "transform translate-x-0 opacity-100",
      "border-l-4",
      getSeverityColor(),
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getSeverityIcon()}
            <div>
              <CardTitle className="text-sm font-medium">
                Erreur {error.severity === 'critical' ? 'critique' : 'importante'}
              </CardTitle>
              <CardDescription className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={error.severity === 'critical' ? 'destructive' : 'secondary'}>
              {error.severity}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Commande:
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {error.command}
            </code>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Erreur:
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {error.errorOutput.slice(0, 100)}...
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(error.errorOutput)}
              className="h-6 px-2 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copier
            </Button>
            
            {onFix && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onFix(error.command)}
                className="h-6 px-2 text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Corriger
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TerminalErrorNotificationsProps {
  maxNotifications?: number;
  autoHideDelay?: number;
  onFixError?: (command: string) => void;
  className?: string;
}

const TerminalErrorNotifications: React.FC<TerminalErrorNotificationsProps> = ({
  maxNotifications = 3,
  autoHideDelay = 10000,
  onFixError,
  className
}) => {
  const { criticalErrors, highErrors, importantErrors } = useCriticalErrors();
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback((errorId: string) => {
    setDismissedErrors(prev => new Set([...prev, errorId]));
  }, []);

  const handleFixError = useCallback((command: string) => {
    if (onFixError) {
      onFixError(command);
    }
  }, [onFixError]);

  const visibleErrors = useMemo(() => {
    return importantErrors
      .filter(error => !dismissedErrors.has(error.id))
      .sort((a, b) => {
        if (a.severity === 'critical' && b.severity !== 'critical') return -1;
        if (b.severity === 'critical' && a.severity !== 'critical') return 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, maxNotifications);
  }, [importantErrors, dismissedErrors, maxNotifications]);

  useEffect(() => {
    if (autoHideDelay > 0 && visibleErrors.length > 0) {
      const timers = visibleErrors.map(error => {
        return setTimeout(() => {
          handleDismiss(error.id);
        }, autoHideDelay);
      });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [visibleErrors, autoHideDelay, handleDismiss]);

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 space-y-2 max-w-sm",
      className
    )}>
      {importantErrors.length > maxNotifications && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-sm">
            Surveillance active
          </AlertTitle>
          <AlertDescription className="text-xs">
            {importantErrors.length} erreurs détectées au total
          </AlertDescription>
        </Alert>
      )}

      {visibleErrors.map((error) => (
        <ErrorNotification
          key={error.id}
          error={error}
          onDismiss={handleDismiss}
          onFix={handleFixError}
        />
      ))}

      {dismissedErrors.size > 0 && visibleErrors.length === 0 && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-sm">
            Erreurs résolues
          </AlertTitle>
          <AlertDescription className="text-xs">
            Toutes les erreurs importantes ont été traitées
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TerminalErrorNotifications;
export { ErrorNotification };