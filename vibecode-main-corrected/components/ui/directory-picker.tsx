"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DirectoryPickerProps {
  onDirectorySelect: (path: string) => void;
  selectedPath?: string;
  label?: string;
  placeholder?: string;
}

export function DirectoryPicker({
  onDirectorySelect,
  selectedPath = "",
  label = "Dossier local",
  placeholder = "Sélectionnez un dossier..."
}: DirectoryPickerProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [manualPath, setManualPath] = useState(selectedPath);

  const handleDirectoryPick = async () => {
    try {
      // Vérifier si l'API File System Access est supportée
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite'
        });
        
        // Construire le chemin à partir du handle
        const path = directoryHandle.name;
        onDirectorySelect(path);
        setManualPath(path);
      } else {
        setIsSupported(false);
      }
    } catch (error) {
      // L'utilisateur a annulé ou une erreur s'est produite
      console.log('Sélection de dossier annulée:', error);
    }
  };

  const handleManualPathChange = (value: string) => {
    setManualPath(value);
    onDirectorySelect(value);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="directory-picker">{label}</Label>
      
      <div className="flex gap-2">
        <Input
          id="directory-picker"
          value={manualPath}
          onChange={(e) => handleManualPathChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        
        {isSupported && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDirectoryPick}
            className="shrink-0"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Parcourir
          </Button>
        )}
      </div>
      
      {!isSupported && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Votre navigateur ne supporte pas la sélection automatique de dossiers. 
            Veuillez saisir manuellement le chemin du dossier.
          </AlertDescription>
        </Alert>
      )}
      
      <p className="text-sm text-muted-foreground">
        Exemple: C:\Users\VotreNom\Documents\MesProjets ou /home/user/projects
      </p>
    </div>
  );
}