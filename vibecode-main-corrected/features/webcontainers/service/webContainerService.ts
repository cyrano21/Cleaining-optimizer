import { WebContainer } from '@webcontainer/api';

// Singleton class to manage WebContainer instance
class WebContainerService {
  private static instance: WebContainerService | null = null;
  private webcontainerInstance: WebContainer | null = null;
  private mountPromise: Promise<void> | null = null;
  private isBooting = false;
  private bootPromise: Promise<WebContainer> | null = null;
  private activeUsers = 0;
  private static globalWebContainerCreated = false; // Global flag to prevent multiple instances

  private constructor() {}

  public static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  public async getWebContainer(): Promise<WebContainer> {
    this.activeUsers++;
    
    // If instance already exists, return it
    if (this.webcontainerInstance) {
      console.log('🔄 Réutilisation de l\'instance WebContainer existante');
      return this.webcontainerInstance;
    }

    // If already booting, wait for the existing boot process
    if (this.bootPromise) {
      console.log('⏳ Attente du processus de démarrage en cours...');
      return this.bootPromise;
    }

    // Start booting process
    console.log('🚀 Démarrage d\'une nouvelle instance WebContainer...');
    this.isBooting = true;
    this.bootPromise = this.bootWebContainer();
    
    try {
      const instance = await this.bootPromise;
      this.webcontainerInstance = instance;
      console.log('✅ Instance WebContainer créée avec succès');
      return instance;
    } catch (error) {
      console.error('❌ Échec du démarrage WebContainer:', error);
      this.bootPromise = null;
      this.isBooting = false;
      this.activeUsers--; // Decrease counter on failure
      throw error;
    } finally {
      this.bootPromise = null;
      this.isBooting = false;
    }
  }

