"use server";
import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

// Fonction pour détecter le type de projet basé sur les fichiers présents
const detectProjectTemplate = async (projectPath: string): Promise<"REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR"> => {
  try {
    const packageJsonPath = path.join(projectPath, "package.json");
    
    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(packageJsonContent);
      
      // Détection basée sur les dépendances
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (dependencies["next"]) return "NEXTJS";
      if (dependencies["@angular/core"]) return "ANGULAR";
      if (dependencies["vue"]) return "VUE";
      if (dependencies["hono"]) return "HONO";
      if (dependencies["express"]) return "EXPRESS";
      if (dependencies["react"]) return "REACT";
    } catch {
      // Si pas de package.json, on regarde les fichiers
    }
    
    // Détection basée sur les fichiers présents
    const files = await fs.readdir(projectPath);
    
    if (files.includes("next.config.js") || files.includes("next.config.ts")) return "NEXTJS";
    if (files.includes("angular.json")) return "ANGULAR";
    if (files.includes("vue.config.js") || files.includes("vite.config.js")) return "VUE";
    
    // Par défaut, on assume React
    return "REACT";
  } catch (error) {
    console.error("Erreur lors de la détection du template:", error);
    return "REACT";
  }
};

// Fonction pour lire la structure des fichiers d'un projet local
const readProjectStructure = async (projectPath: string): Promise<any> => {
  try {
    const readDirectory = async (dirPath: string, relativePath = ""): Promise<any> => {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const structure: any = {};
      
      for (const item of items) {
        // Ignorer les dossiers/fichiers système
        if (item.name.startsWith('.') || item.name === 'node_modules') continue;
        
        const fullPath = path.join(dirPath, item.name);
        const itemRelativePath = path.join(relativePath, item.name);
        
        if (item.isDirectory()) {
          structure[item.name] = {
            type: "folder",
            children: await readDirectory(fullPath, itemRelativePath)
          };
        } else {
          // Lire le contenu du fichier
          try {
            const content = await fs.readFile(fullPath, "utf-8");
            structure[item.name] = {
              type: "file",
              content: content
            };
          } catch {
            // Si on ne peut pas lire le fichier (binaire, etc.), on l'ignore
            structure[item.name] = {
              type: "file",
              content: "// Fichier binaire ou non lisible"
            };
          }
        }
      }
      
      return structure;
    };
    
    return await readDirectory(projectPath);
  } catch (error) {
    console.error("Erreur lors de la lecture de la structure:", error);
    return {};
  }
};

// Action pour ouvrir un projet local existant
export const openLocalProject = async (data: {
  projectPath: string;
  title?: string;
}) => {
  const { projectPath, title } = data;
  
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("Utilisateur non authentifié");
  }
  
  try {
    // Vérifier que le chemin existe
    await fs.access(projectPath);
    
    // Détecter le type de projet
    const template = await detectProjectTemplate(projectPath);
    
    // Lire la structure du projet
    const projectStructure = await readProjectStructure(projectPath);
    
    // Générer un titre basé sur le nom du dossier si non fourni
    const projectName = title || path.basename(projectPath);
    
    // Créer l'entrée dans la base de données
    const playground = await db.playground.create({
      data: {
        title: projectName,
        description: `Projet local importé depuis ${projectPath}`,
        template: template,
        localPath: projectPath,
        userId: user.id
      }
    });
    
    // Créer l'entrée des fichiers template
    await db.templateFile.create({
      data: {
        content: projectStructure,
        playgroundId: playground.id
      }
    });
    
    revalidatePath("/dashboard");
    return playground;
  } catch (error) {
    console.error("Erreur lors de l'ouverture du projet local:", error);
    throw new Error("Impossible d'ouvrir le projet local");
  }
};

// Action pour synchroniser un projet local avec les modifications
export const syncLocalProject = async (playgroundId: string, projectStructure: any) => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("Utilisateur non authentifié");
  }
  
  try {
    // Récupérer le projet
    const playground = await db.playground.findUnique({
      where: { id: playgroundId },
      include: { templateFiles: true }
    });
    
    if (!playground || playground.userId !== user.id) {
      throw new Error("Projet non trouvé ou accès non autorisé");
    }
    
    if (!playground.localPath) {
      throw new Error("Ce projet n'est pas lié à un dossier local");
    }
    
    // Fonction récursive pour écrire les fichiers
    const writeStructure = async (structure: any, basePath: string) => {
      for (const [name, item] of Object.entries(structure as any)) {
        const fullPath = path.join(basePath, name);
        
        if (item.type === "folder") {
          await fs.mkdir(fullPath, { recursive: true });
          await writeStructure(item.children, fullPath);
        } else if (item.type === "file") {
          await fs.writeFile(fullPath, item.content, "utf-8");
        }
      }
    };
    
    // Écrire la structure mise à jour dans le dossier local
    await writeStructure(projectStructure, playground.localPath);
    
    // Mettre à jour la base de données
    await db.templateFile.update({
      where: { playgroundId: playgroundId },
      data: { content: projectStructure }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    throw new Error("Impossible de synchroniser le projet local");
  }
};