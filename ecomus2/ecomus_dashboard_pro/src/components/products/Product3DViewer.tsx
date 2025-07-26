'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Play, Pause } from 'lucide-react';
import * as THREE from 'three';

interface Product3DViewerProps {
  modelUrl: string;
  textureUrls?: string[];
  type?: 'gltf' | 'glb' | 'obj';
  previewImage?: string;
  animations?: string[];
  className?: string;
}

// Composant pour charger et afficher le modèle 3D
function Model({ url, selectedAnimation }: { url: string; selectedAnimation?: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (animations && animations.length > 0) {
      const newMixer = new THREE.AnimationMixer(scene);
      setMixer(newMixer);
      
      // Jouer la première animation par défaut
      const action = newMixer.clipAction(animations[0]);
      action.play();
      
      return () => {
        newMixer.stopAllAction();
      };
    }
  }, [scene, animations]);

  // Animation du modèle
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    // Rotation automatique légère
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={[1, 1, 1]} />
    </group>
  );
}

// Composant fallback pendant le chargement
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Chargement du modèle 3D...</p>
      </div>
    </div>
  );
}

export default function Product3DViewer({ 
  modelUrl, 
  textureUrls = [], 
  type = 'gltf',
  previewImage, 
  animations = [], 
  className = '' 
}: Product3DViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnimation, setSelectedAnimation] = useState<string | undefined>(animations[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 5]);

  const handleModelLoad = () => {
    setIsLoading(false);
  };

  const handleModelError = (error: any) => {
    console.error('Erreur lors du chargement du modèle 3D:', error);
    setError('Impossible de charger le modèle 3D');
    setIsLoading(false);
  };

  const resetCamera = () => {
    setCameraPosition([0, 0, 5]);
  };

  const zoomIn = () => {
    setCameraPosition(prev => [prev[0], prev[1], Math.max(prev[2] - 1, 1)]);
  };

  const zoomOut = () => {
    setCameraPosition(prev => [prev[0], prev[1], Math.min(prev[2] + 1, 10)]);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            {previewImage && (
              <img 
                src={previewImage} 
                alt="Aperçu du produit" 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <p className="text-red-500 mb-2">Erreur de chargement 3D</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-white bg-opacity-90">
              <LoadingFallback />
            </div>
          )}
          
          <Canvas
            camera={{ position: cameraPosition, fov: 45 }}
            style={{ height: '100%' }}
            onCreated={({ gl }) => {
              gl.setClearColor('#f8f9fa');
            }}
          >
            <ambientLight intensity={0.4} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            
            <Suspense fallback={null}>
              <Model 
                url={modelUrl} 
                selectedAnimation={selectedAnimation}
              />
              <Environment preset="studio" />
              <ContactShadows 
                rotation-x={Math.PI / 2} 
                position={[0, -1.4, 0]} 
                opacity={0.4} 
                width={10} 
                height={10} 
                blur={2.5} 
                far={4.5} 
              />
            </Suspense>
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
              onStart={() => setIsLoading(false)}
            />
          </Canvas>

          {/* Contrôles de l'interface */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={resetCamera}
              className="bg-white/80 backdrop-blur-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={zoomIn}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={zoomOut}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Chargement...
              </Badge>
            </div>
          )}
        </div>

        {/* Contrôles d'animation */}
        {animations.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Animations disponibles:</h4>
            <div className="flex flex-wrap gap-2">
              {animations.map((animation) => (
                <Button
                  key={animation}
                  size="sm"
                  variant={selectedAnimation === animation ? "default" : "outline"}
                  onClick={() => setSelectedAnimation(animation)}
                  className="text-xs"
                >
                  {animation}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Lecture'}
              </Button>
            </div>
          </div>
        )}

        {/* Instructions d'utilisation */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>🖱️ Clic gauche + glisser: Rotation • Molette: Zoom • Clic droit + glisser: Déplacement</p>
        </div>
      </CardContent>
    </Card>
  );
}
