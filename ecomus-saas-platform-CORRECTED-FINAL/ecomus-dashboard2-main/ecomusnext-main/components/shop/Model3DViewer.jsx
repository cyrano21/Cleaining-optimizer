'use client';

import { useRef, useEffect, useState } from 'react';
import { Loader2, RotateCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import '@google/model-viewer';

export default function Model3DViewer({ 
  models3D = [], 
  productName = '', 
  className = '' 
}) {
  const modelViewerRef = useRef();
  const [currentModel, setCurrentModel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (models3D && models3D.length > 0) {
      setIsLoading(true);
      setError(null);
    }
  }, [models3D, currentModel]);

  const handleModelLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleModelError = (event) => {
    setIsLoading(false);
    setError('Erreur lors du chargement du modèle 3D');
    console.error('Model loading error:', event);
  };

  const resetCamera = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntableRotation();
    }
  };

  const toggleFullscreen = () => {
    if (modelViewerRef.current) {
      if (!isFullscreen) {
        modelViewerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (!models3D || models3D.length === 0) {
    return null;
  }

  const currentModelData = models3D[currentModel];

  return (
    <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      {/* Header avec titre et contrôles */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
          <h3 className="text-sm font-medium text-gray-900">
            {currentModelData?.name || `Modèle 3D de ${productName}`}
          </h3>
          {currentModelData?.description && (
            <p className="text-xs text-gray-600 mt-1">
              {currentModelData.description}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={resetCamera}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors"
            title="Réinitialiser la vue"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors"
            title="Plein écran"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewer 3D */}
      <div className="relative w-full h-96">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Chargement du modèle 3D...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        <model-viewer
          ref={modelViewerRef}
          src={currentModelData?.url}
          alt={`Modèle 3D de ${productName}`}
          camera-controls
          auto-rotate
          auto-rotate-delay="3000"
          rotation-per-second="30deg"
          environment-image="neutral"
          shadow-intensity="1"
          loading="eager"
          reveal="auto"
          style={{ 
            width: '100%', 
            height: '100%',
            backgroundColor: 'transparent'
          }}
          onLoad={handleModelLoad}
          onError={handleModelError}
          poster={currentModelData?.thumbnail}
        />
      </div>

      {/* Sélecteur de modèles si plusieurs disponibles */}
      {models3D.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2">
            {models3D.map((model, index) => (
              <button
                key={model.name || index}
                onClick={() => setCurrentModel(index)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  index === currentModel
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {model.name || `Modèle ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Informations techniques */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-600">
          <div>Format: {currentModelData?.format?.toUpperCase()}</div>
          {currentModelData?.size && (
            <div>Taille: {(currentModelData.size / 1024 / 1024).toFixed(1)} MB</div>
          )}
        </div>
      </div>

      {/* Instructions d'utilisation */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 pointer-events-none">
        <div className="bg-black/50 text-white text-xs rounded-lg p-2 opacity-0 hover:opacity-100 transition-opacity">
          <p>• Cliquez et glissez pour faire tourner</p>
          <p>• Molette pour zoomer</p>
          <p>• Double-clic pour centrer</p>
        </div>
      </div>
    </div>
  );
}
