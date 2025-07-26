"use client";

/// <reference path="../../types/global.d.ts" />

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Smartphone, 
  Monitor, 
  Maximize2,
  RefreshCw,
  Settings,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';



interface ARViewerProps {
  modelUrl: string;
  productName: string;
  scale?: number;
  autoRotate?: boolean;
  allowScaling?: boolean;
  environmentLighting?: boolean;
  className?: string;
}

export const ARViewer: React.FC<ARViewerProps> = ({
  modelUrl,
  productName,
  scale = 1,
  autoRotate = true,
  allowScaling = true,
  environmentLighting = true,
  className
}) => {
  const modelViewerRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arMode, setArMode] = useState<'object' | 'surface'>('object');

  // Check AR support
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        // Check if device supports WebXR
        if ('xr' in navigator) {
          const isSupported = await (navigator as any).xr?.isSessionSupported?.('immersive-ar');
          setIsSupported(isSupported || false);
        } else {
          // Fallback: Check for mobile device with camera
          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
          setIsSupported(isMobile && hasCamera);
        }
      } catch (error) {
        console.warn('AR support check failed:', error);
        setIsSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkARSupport();
  }, []);

  const handleARClick = () => {
    if (modelViewerRef.current) {
      try {
        modelViewerRef.current.activateAR();
      } catch (error) {
        console.error('Failed to activate AR:', error);
        setError('Failed to start AR mode. Please try again.');
      }
    }
  };

  const handleModelLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleModelError = (event: any) => {
    console.error('Model loading error:', event);
    setError('Failed to load 3D model');
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking AR support...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className={cn("w-full border-amber-200 bg-amber-50", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone className="h-6 w-6 text-amber-600" />
            <h3 className="font-semibold text-amber-800">AR Not Available</h3>
          </div>
          <p className="text-amber-700 text-sm mb-4">
            Augmented Reality requires a compatible mobile device with camera access.
          </p>
          <div className="space-y-2 text-xs text-amber-600">
            <p>• Use a smartphone or tablet</p>
            <p>• Enable camera permissions</p>
            <p>• Use Chrome or Safari browser</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-600" />
          Augmented Reality
          <Badge variant="secondary" className="ml-2">AR Ready</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Visualize this product in your space using your device's camera
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 3D Model Viewer with AR */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {React.createElement('model-viewer', {
            ref: modelViewerRef,
            src: modelUrl,
            alt: productName,
            ar: true,
            'ar-modes': 'webxr scene-viewer quick-look',
            'ar-scale': arMode,
            'camera-controls': true,
            'auto-rotate': autoRotate,
            'environment-image': 'neutral',
            exposure: '1',
            'shadow-intensity': '1',
            scale: `${scale} ${scale} ${scale}`,
            className: 'w-full h-full bg-transparent',
            onLoad: handleModelLoad,
            onError: handleModelError,
            loading: 'eager'
          }, 
            React.createElement('button', {
              slot: 'ar-button',
              className: 'absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
              onClick: handleARClick
            }, [
              React.createElement(Camera, { className: 'h-4 w-4' }),
              ' View in AR'
            ]),
            isLoading && React.createElement('div', {
              className: 'absolute inset-0 flex items-center justify-center bg-white/80'
            }, React.createElement('div', {
              className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'
            }))
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-center text-red-600">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* AR Controls */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">AR Mode:</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={arMode === 'object' ? 'default' : 'outline'}
                onClick={() => setArMode('object')}
                className="text-xs"
              >
                Object
              </Button>
              <Button
                size="sm"
                variant={arMode === 'surface' ? 'default' : 'outline'}
                onClick={() => setArMode('surface')}
                className="text-xs"
              >
                Surface
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleARClick}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Start AR
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to use AR:</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>1. Tap "View in AR" button</p>
            <p>2. Allow camera access when prompted</p>
            <p>3. Point camera at a flat surface</p>
            <p>4. Tap to place the product</p>
            <p>5. Walk around to see it from all angles</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ARViewer;
