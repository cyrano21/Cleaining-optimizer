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
  Box, 
  Upload, 
  Trash2, 
  Eye,
  Download,
  FileIcon,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaUploadService } from '@/services/mediaUploadService';
import { toast } from 'sonner';

interface Product3DData {
  modelUrl: string;
  textureUrls: string[];
  type: 'gltf' | 'glb' | 'obj';
  previewImage?: string;
  modelSize?: number;
  animations?: string[];
}

interface Product3DManagerProps {
  media3D: Product3DData[];
  onChange: (media3D: Product3DData[]) => void;
}

export function Product3DManager({ media3D, onChange }: Product3DManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newModel, setNewModel] = useState<Partial<Product3DData>>({
    type: 'gltf',
    textureUrls: [],
    animations: []
  });

  const uploadService = MediaUploadService.getInstance();

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    const file = files[0];

    try {
      const result = await uploadService.uploadFile(file, '3d');
      if (result.success && result.url) {
        // Déterminer le type de fichier
        const extension = file.name.split('.').pop()?.toLowerCase();
        let type: 'gltf' | 'glb' | 'obj' = 'gltf';
        
        if (extension === 'glb') type = 'glb';
        else if (extension === 'obj') type = 'obj';

        const newModelData: Product3DData = {
          modelUrl: result.url,
          textureUrls: [],
          type,
          modelSize: result.size,
          animations: []
        };

        onChange([...media3D, newModelData]);
        toast.success('Modèle 3D uploadé avec succès !');
      } else {
        toast.error(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload 3D:', error);
      toast.error('Erreur lors de l\'upload du modèle 3D');
    } finally {
      setUploading(false);
    }
  }, [media3D, onChange, uploadService]);

  const handleTextureUpload = useCallback(async (files: FileList, modelIndex: number) => {
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadService.uploadFile(file, 'image')
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results
        .filter(result => result.success && result.url)
        .map(result => result.url!);

      if (successfulUploads.length > 0) {
        const updatedMedia3D = [...media3D];
        updatedMedia3D[modelIndex].textureUrls = [
          ...updatedMedia3D[modelIndex].textureUrls,
          ...successfulUploads
        ];
        onChange(updatedMedia3D);
        toast.success(`${successfulUploads.length} texture(s) ajoutée(s)`);
      }
    } catch (error) {
      console.error('Erreur upload textures:', error);
      toast.error('Erreur lors de l\'upload des textures');
    } finally {
      setUploading(false);
    }
  }, [media3D, onChange, uploadService]);

  const handlePreviewUpload = useCallback(async (file: File, modelIndex: number) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadFile(file, 'image');
      if (result.success && result.url) {
        const updatedMedia3D = [...media3D];
        updatedMedia3D[modelIndex].previewImage = result.url;
        onChange(updatedMedia3D);
        toast.success('Image de prévisualisation ajoutée');
      } else {
        toast.error(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload preview:', error);
      toast.error('Erreur lors de l\'upload de la prévisualisation');
    } finally {
      setUploading(false);
    }
  }, [media3D, onChange, uploadService]);

  const removeModel = useCallback((index: number) => {
    const updatedMedia3D = media3D.filter((_, i) => i !== index);
    onChange(updatedMedia3D);
    toast.success('Modèle 3D supprimé');
  }, [media3D, onChange]);

  const removeTexture = useCallback((modelIndex: number, textureIndex: number) => {
    const updatedMedia3D = [...media3D];
    updatedMedia3D[modelIndex].textureUrls = updatedMedia3D[modelIndex].textureUrls.filter(
      (_, i) => i !== textureIndex
    );
    onChange(updatedMedia3D);
    toast.success('Texture supprimée');
  }, [media3D, onChange]);

  const addAnimation = useCallback((modelIndex: number, animationName: string) => {
    if (!animationName.trim()) return;

    const updatedMedia3D = [...media3D];
    updatedMedia3D[modelIndex].animations = [
      ...(updatedMedia3D[modelIndex].animations || []),
      animationName.trim()
    ];
    onChange(updatedMedia3D);
  }, [media3D, onChange]);

  const removeAnimation = useCallback((modelIndex: number, animationIndex: number) => {
    const updatedMedia3D = [...media3D];
    updatedMedia3D[modelIndex].animations = updatedMedia3D[modelIndex].animations?.filter(
      (_, i) => i !== animationIndex
    ) || [];
    onChange(updatedMedia3D);
  }, [media3D, onChange]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Taille inconnue';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Modèles 3D
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Box className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Glissez-déposez votre modèle 3D ou cliquez pour parcourir
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Formats supportés: GLTF, GLB, OBJ • Taille max: 50MB
            </p>
            <input
              type="file"
              accept=".gltf,.glb,.obj"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="model-upload"
              disabled={uploading}
            />
            <Button 
              asChild 
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <label htmlFor="model-upload" className="cursor-pointer">
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir un modèle 3D
                  </>
                )}
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des modèles 3D */}
      {media3D.map((model, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5" />
                <span className="font-medium">Modèle 3D {index + 1}</span>
                <Badge variant="secondary">{model.type.toUpperCase()}</Badge>
                {model.modelSize && (
                  <Badge variant="outline">{formatFileSize(model.modelSize)}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeModel(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* URL du modèle */}
            <div>
              <Label className="text-sm font-medium">URL du modèle</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={model.modelUrl} 
                  readOnly 
                  className="flex-1 text-sm"
                />                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={model.modelUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Voir le modèle 3D"
                    aria-label="Ouvrir le modèle 3D dans un nouvel onglet"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Configuration avancée */}
            {editingIndex === index && (
              <div className="space-y-4 border-t pt-4">
                {/* Image de prévisualisation */}
                <div>
                  <Label className="text-sm font-medium">Image de prévisualisation</Label>
                  {model.previewImage ? (
                    <div className="mt-2 relative">
                      <img 
                        src={model.previewImage} 
                        alt="Prévisualisation" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          const updatedMedia3D = [...media3D];
                          delete updatedMedia3D[index].previewImage;
                          onChange(updatedMedia3D);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handlePreviewUpload(e.target.files[0], index)}
                        className="hidden"
                        id={`preview-upload-${index}`}
                      />
                      <Button asChild size="sm" variant="outline">
                        <label htmlFor={`preview-upload-${index}`} className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Ajouter une prévisualisation
                        </label>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Textures */}
                <div>
                  <Label className="text-sm font-medium">Textures</Label>
                  <div className="mt-2 space-y-2">
                    {model.textureUrls.map((textureUrl, textureIndex) => (
                      <div key={textureIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <img 
                          src={textureUrl} 
                          alt={`Texture ${textureIndex + 1}`}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-sm flex-1 truncate">{textureUrl}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeTexture(index, textureIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => e.target.files && handleTextureUpload(e.target.files, index)}
                      className="hidden"
                      id={`texture-upload-${index}`}
                    />
                    <Button asChild size="sm" variant="outline">
                      <label htmlFor={`texture-upload-${index}`} className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter des textures
                      </label>
                    </Button>
                  </div>
                </div>

                {/* Animations */}
                <div>
                  <Label className="text-sm font-medium">Animations</Label>
                  <div className="mt-2 space-y-2">
                    {model.animations?.map((animation, animIndex) => (
                      <div key={animIndex} className="flex items-center gap-2">
                        <Badge variant="outline">{animation}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeAnimation(index, animIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nom de l'animation"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addAnimation(index, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input?.value) {
                            addAnimation(index, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {media3D.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Box className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Aucun modèle 3D ajouté</p>            <p className="text-sm text-gray-500">Uploadez vos premiers modèles 3D pour enrichir vos produits</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Product3DManager;
