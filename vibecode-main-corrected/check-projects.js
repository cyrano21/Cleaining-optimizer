const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProjects() {
  try {
    console.log('🔍 Vérification des projets dans la base de données...');
    
    const projects = await prisma.playground.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        template: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Nombre total de projets: ${projects.length}`);
    console.log('\n📋 Liste des projets:');
    console.log('=' .repeat(80));
    
    if (projects.length === 0) {
      console.log('❌ Aucun projet trouvé dans la base de données.');
    } else {
      projects.forEach((project, index) => {
        console.log(`\n${index + 1}. 📁 ${project.title}`);
        console.log(`   ID: ${project.id}`);
        console.log(`   Description: ${project.description || 'Aucune description'}`);
        console.log(`   Template: ${project.template}`);
        console.log(`   Créé le: ${project.createdAt.toLocaleDateString('fr-FR')}`);
        console.log(`   Utilisateur: ${project.user?.name || 'Inconnu'} (${project.user?.email || 'N/A'})`);
        
        // Recherche spécifique pour Orchids_ama
        if (project.title.toLowerCase().includes('orchid')) {
          console.log('   🌺 PROJET CONTENANT "ORCHID" TROUVÉ!');
        }
      });
    }
    
    // Recherche spécifique pour Orchids_ama
    const orchidProjects = projects.filter(p => 
      p.title.toLowerCase().includes('orchid') || 
      p.title.toLowerCase().includes('ama')
    );
    
    if (orchidProjects.length > 0) {
      console.log('\n🌺 PROJETS LIÉS À ORCHIDS/AMA:');
      console.log('=' .repeat(50));
      orchidProjects.forEach(project => {
        console.log(`- ${project.title} (ID: ${project.id})`);
      });
    } else {
      console.log('\n❌ Aucun projet contenant "orchid" ou "ama" trouvé.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjects();