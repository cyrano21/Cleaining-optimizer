'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, FileType, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

const ACCEPTED_3D_FORMATS = {
  'model/gltf-binary': ['.glb'],
  'model/gltf+json': ['.gltf'],
  'model/obj': ['.obj'],
  'model/fbx': ['.fbx']
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function Model3DUpload({ 
  onUploadSuccess, 
  productId, 
  className = '' 
}) {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadedModels, setUploadedModels] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!productId) {
      toast.error('ID du produit requis pour l\'upload');
      return;
    }

    const filesToUpload = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max 50MB)`);
        return false;
      }
      return true;
    });

    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    setUploadingFiles(filesToUpload.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    })));

    for (const file of filesToUpload) {
      try {
        await uploadSingle3DFile(file);
      } catch (error) {
        console.error('Upload error:', error);
        updateFileStatus(file.name, 'error', error.message);
      }
    }

    setIsUploading(false);
  }, [productId]);

  const uploadSingle3DFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);
    formData.append('name', file.name.split('.')[0]);
    formData.append('description', `Modèle 3D ${file.name}`);

    try {
      updateFileStatus(file.name, 'uploading', 'Upload en cours...');

      const response = await fetch('/api/products/3d/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }

      updateFileStatus(file.name, 'success', 'Upload réussi');
      
      const newModel = {
        url: result.url,
        format: result.format,
        size: result.size,
        thumbnail: result.thumbnail,
        name: result.name,
        description: result.description
      };

      setUploadedModels(prev => [...prev, newModel]);
      
      if (onUploadSuccess) {
        onUploadSuccess(newModel);
      }

      toast.success(`Modèle 3D ${file.name} uploadé avec succès`);

    } catch (error) {
      updateFileStatus(file.name, 'error', error.message);
      toast.error(`Erreur upload ${file.name}: ${error.message}`);
    }
  };

  const updateFileStatus = (fileName, status, message = '') => {
    setUploadingFiles(prev => 
      prev.map(item => 
        item.file.name === fileName 
          ? { ...item, status, message }
          : item
      )
    );
  };

  const removeUploadedModel = (index) => {
    setUploadedModels(prev => prev.filter((_, i) => i !== index));
  };

  const clearUploadingFiles = () => {
    setUploadingFiles([]);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_3D_FORMATS,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: isUploading
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : 'border-gray-300'}
          ${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Relâchez les fichiers ici' : 'Glissez vos modèles 3D ici'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ou cliquez pour sélectionner des fichiers
            </p>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Formats acceptés: GLB, GLTF, OBJ, FBX</p>
            <p>Taille maximale: 50MB par fichier</p>
          </div>
        </div>
      </div>

      {/* Fichiers en cours d'upload */}
      {uploadingFiles.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Upload en cours</h3>
            {!isUploading && (
              <button
                onClick={clearUploadingFiles}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Effacer
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {uploadingFiles.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileType className="w-5 h-5 text-gray-400" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.status === 'uploading' && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Upload...</span>
                    </div>
                  )}
                  
                  {item.status === 'success' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Réussi</span>
                    </div>
                  )}
                  
                  {item.status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">Erreur</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modèles uploadés */}
      {uploadedModels.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Modèles 3D ajoutés</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedModels.map((model, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileType className="w-6 h-6 text-green-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {model.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {model.format?.toUpperCase()} • {formatFileSize(model.size)}
                  </p>
                </div>
                
                <button
                  onClick={() => removeUploadedModel(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