  private async bootWebContainer(): Promise<WebContainer> {
    try {
      // Check global flag to prevent multiple WebContainer instances
      if (WebContainerService.globalWebContainerCreated) {
        throw new Error('Only a single WebContainer instance can be booted globally');
      }
      
      WebContainerService.globalWebContainerCreated = true;
      const instance = await WebContainer.boot();
      console.log('🎯 Instance WebContainer globale créée');
      return instance;
    } catch (error) {
      WebContainerService.globalWebContainerCreated = false; // Reset flag on failure
      throw new Error(`Failed to boot WebContainer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async mountFiles(files: Record<string, any>): Promise<void> {
    const instance = await this.getWebContainer();
    
    // Auto-create next.config.ts if missing in Next.js projects
    const enhancedFiles = this.ensureNextConfigExists(files);
    
    if (!this.mountPromise) {
      this.mountPromise = instance.mount(enhancedFiles);
    }
    
    return this.mountPromise;
  }

  private ensureNextConfigExists(files: Record<string, any>): Record<string, any> {
    console.log('🔍 Vérification des fichiers pour next.config.ts:', Object.keys(files));
    
    // Check if this is a Next.js project
    const hasPackageJson = files['package.json'];
    const hasNextConfig = files['next.config.ts'] || files['next.config.js'];
    const hasTsConfig = files['tsconfig.json'];
    
    console.log('📦 Package.json trouvé:', !!hasPackageJson);
    console.log('⚙️ Next config existant:', !!hasNextConfig);
    console.log('📝 TSConfig existant:', !!hasTsConfig);
    
    if (hasPackageJson && !hasNextConfig) {
      try {
        let packageContent = '';
        
        // Handle different file structure formats
        if (typeof hasPackageJson === 'string') {
          packageContent = hasPackageJson;
        } else if (hasPackageJson.file?.contents) {
          packageContent = hasPackageJson.file.contents;
        } else if (hasPackageJson.contents) {
          packageContent = hasPackageJson.contents;
        }
        
        console.log('📄 Contenu package.json (extrait):', packageContent.substring(0, 200));
        
        // Check if package.json contains Next.js dependency
        if (packageContent.includes('"next"') || packageContent.includes("'next'")) {
          console.log('✅ Projet Next.js détecté - Création des fichiers de configuration');
          
          const nextConfigContent = `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: true
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  }
}

export default nextConfig
`;

          const tsConfigContent = `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;
          
          const enhancedFiles = {
            ...files,
            'next.config.ts': {
              file: {
                contents: nextConfigContent
              }
            }
          };

          // Add or fix tsconfig.json if it doesn't exist or is incomplete
          if (!hasTsConfig) {
            enhancedFiles['tsconfig.json'] = {
              file: {
                contents: tsConfigContent
              }
            };
            console.log('📝 Fichier tsconfig.json ajouté aux fichiers');
          } else {
            // Check if existing tsconfig.json has proper configuration
            let existingTsConfigContent = '';
            if (typeof hasTsConfig === 'string') {
              existingTsConfigContent = hasTsConfig;
            } else if (hasTsConfig.file?.contents) {
              existingTsConfigContent = hasTsConfig.file.contents;
            } else if (hasTsConfig.contents) {
              existingTsConfigContent = hasTsConfig.contents;
            }
            
            try {
              const existingConfig = JSON.parse(existingTsConfigContent);
              let needsUpdate = false;
              
              // Check if compilerOptions exists
              if (!existingConfig.compilerOptions) {
                console.log('⚠️ compilerOptions manquant dans tsconfig.json existant');
                needsUpdate = true;
              } else {
                // Check if baseUrl is missing
                if (!existingConfig.compilerOptions.baseUrl) {
                  console.log('⚠️ baseUrl manquant dans tsconfig.json existant');
                  existingConfig.compilerOptions.baseUrl = '.';
                  needsUpdate = true;
                }
                
                // Check if paths is missing
                if (!existingConfig.compilerOptions.paths) {
                  console.log('⚠️ paths manquant dans tsconfig.json existant');
                  existingConfig.compilerOptions.paths = {
                    '@/*': ['./*']
                  };
                  needsUpdate = true;
                }
              }
              
              if (needsUpdate) {
                // If compilerOptions was completely missing, use the default one
                if (!existingConfig.compilerOptions) {
                  const defaultConfig = JSON.parse(tsConfigContent);
                  existingConfig.compilerOptions = defaultConfig.compilerOptions;
                }
                
                enhancedFiles['tsconfig.json'] = {
                  file: {
                    contents: JSON.stringify(existingConfig, null, 2)
                  }
                };
                console.log('📝 Fichier tsconfig.json existant mis à jour');
              }
            } catch (error) {
              console.log('⚠️ Erreur lors de la lecture du tsconfig.json existant, remplacement par la version par défaut');
              enhancedFiles['tsconfig.json'] = {
                file: {
                  contents: tsConfigContent
                }
              };
            }
          }
          
          console.log('📝 Fichiers de configuration Next.js ajoutés');
          return enhancedFiles;
        } else {
          console.log('❌ Pas de dépendance Next.js trouvée dans package.json');
        }
      } catch (error) {
        console.error('⚠️ Erreur lors de la vérification du package.json:', error);
      }
    } else if (!hasPackageJson) {
      console.log('❌ Aucun package.json trouvé');
    } else if (hasNextConfig) {
      console.log('✅ Fichier next.config déjà présent');
    }
    
    return files;
  }

  public async spawn(command: string, args: string[] = []): Promise<any> {
    const instance = await this.getWebContainer();
    return instance.spawn(command, args);
  }

  public releaseInstance(): void {
    this.activeUsers--;
    
    // Only tear down if no components are using the instance
    if (this.activeUsers <= 0) {
      this.teardown();
    }
  }

  public teardown(): void {
    if (this.webcontainerInstance) {
      this.webcontainerInstance.teardown();
      this.webcontainerInstance = null;
      console.log('🧹 Instance WebContainer détruite');
    }
    this.mountPromise = null;
    this.bootPromise = null;
    this.activeUsers = 0;
    WebContainerService.globalWebContainerCreated = false; // Reset global flag
  }

  public onServerReady(callback: (port: number, url: string) => void): void {
    if (this.webcontainerInstance) {
      this.webcontainerInstance.on('server-ready', callback);
    }
  }


}

export default WebContainerService.getInstance();