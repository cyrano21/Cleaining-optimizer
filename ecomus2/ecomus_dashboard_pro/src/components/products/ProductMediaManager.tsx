'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  FileVideo, 
  FileImage, 
  Box,
  Play,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Media3D {
  modelUrl?: string;
  textureUrls?: string[];
  type: '3d_model' | '360_view';
  previewImage?: string;
  modelSize?: number;
  animations?: string[];
}

interface ProductVideo {
  url: string;
  type: 'product_demo' | 'unboxing' | 'tutorial' | 'review';
  thumbnail?: string;
  duration?: number;
  title?: string;
  description?: string;
}

interface ProductMediaManagerProps {
  media3D?: Media3D;
  videos?: ProductVideo[];
  onMedia3DChange: (media3D?: Media3D) => void;
  onVideosChange: (videos: ProductVideo[]) => void;
  disabled?: boolean;
}

const VIDEO_TYPE_OPTIONS = [
  { value: 'product_demo', label: 'Démonstration produit' },
  { value: 'unboxing', label: 'Déballage' },
  { value: 'tutorial', label: 'Tutoriel' },
  { value: 'review', label: 'Avis client' }
];

const MEDIA_3D_TYPE_OPTIONS = [
  { value: '3d_model', label: 'Modèle 3D interactif' },
  { value: '360_view', label: 'Vue 360°' }
];

export default function ProductMediaManager({
  media3D,
  videos = [],
  onMedia3DChange,
  onVideosChange,
  disabled = false
}: ProductMediaManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newVideo, setNewVideo] = useState<Partial<ProductVideo>>({
    type: 'product_demo'
  });

  // Gestion du drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (disabled) return;

    setUploading(true);
    try {
      // Simulation d'upload - remplacer par votre logique d'upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Déterminer le type de fichier
      const isVideo = file.type.startsWith('video/');
      const is3D = file.name.endsWith('.gltf') || file.name.endsWith('.glb');
      
      if (isVideo) {
        // Upload vidéo
        const videoUrl = URL.createObjectURL(file); // Remplacer par l'URL réelle après upload
        const newVideoData: ProductVideo = {
          url: videoUrl,
          type: newVideo.type as any || 'product_demo',
          title: newVideo.title || file.name,
          description: newVideo.description
        };
        onVideosChange([...videos, newVideoData]);
        setNewVideo({ type: 'product_demo' });
      } else if (is3D) {
        // Upload modèle 3D
        const modelUrl = URL.createObjectURL(file); // Remplacer par l'URL réelle après upload
        const newMedia3D: Media3D = {
          modelUrl,
          type: '3d_model',
          modelSize: file.size,
          textureUrls: [],
          animations: []
        };
        onMedia3DChange(newMedia3D);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const addVideo = () => {
    if (!newVideo.url || !newVideo.type) return;
    
    const videoData: ProductVideo = {
      url: newVideo.url,
      type: newVideo.type as any,
      title: newVideo.title,
      description: newVideo.description,
      thumbnail: newVideo.thumbnail
    };
    
    onVideosChange([...videos, videoData]);
    setNewVideo({ type: 'product_demo' });
  };

  const removeVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    onVideosChange(updatedVideos);
  };

  const remove3DMedia = () => {
    onMedia3DChange(undefined);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Section Médias 3D */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            Médias 3D et 360°
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {media3D ? (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary">
                    {MEDIA_3D_TYPE_OPTIONS.find(opt => opt.value === media3D.type)?.label}
                  </Badge>
                  {media3D.modelSize && (
                    <p className="text-sm text-muted-foreground">
                      Taille: {formatFileSize(media3D.modelSize)}
                    </p>
                  )}
                  {media3D.animations && media3D.animations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {media3D.animations.map((anim, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {anim}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={remove3DMedia}
                  disabled={disabled}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              {media3D.previewImage && (
                <img 
                  src={media3D.previewImage} 
                  alt="Aperçu 3D" 
                  className="w-full h-32 object-cover rounded"
                />
              )}

              {/* Configuration supplémentaire */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="media3d-type">Type de média 3D</Label>
                  <Select
                    value={media3D.type}
                    onValueChange={(value: '3d_model' | '360_view') => 
                      onMedia3DChange({ ...media3D, type: value })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDIA_3D_TYPE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preview-image">Image d'aperçu (URL)</Label>
                  <Input
                    id="preview-image"
                    value={media3D.previewImage || ''}
                    onChange={(e) => 
                      onMedia3DChange({ ...media3D, previewImage: e.target.value })
                    }
                    placeholder="https://..."
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !disabled && document.getElementById('file-3d-input')?.click()}
            >              <input
                id="file-3d-input"
                type="file"
                className="hidden"
                accept=".gltf,.glb,.obj"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                disabled={disabled}
                aria-label="Sélectionner un fichier modèle 3D"
                title="Choisir un fichier modèle 3D (GLTF, GLB, OBJ)"
              />
              <Box className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Ajouter un modèle 3D</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Glissez-déposez un fichier GLTF, GLB ou OBJ, ou cliquez pour sélectionner
              </p>
              <Button variant="outline" disabled={disabled || uploading}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Upload en cours...' : 'Sélectionner un fichier'}
              </Button>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Formats supportés: GLTF (.gltf), GLB (.glb), OBJ (.obj). Taille max: 50MB.
              Pour de meilleures performances, optimisez vos modèles avant l'upload.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Section Vidéos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="w-5 h-5" />
            Vidéos du produit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulaire d'ajout de vidéo */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Ajouter une vidéo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="video-url">URL de la vidéo *</Label>
                <Input
                  id="video-url"
                  value={newVideo.url || ''}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                  placeholder="https://..."
                  disabled={disabled}
                />
              </div>
              <div>
                <Label htmlFor="video-type">Type de vidéo *</Label>
                <Select
                  value={newVideo.type}
                  onValueChange={(value) => setNewVideo({ ...newVideo, type: value as any })}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="video-title">Titre</Label>
                <Input
                  id="video-title"
                  value={newVideo.title || ''}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="Titre de la vidéo"
                  disabled={disabled}
                />
              </div>
              <div>
                <Label htmlFor="video-thumbnail">Miniature (URL)</Label>
                <Input
                  id="video-thumbnail"
                  value={newVideo.thumbnail || ''}
                  onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
                  placeholder="https://..."
                  disabled={disabled}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="video-description">Description</Label>
              <Textarea
                id="video-description"
                value={newVideo.description || ''}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                placeholder="Description de la vidéo"
                rows={3}
                disabled={disabled}
              />
            </div>
            <Button 
              onClick={addVideo} 
              disabled={!newVideo.url || !newVideo.type || disabled}
            >
              <Play className="w-4 h-4 mr-2" />
              Ajouter la vidéo
            </Button>
          </div>

          {/* Liste des vidéos */}
          {videos.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Vidéos ajoutées ({videos.length})</h4>
              {videos.map((video, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  {video.thumbnail && (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title || 'Vidéo'}
                      className="w-20 h-12 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">
                          {VIDEO_TYPE_OPTIONS.find(opt => opt.value === video.type)?.label}
                        </Badge>
                        {video.title && (
                          <h5 className="font-medium">{video.title}</h5>
                        )}
                        {video.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {video.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {video.url}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeVideo(index)}
                        disabled={disabled}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Formats vidéo recommandés: MP4, WebM. Hébergez vos vidéos sur YouTube, Vimeo, 
              ou votre CDN pour de meilleures performances.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
