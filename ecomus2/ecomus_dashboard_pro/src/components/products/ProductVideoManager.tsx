'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileVideo, 
  Upload, 
  Trash2, 
  Eye,
  Play,
  Pause,
  Download,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaUploadService } from '@/services/mediaUploadService';
import { toast } from 'sonner';

interface ProductVideoData {
  url: string;
  type: 'upload' | 'youtube' | 'vimeo';
  thumbnail?: string;
  duration?: number;
  title?: string;
  description?: string;
}

interface ProductVideoManagerProps {
  videos: ProductVideoData[];
  onChange: (videos: ProductVideoData[]) => void;
}

export function ProductVideoManager({ videos, onChange }: ProductVideoManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newVideo, setNewVideo] = useState<Partial<ProductVideoData>>({
    type: 'upload',
    title: '',
    description: ''
  });

  const uploadService = MediaUploadService.getInstance();

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    const file = files[0];

    try {
      const result = await uploadService.uploadFile(file, 'video');
      if (result.success && result.url) {
        const newVideoData: ProductVideoData = {
          url: result.url,
          type: 'upload',
          title: file.name.split('.')[0],
          duration: 0 // À calculer côté serveur idéalement
        };

        onChange([...videos, newVideoData]);
        toast.success('Vidéo uploadée avec succès !');
      } else {
        toast.error(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload vidéo:', error);
      toast.error('Erreur lors de l\'upload de la vidéo');
    } finally {
      setUploading(false);
    }
  }, [videos, onChange, uploadService]);

  const handleThumbnailUpload = useCallback(async (file: File, videoIndex: number) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadFile(file, 'image');
      if (result.success && result.url) {
        const updatedVideos = [...videos];
        updatedVideos[videoIndex].thumbnail = result.url;
        onChange(updatedVideos);
        toast.success('Miniature ajoutée');
      } else {
        toast.error(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload thumbnail:', error);
      toast.error('Erreur lors de l\'upload de la miniature');
    } finally {
      setUploading(false);
    }
  }, [videos, onChange, uploadService]);

  const addExternalVideo = useCallback(() => {
    if (!newVideo.url?.trim()) {
      toast.error('Veuillez saisir une URL valide');
      return;
    }

    let videoType: 'youtube' | 'vimeo' | 'upload' = 'upload';
    let processedUrl = newVideo.url.trim();

    // Détecter le type de vidéo
    if (processedUrl.includes('youtube.com') || processedUrl.includes('youtu.be')) {
      videoType = 'youtube';
      // Extraire l'ID YouTube
      const youtubeId = extractYouTubeId(processedUrl);
      if (youtubeId) {
        processedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      }
    } else if (processedUrl.includes('vimeo.com')) {
      videoType = 'vimeo';
      // Extraire l'ID Vimeo
      const vimeoId = extractVimeoId(processedUrl);
      if (vimeoId) {
        processedUrl = `https://player.vimeo.com/video/${vimeoId}`;
      }
    }

    const videoData: ProductVideoData = {
      url: processedUrl,
      type: videoType,
      title: newVideo.title || 'Vidéo produit',
      description: newVideo.description || ''
    };

    onChange([...videos, videoData]);
    setNewVideo({ type: 'upload', title: '', description: '' });
    toast.success('Vidéo ajoutée avec succès !');
  }, [newVideo, videos, onChange]);

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const extractVimeoId = (url: string): string | null => {
    const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[5] : null;
  };

  const removeVideo = useCallback((index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    onChange(updatedVideos);
    toast.success('Vidéo supprimée');
  }, [videos, onChange]);

  const updateVideo = useCallback((index: number, updatedData: Partial<ProductVideoData>) => {
    const updatedVideos = [...videos];
    updatedVideos[index] = { ...updatedVideos[index], ...updatedData };
    onChange(updatedVideos);
  }, [videos, onChange]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Durée inconnue';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVideoTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return '🎬'; // YouTube
      case 'vimeo':
        return '🎭'; // Vimeo
      default:
        return '📹'; // Upload
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            Vidéos Produit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de fichier vidéo */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileVideo className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Glissez-déposez votre vidéo ou cliquez pour parcourir
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Formats supportés: MP4, WebM, OGG • Taille max: 100MB
            </p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="video-upload"
              disabled={uploading}
            />
            <Button 
              asChild 
              disabled={uploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <label htmlFor="video-upload" className="cursor-pointer">
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir une vidéo
                  </>
                )}
              </label>
            </Button>
          </div>

          {/* Ajout de vidéo externe (YouTube/Vimeo) */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Ajouter une vidéo externe</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL de la vidéo</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                  value={newVideo.url || ''}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  placeholder="Titre de la vidéo"
                  value={newVideo.title || ''}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3">
              <Label>Description (optionnelle)</Label>
              <Textarea
                placeholder="Description de la vidéo..."
                value={newVideo.description || ''}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                rows={2}
              />
            </div>
            <Button 
              onClick={addExternalVideo}
              className="mt-3 bg-red-600 hover:bg-red-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ajouter la vidéo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des vidéos */}
      {videos.map((video, index) => (
        <Card key={index} className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getVideoTypeIcon(video.type)}</span>
                <span className="font-medium">{video.title || `Vidéo ${index + 1}`}</span>
                <Badge variant="secondary">{video.type.toUpperCase()}</Badge>
                {video.duration && (
                  <Badge variant="outline">{formatDuration(video.duration)}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeVideo(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Aperçu de la vidéo */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {video.type === 'upload' ? (
                <video 
                  controls 
                  className="w-full h-full object-cover"
                  poster={video.thumbnail}
                >
                  <source src={video.url} type="video/mp4" />
                  Votre navigateur ne supporte pas la vidéo HTML5.
                </video>
              ) : (
                <iframe
                  src={video.url}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Configuration avancée */}
            {editingIndex === index && (
              <div className="space-y-4 border-t pt-4">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Titre</Label>
                    <Input
                      value={video.title || ''}
                      onChange={(e) => updateVideo(index, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={video.url}
                      onChange={(e) => updateVideo(index, { url: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={video.description || ''}
                    onChange={(e) => updateVideo(index, { description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Miniature personnalisée pour les vidéos uploadées */}
                {video.type === 'upload' && (
                  <div>
                    <Label>Miniature personnalisée</Label>
                    {video.thumbnail ? (
                      <div className="mt-2 relative inline-block">
                        <img 
                          src={video.thumbnail} 
                          alt="Miniature" 
                          className="w-32 h-20 object-cover rounded border"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-1 right-1"
                          onClick={() => updateVideo(index, { thumbnail: undefined })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0], index)}
                          className="hidden"
                          id={`thumbnail-upload-${index}`}
                        />
                        <Button asChild size="sm" variant="outline">
                          <label htmlFor={`thumbnail-upload-${index}`} className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Ajouter une miniature
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {videos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <FileVideo className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Aucune vidéo ajoutée</p>
            <p className="text-sm text-gray-500">
              Uploadez des vidéos ou ajoutez des liens YouTube/Vimeo pour présenter vos produits            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProductVideoManager;
