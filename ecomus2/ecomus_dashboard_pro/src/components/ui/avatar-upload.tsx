"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage, getGravatarUrl } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  currentAvatarPublicId?: string; // Ajouter le public_id pour Cloudinary
  fallbackText?: string;
  userEmail?: string; // Ajouter l'email pour le gravatar
  onAvatarChange: (avatarUrl: string | null, publicId?: string | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({
  currentAvatar,
  currentAvatarPublicId,
  fallbackText = 'U',
  userEmail,
  onAvatarChange,
  className,
  size = 'md'
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(currentAvatarPublicId || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const buttonSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image.');
      return;
    }

    // Vérification de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale : 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Créer une preview locale
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);      // Upload vers l'API Cloudinary existante
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar'); // Spécifier que c'est un avatar

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }
        // Notifier le parent du nouvel avatar (Cloudinary URL et public_id)
      onAvatarChange(result.data.url, result.data.public_id);
      setCurrentPublicId(result.data.public_id);
      
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      alert('Erreur lors de l\'upload de l\'image.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };
  const handleRemoveAvatar = async () => {
    if (currentPublicId) {
      try {
        setIsUploading(true);
        
        // Supprimer de Cloudinary
        const response = await fetch(`/api/upload?public_id=${encodeURIComponent(currentPublicId)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la suppression');
        }

        console.log('🗑️ Avatar supprimé de Cloudinary:', currentPublicId);
      } catch (error) {
        console.error('Erreur suppression avatar:', error);
        alert('Erreur lors de la suppression de l\'avatar.');
        return;
      } finally {
        setIsUploading(false);
      }
    }

    setPreviewUrl(null);
    setCurrentPublicId(null);
    onAvatarChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Utiliser le gravatar si aucun avatar personnalisé n'est défini
  const gravatarUrl = userEmail ? getGravatarUrl(userEmail, 200) : '';
  const displayAvatar = previewUrl || currentAvatar || gravatarUrl;
  const shouldShowInitials = !displayAvatar || displayAvatar === '/images/placeholder.svg';

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeClasses[size], "ring-2 ring-white/50 dark:ring-gray-600/50")}>
        {shouldShowInitials ? (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {fallbackText}
            </span>
          </div>
        ) : (
          <AvatarImage
            src={displayAvatar}
            alt="Avatar"
            className="object-cover"
          />
        )}
        <AvatarFallback>
          {fallbackText}
        </AvatarFallback>
      </Avatar>

      {/* Bouton Camera */}
      <Button
        size="icon"
        variant="secondary"
        className={cn(
          "absolute bottom-0 right-0 rounded-full shadow-lg",
          buttonSizeClasses[size]
        )}
        onClick={handleFileSelect}
        disabled={isUploading}
        title="Changer l'avatar"
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
        ) : (
          <Camera className={iconSizeClasses[size]} />
        )}
      </Button>

      {/* Bouton Supprimer (si avatar présent) */}
      {displayAvatar && displayAvatar !== '/images/placeholder.svg' && (
        <Button
          size="icon"
          variant="destructive"
          className={cn(
            "absolute -top-2 -right-2 rounded-full shadow-lg",
            buttonSizeClasses[size]
          )}
          onClick={handleRemoveAvatar}
          disabled={isUploading}
          title="Supprimer l'avatar"
        >
          <X className={iconSizeClasses[size]} />
        </Button>
      )}      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Sélectionner un fichier image pour l'avatar"
      />
    </div>
  );
}
