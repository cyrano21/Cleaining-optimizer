"use server";
import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db"
import { TemplateFile, TemplateFolder } from "../types";
import { revalidatePath } from "next/cache";


// Toggle marked status for a problem
export const toggleStarMarked = async (playgroundId: string, isChecked: boolean) => {
    const user = await currentUser();
    const userId = user?.id;
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    if (isChecked) {
      await db.starMark.create({
        data: {
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        },
      });
    } else {
      await db.starMark.delete({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId: playgroundId,

          },
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.error("Error updating problem:", error);
    return { success: false, error: "Failed to update problem" };
  }
};
export const createPlayground = async (data:{
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
    localPath?: string;
  })=>{
    const {template , title , description} = data;

    const user = await currentUser();
    if (!user?.id) {
        throw new Error("User not authenticated");
    }
    
    try {
        const playground = await db.playground.create({
            data:{
                title:title,
                description:description,
                template:template,
                localPath:localPath,
                userId: user.id
            }
        })

        return playground;
    } catch (error) {
        console.log(error)
    }
}


export const getAllPlaygroundForUser = async ()=>{
    const user = await currentUser();
    if (!user?.id) {
        return [];
    }
    
    try {
        const playground = await db.playground.findMany({
            where:{
                userId: user.id
            },
            include:{
                user:true,
                Starmark:{
                    where:{
                        userId: user.id
                    },
                    select:{
                        isMarked:true
                    }
                }
            }
        })
      
        return playground;
    } catch (error) {
        console.log(error)
    }
}

// Function for getting all playgrounds (for /playgrounds page)
export const getAllPlaygrounds = async ()=>{
    const user = await currentUser();
    if (!user?.id) {
        return [];
    }
    
    try {
        const playground = await db.playground.findMany({
            where:{
                userId: user.id
            },
            include:{
                user:true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
      
        return playground;
    } catch (error) {
        console.log(error)
        return []
    }
}

export const getPlaygroundById = async (id:string)=>{
    try {
        const playground = await db.playground.findUnique({
            where:{id},
            select:{
              id: true,
              title: true,
              description: true,
              template: true,
              userId: true,
              createdAt: true,
              updatedAt: true,
              templateFiles:{
                select:{
                  id: true,
                  content: true
                }
              }
            }
        })
        return playground;
    } catch (error) {
        console.log(error)
    }
}

export const SaveUpdatedCode = async (playgroundId: string, data: TemplateFolder) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const updatedPlayground = await db.templateFile.upsert({
      where: {
        playgroundId, // now allowed since playgroundId is unique
      },
      update: {
        content: JSON.stringify(data),
      },
      create: {
        playgroundId,
        content: JSON.stringify(data),
      },
    });

    return updatedPlayground;
  } catch (error) {
    console.log("SaveUpdatedCode error:", error);
    return null;
  }
};

export const deleteProjectById = async (id:string)=>{
    try {
        await db.playground.delete({
            where:{id}
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.log(error)
    }
}


export const editProjectById = async (id:string,data:{title:string , description:string})=>{
    try {
        await db.playground.update({
            where:{id},
            data:data
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.log(error)
    }
}

export const duplicateProjectById = async (id: string): Promise<void> => {
    try {
        // Fetch the original playground data
        const originalPlayground = await db.playground.findUnique({
            where: { id },
            include: {
                templateFiles: true, // Include related template files
            },
        });

        if (!originalPlayground) {
            throw new Error("Original playground not found");
        }

        // Create a new playground with the same data but a new ID
        await db.playground.create({
            data: {
                title: `${originalPlayground.title} (Copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId,
                templateFiles: {
                  // @ts-expect-error - Prisma nested create type issue
                    create: originalPlayground.templateFiles.map((file) => ({
                        content: file.content,
                    })),
                },
            },
        });

        // Revalidate the dashboard path to reflect the changes
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Error duplicating project:", error);
    }
};

export const importGitHubRepository = async (repoUrl: string) => {
    const user = await currentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    try {
        // Extract owner and repo name from GitHub URL
        // Handle various GitHub URL formats
        const cleanUrl = repoUrl.replace(/\.git$/, '').replace(/\/$/, '');
        const urlMatch = cleanUrl.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
        if (!urlMatch) {
            throw new Error(`Invalid GitHub URL format: ${repoUrl}. Please use: https://github.com/owner/repository`);
        }

        const [, owner, repoName] = urlMatch;
        console.log(`Attempting to import: ${owner}/${repoName} from URL: ${repoUrl}`);
        
        // Récupérer le token GitHub de l'utilisateur et vérifier s'il est connecté via GitHub
        const userWithToken = await db.user.findUnique({
            where: { id: user.id },
            select: {
                githubToken: true,
                accounts: {
                    select: {
                        provider: true,
                        accessToken: true,
                    }
                }
            }
        });
        
        const isConnectedViaGitHub = userWithToken?.accounts?.some((account: { provider: string; }) => account.provider === 'github') || false;
        
        // Utiliser le token GitHub de l'utilisateur (priorité au token manuel, puis au token OAuth)
        const githubToken = userWithToken?.githubToken || userWithToken?.accounts?.find((acc: { provider: string; }) => acc.provider === 'github')?.accessToken;
        
        // Prepare headers for GitHub API (with optional token)
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'VibeCode-Playground'
        };
        
        if (githubToken) {
            headers['Authorization'] = `token ${githubToken}`;
            console.log('Using user GitHub token for API access');
        } else {
            console.log('No GitHub token available - using public API limits');
        }
        
        // Fetch repository information from GitHub API
        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
        console.log(`Fetching from GitHub API: ${apiUrl}`);
        console.log('Headers:', headers);
        
        const repoResponse = await fetch(apiUrl, {
            headers
        });
        
        console.log(`GitHub API Response Status: ${repoResponse.status}`);
        
        if (!repoResponse.ok) {
            const errorText = await repoResponse.text();
            console.log(`GitHub API Error Response: ${errorText}`);
            
            if (repoResponse.status === 404) {
                if (isConnectedViaGitHub) {
                    // L'utilisateur est connecté via GitHub mais n'a pas accès
                    throw new Error(`Le dépôt '${owner}/${repoName}' est introuvable ou privé. 🔐 Vérifiez :\n\n• L'URL est correcte\n• Vous avez accès à ce dépôt avec votre compte GitHub\n• Le dépôt existe et n'a pas été supprimé`);
                } else if (!githubToken) {
                    // L'utilisateur n'est pas connecté via GitHub et n'a pas de token
                    throw new Error(`Le dépôt '${owner}/${repoName}' est introuvable ou privé. 🔐 Solutions :\n\n1. **Connexion automatique** : Connectez-vous avec votre compte GitHub pour un accès direct à vos dépôts privés\n2. **Configuration manuelle** : Ajoutez votre token GitHub dans Paramètres > API Configuration`);
                } else {
                    // L'utilisateur a un token configuré manuellement
                    throw new Error(`Le dépôt '${owner}/${repoName}' est introuvable ou vous n'avez pas les permissions nécessaires. Vérifiez que l'URL est correcte et que votre token GitHub a les permissions 'repo' pour les dépôts privés.`);
                }
            }
            if (repoResponse.status === 403) {
                const errorData = JSON.parse(errorText);
                if (errorData.message && errorData.message.includes('rate limit')) {
                    if (isConnectedViaGitHub) {
                        throw new Error("Limite de l'API GitHub atteinte. 🚀 Votre connexion GitHub a des limites plus élevées, mais elles sont temporairement dépassées. Réessayez dans quelques minutes.");
                    } else if (!githubToken) {
                        throw new Error("Limite de l'API GitHub atteinte. 🚀 Solutions :\n\n1. **Connexion GitHub** : Connectez-vous avec GitHub pour des limites plus élevées\n2. **Token manuel** : Configurez votre token dans Paramètres > API Configuration");
                    } else {
                        throw new Error("Limite de l'API GitHub atteinte même avec votre token. Veuillez réessayer plus tard.");
                    }
                } else {
                    if (isConnectedViaGitHub) {
                        throw new Error(`Accès refusé au dépôt '${owner}/${repoName}'. Votre compte GitHub n'a pas les permissions nécessaires pour accéder à ce dépôt privé.`);
                    } else {
                        throw new Error(`Accès refusé au dépôt '${owner}/${repoName}'. Vérifiez que votre token GitHub a les permissions nécessaires (scopes 'repo' ou 'public_repo').`);
                    }
                }
            }
            throw new Error(`Erreur lors de la récupération du dépôt: ${repoResponse.status} ${repoResponse.statusText}`);
        }

        const repoData = await repoResponse.json();
        
        // Fetch repository contents
        const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents`, {
            headers
        });
        
        if (!contentsResponse.ok) {
            if (contentsResponse.status === 404) {
                throw new Error(`Impossible d'accéder au contenu du dépôt '${owner}/${repoName}'. Vérifiez vos permissions.`);
            }
            if (contentsResponse.status === 403) {
                throw new Error(`Accès refusé au contenu du dépôt '${owner}/${repoName}'. Votre token GitHub doit avoir les permissions 'repo' pour les dépôts privés.`);
            }
            throw new Error(`Erreur lors de la récupération du contenu: ${contentsResponse.status} ${contentsResponse.statusText}`);
        }

        const contents = await contentsResponse.json();
        
        // Determine template type based on package.json or file structure
        let template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR" = "REACT";
        
        // Check for package.json to determine project type
        const packageJsonFile = contents.find((file: { name: string }) => file.name === "package.json");
        if (packageJsonFile) {
            const packageResponse = await fetch(packageJsonFile.download_url);
            if (packageResponse.ok) {
                const packageJson = await packageResponse.json();
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                if (dependencies.next) template = "NEXTJS";
                else if (dependencies.vue) template = "VUE";
                else if (dependencies["@angular/core"]) template = "ANGULAR";
                else if (dependencies.express) template = "EXPRESS";
                else if (dependencies.hono) template = "HONO";
            }
        }

        // Create playground in database
        const playground = await db.playground.create({
            data: {
                title: repoData.name,
                description: repoData.description || `Imported from ${repoUrl}`,
                template: template,
                userId: user.id!,
            },
        });

        // Recursively fetch all files from the repository
        const fetchDirectoryContents = async (path: string = ""): Promise<(TemplateFile | TemplateFolder)[]> => {
            const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                console.warn(`Failed to fetch contents for path: ${path}`);
                return [];
            }
            
            const items = await response.json();
            const result: (TemplateFile | TemplateFolder)[] = [];
            
            for (const item of items) {
                if (item.type === "file") {
                    // Fetch file content
                    let content = "";
                    if (item.download_url) {
                        try {
                            const fileResponse = await fetch(item.download_url);
                            if (fileResponse.ok) {
                                content = await fileResponse.text();
                            }
                        } catch {
                            console.warn(`Failed to fetch content for file: ${item.name}`);
                        }
                    }
                    
                    // Extract filename and extension
                    const lastDotIndex = item.name.lastIndexOf('.');
                    const filename = lastDotIndex > 0 ? item.name.substring(0, lastDotIndex) : item.name;
                    const fileExtension = lastDotIndex > 0 ? item.name.substring(lastDotIndex + 1) : "";
                    
                    result.push({
                        filename,
                        fileExtension,
                        content
                    });
                } else if (item.type === "dir") {
                    // Recursively fetch directory contents
                    const subItems = await fetchDirectoryContents(item.path);
                    result.push({
                        folderName: item.name,
                        items: subItems
                    });
                }
            }
            
            return result;
        };
        
        console.log('Fetching repository structure...');
        const repositoryItems = await fetchDirectoryContents();
        
        const fullStructure: TemplateFolder = {
            folderName: repoData.name,
            items: repositoryItems
        };

        // Save the complete template files structure
        await db.templateFile.create({
            data: {
                playgroundId: playground.id,
                content: JSON.stringify(fullStructure),
            },
        });
        
        console.log(`Successfully imported ${repositoryItems.length} items from repository`);

        revalidatePath("/dashboard");
        return playground;
    } catch (err) {
        console.error("Error importing GitHub repository:", err);
        throw err;
    }
};
