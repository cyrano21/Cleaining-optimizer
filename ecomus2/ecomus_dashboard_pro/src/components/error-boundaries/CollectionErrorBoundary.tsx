/**
 * Error Boundary spécialisé pour les collections dynamiques
 * Améliore la gestion d'erreurs et l'expérience utilisateur
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class CollectionErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log l'erreur avec le système de logging centralisé
    logger.error('Collection Error Boundary caught an error', {
      component: 'CollectionErrorBoundary',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    this.setState({
      error,
      errorInfo
    });

    // Appeler le callback d'erreur personnalisé si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry pour certains types d'erreurs
    this.handleAutoRetry(error);
  }

  private handleAutoRetry = (error: Error) => {
    const isRetryableError = this.isRetryableError(error);
    const canRetry = this.state.retryCount < this.maxRetries;

    if (isRetryableError && canRetry) {
      logger.info('Attempting auto-retry for collection error', {
        component: 'CollectionErrorBoundary',
        retryCount: this.state.retryCount + 1,
        error: error.message
      });

      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, Math.pow(2, this.state.retryCount) * 1000); // Exponential backoff
    }
  };

  private isRetryableError = (error: Error): boolean => {
    const retryablePatterns = [
      /network/i,
      /fetch/i,
      /timeout/i,
      /connection/i,
      /temporarily unavailable/i
    ];

    return retryablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  };

  private handleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    logger.info('Retrying after collection error', {
      component: 'CollectionErrorBoundary',
      retryCount: this.state.retryCount
    });
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });

    logger.userAction('Manual retry from error boundary', {
      component: 'CollectionErrorBoundary'
    });
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback par défaut
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleManualRetry}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Composant de fallback par défaut
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
  showDetails?: boolean;
}

function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  retryCount,
  maxRetries,
  showDetails = false
}: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    logger.userAction('Navigate to home from error boundary');
    router.push('/');
  };

  const canRetry = retryCount < maxRetries;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
      <div className="mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Quelque chose s'est mal passé
        </h2>
        <p className="text-gray-600 max-w-md">
          Une erreur s'est produite lors du chargement des collections. 
          {canRetry ? 'Vous pouvez essayer de recharger.' : 'Veuillez rafraîchir la page.'}
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        {canRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer ({maxRetries - retryCount} tentatives restantes)
          </Button>
        )}
        <Button variant="outline" onClick={handleGoHome} className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Retour à l'accueil
        </Button>
      </div>

      {showDetails && error && (
        <details className="w-full max-w-2xl">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
            Détails techniques
          </summary>
          <div className="text-left bg-gray-100 p-4 rounded border text-xs font-mono overflow-auto max-h-40">
            <div className="mb-2">
              <strong>Erreur:</strong> {error.message}
            </div>
            {error.stack && (
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
            )}
            {errorInfo?.componentStack && (
              <div>
                <strong>Component Stack:</strong>
                <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        </details>
      )}

      <div className="mt-4 text-xs text-gray-400">
        ID d'erreur: {Date.now().toString(36)}
      </div>
    </div>
  );
}

// Hook pour utiliser l'Error Boundary de manière programmatique
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    logger.error('Programmatic error handled', {
      component: 'useErrorHandler',
      error: error.message,
      stack: error.stack,
      ...errorInfo
    });
    
    // Relancer l'erreur pour qu'elle soit capturée par l'Error Boundary
    throw error;
  };
}

// HOC pour wrapper facilement les composants
export function withCollectionErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <CollectionErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </CollectionErrorBoundary>
    );
  };
}

export default CollectionErrorBoundary;