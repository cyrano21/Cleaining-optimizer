"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Settings,
  MousePointer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product360ViewerProps {
  images: string[];
  autoRotate?: boolean;
  rotationSpeed?: number;
  zoomEnabled?: boolean;
  className?: string;
  onImageChange?: (index: number) => void;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images = [],
  autoRotate = false,
  rotationSpeed = 50,
  zoomEnabled = true,
  className,
  onImageChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastImageIndex, setLastImageIndex] = useState(0);

  // Auto-rotation effect
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const next = (prev + 1) % images.length;
        onImageChange?.(next);
        return next;
      });
    }, rotationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, rotationSpeed, images.length, onImageChange]);

  // Handle manual rotation with mouse/touch
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!zoomEnabled && zoom === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setLastImageIndex(currentImageIndex);
      setIsPlaying(false);
    } else if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoomEnabled, zoom, currentImageIndex, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    if (zoom === 1) {
      // 360° rotation
      const deltaX = e.clientX - dragStart.x;
      const sensitivity = images.length / 360; // Images per degree
      const imageChange = Math.round(deltaX * sensitivity);
      const newIndex = (lastImageIndex + imageChange + images.length) % images.length;
      
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
        onImageChange?.(newIndex);
      }
    } else {
      // Pan when zoomed
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, zoom, dragStart, lastImageIndex, images.length, currentImageIndex, onImageChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!zoomEnabled && zoom === 1) {
      setIsDragging(true);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setLastImageIndex(currentImageIndex);
      setIsPlaying(false);
    } else if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  }, [zoomEnabled, zoom, currentImageIndex, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    if (zoom === 1) {
      // 360° rotation
      const deltaX = touch.clientX - dragStart.x;
      const sensitivity = images.length / 360;
      const imageChange = Math.round(deltaX * sensitivity);
      const newIndex = (lastImageIndex + imageChange + images.length) % images.length;
      
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
        onImageChange?.(newIndex);
      }
    } else {
      // Pan when zoomed
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [isDragging, zoom, dragStart, lastImageIndex, images.length, currentImageIndex, onImageChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 4));
    setIsPlaying(false);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.5, 1);
    setZoom(newZoom);
    if (newZoom === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setCurrentImageIndex(0);
    setIsPlaying(false);
    onImageChange?.(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentImageIndex(prev => {
            const next = (prev - 1 + images.length) % images.length;
            onImageChange?.(next);
            return next;
          });
          setIsPlaying(false);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentImageIndex(prev => {
            const next = (prev + 1) % images.length;
            onImageChange?.(next);
            return next;
          });
          setIsPlaying(false);
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'r':
          e.preventDefault();
          handleReset();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onImageChange]);

  if (images.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <div className="text-gray-500">
          <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No 360° images available</p>
          <p className="text-sm mt-2">Upload a sequence of images to create a 360° view</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main viewer */}
      <div 
        className="relative aspect-square bg-gray-100 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentImageIndex]}
          alt={`360° view ${currentImageIndex + 1}/${images.length}`}
          className="w-full h-full object-contain transition-transform duration-100"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          draggable={false}
        />

        {/* Loading indicator */}
        {isPlaying && (
          <div className="absolute top-4 left-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white opacity-75"></div>
          </div>
        )}

        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* Instructions overlay */}
        {showControls && !isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm opacity-75">
              {zoom === 1 ? "Drag to rotate • Click controls to zoom" : "Drag to pan • Zoom out to rotate"}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/75 rounded-lg px-3 py-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
            title={isPlaying ? "Pause rotation" : "Start rotation"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="w-px h-6 bg-white/30" />

          {zoomEnabled && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <span className="text-white text-sm min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <div className="w-px h-6 bg-white/30" />
            </>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFullscreen}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div 
          className="h-full bg-blue-500 transition-all duration-100"
          style={{ width: `${((currentImageIndex + 1) / images.length) * 100}%` }}
        />
      </div>
    </Card>
  );
};

export default Product360Viewer;
