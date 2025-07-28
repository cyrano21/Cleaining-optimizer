"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GitHubRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (repoUrl: string) => Promise<void>;
}

const GitHubRepoModal = ({ isOpen, onClose, onSubmit }: GitHubRepoModalProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      toast.error("Veuillez entrer une URL de repository");
      return;
    }

    // Validation basique de l'URL GitHub
    const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(repoUrl.trim())) {
      toast.error("Veuillez entrer une URL GitHub valide (ex: https://github.com/user/repo)");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(repoUrl.trim());
      setRepoUrl("");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'importation du repository:", error);
      // Afficher le message d'erreur spécifique de l'API
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'importation du repository";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setRepoUrl("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5 text-[#E93F3F]" />
            Ouvrir un Repository GitHub
          </DialogTitle>
          <DialogDescription>
            Entrez l&apos;URL du repository GitHub que vous souhaitez importer dans l&apos;éditeur.
          </DialogDescription>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-blue-800 font-medium mb-2">🔐 Accès aux dépôts privés :</p>
            <p className="text-sm text-blue-700 space-y-1">
              <span>• </span>
              <b>Automatique :</b>
              <span> Connectez-vous avec GitHub pour un accès direct</span>
              <br />
              <span>• </span>
              <b>Manuel :</b>
              <span> Configurez votre token dans Paramètres &gt; API Configuration</span>
            </p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repo-url" className="text-right">
                URL du repo
              </Label>
              <Input
                id="repo-url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repository"
                className="col-span-3"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!repoUrl.trim() || isLoading}
              className="bg-[#E93F3F] hover:bg-[#d03636]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importation...
                </>
              ) : (
                "Importer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubRepoModal;