import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// GET /api/templates - Récupérer la liste des templates disponibles
export async function GET(request) {
  try {
    const homesPath = path.join(process.cwd(), 'app', 'home')
    
    // Vérifier que le dossier existe
    if (!fs.existsSync(homesPath)) {
      return NextResponse.json({
        success: false,
        error: 'Dossier des templates non trouvé'
      }, { status: 404 })
    }

    // Lire les dossiers de templates
    const templateFolders = fs.readdirSync(homesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    // Construire les informations de chaque template
    const templates = templateFolders.map(folder => {
      const templatePath = path.join(homesPath, folder)
      let templateInfo = {
        id: folder,
        name: folder.charAt(0).toUpperCase() + folder.slice(1),
        path: folder,
        preview: `/images/homes/${folder}-preview.jpg`
      }

      // Tenter de lire un fichier de métadonnées s'il existe
      try {
        const metaPath = path.join(templatePath, 'template.json')
        if (fs.existsSync(metaPath)) {
          const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
          templateInfo = { ...templateInfo, ...metaData }
        }
      } catch (error) {
        // Ignorer les erreurs de lecture des métadonnées
      }

      return templateInfo
    })

    return NextResponse.json({
      success: true,
      data: {
        templates,
        count: templates.length
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la récupération des templates'
    }, { status: 500 })
  }
}
