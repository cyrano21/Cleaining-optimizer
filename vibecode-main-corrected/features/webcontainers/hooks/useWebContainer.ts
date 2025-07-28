import { useState, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { TemplateFolder } from '@/features/playground/libs/path-to-json';
import WebContainerService from '@/features/webcontainers/service/webContainerService';

interface UseWebContainerProps {
  templateData: TemplateFolder;
}

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void; // Added destroy function
}

export const useWebContainer = ({ templateData }: UseWebContainerProps): UseWebContainerReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeWebContainer() {
      try {
        if (instance) {
          console.log('⚠️ Instance WebContainer déjà existante, réutilisation.');
          setIsLoading(false);
          return;
        }

        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          throw new Error('WebContainer can only be initialized in the browser');
        }

        // Check if we're in a cross-origin isolated context
        if (!crossOriginIsolated) {
          throw new Error('WebContainer requires cross-origin isolation. Please ensure COOP and COEP headers are set.');
        }
        
        console.log('🔍 Utilisation du service WebContainer singleton...');
        const webcontainerInstance = await WebContainerService.getWebContainer();
        
        if (!mounted) return;
        
        console.log('✅ WebContainer récupéré du service singleton:', webcontainerInstance);
        setInstance(webcontainerInstance);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize WebContainer';
        console.error('❌ Erreur WebContainer:', errorMessage, err);
        if (mounted) {
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    }

    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      initializeWebContainer();
    } else {
      setIsLoading(false);
      setError('WebContainer can only be used in the browser');
    }

    return () => {
      mounted = false;
      // Use the service to properly release the instance
      WebContainerService.releaseInstance();
    };
  }, []);

  const writeFileSync = useCallback(async (path: string, content: string): Promise<void> => {
    if (!instance) {
      throw new Error('WebContainer instance is not available');
    }

    try {
      // Ensure the folder structure exists
      const pathParts = path.split('/');
      const folderPath = pathParts.slice(0, -1).join('/'); // Extract folder path

      if (folderPath) {
        await instance.fs.mkdir(folderPath, { recursive: true }); // Create folder structure recursively
      }

      // Write the file
      await instance.fs.writeFile(path, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to write file';
      console.error(`Failed to write file at ${path}:`, err);
      throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
    }
  }, [instance]);

  // Added destroy function
  const destroy = useCallback(() => {
    WebContainerService.releaseInstance();
    setInstance(null);
    setServerUrl(null);
  }, []);

  return { serverUrl, isLoading, error, instance, writeFileSync, destroy };
};