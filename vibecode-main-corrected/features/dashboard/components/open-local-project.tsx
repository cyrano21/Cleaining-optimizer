"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DirectoryPicker } from "@/components/ui/directory-picker";
import { openLocalProject } from "@/features/playground/actions/local-project";
import { FolderOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const OpenLocalProject = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectPath, setProjectPath] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!projectPath.trim()) {
      toast.error("Veuillez sélectionner un dossier de projet");
      return;
    }

    setIsLoading(true);
    try {
      const playground = await openLocalProject({
        projectPath: projectPath.trim(),
        title: projectTitle.trim() || undefined,
      });

      toast.success("Projet local ouvert avec succès !");
      setIsOpen(false);
      setProjectPath("");
      setProjectTitle("");
      
      // Rediriger vers le playground
      router.push(`/playground/${playground?.id}`);
    } catch (error) {
      console.error("Erreur lors de l'ouverture du projet:", error);
      toast.error("Impossible d'ouvrir le projet local");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setProjectPath("");
    setProjectTitle("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-muted cursor-pointer 
        transition-all duration-300 ease-in-out
        hover:bg-background hover:border-[#E93F3F] hover:scale-[1.02]
        shadow-[0_2px_10px_rgba(0,0,0,0.08)]
        hover:shadow-[0_10px_30px_rgba(233,63,63,0.15)]">
          <div className="flex flex-row justify-center items-start gap-4">
            <Button
              variant={"outline"}
              className="flex justify-center items-center bg-white group-hover:bg-[#fff8f8] group-hover:border-[#E93F3F] group-hover:text-[#E93F3F] transition-colors duration-300"
              size={"icon"}
            >
              <FolderOpen className="h-5 w-5" />
            </Button>
            <div className="flex flex-col justify-start items-start gap-1">
              <h3 className="text-lg font-semibold group-hover:text-[#E93F3F] transition-colors duration-300">
                Ouvrir un projet local
              </h3>
              <p className="text-sm text-muted-foreground">
                Importez un projet existant depuis votre ordinateur
              </p>
            </div>
          </div>
          <Plus className="h-6 w-6 text-muted-foreground group-hover:text-[#E93F3F] transition-colors duration-300" />
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Ouvrir un projet local
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un dossier contenant un projet existant pour l'importer dans Vibecode.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-title">Nom du projet (optionnel)</Label>
            <Input
              id="project-title"
              placeholder="Mon projet awesome"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si vide, le nom du dossier sera utilisé
            </p>
          </div>
          
          <DirectoryPicker
            onDirectorySelect={setProjectPath}
            selectedPath={projectPath}
            label="Dossier du projet"
            placeholder="Sélectionnez le dossier de votre projet..."
          />
          
          {projectPath && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Dossier sélectionné :</p>
              <p className="text-sm text-muted-foreground break-all">{projectPath}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !projectPath.trim()}>
            {isLoading ? "Ouverture..." : "Ouvrir le projet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OpenLocalProject;