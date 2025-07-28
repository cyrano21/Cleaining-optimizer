// Script de test pour vérifier le token GitHub
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGitHubToken() {
  try {
    // Récupérer tous les utilisateurs avec leur token GitHub
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        githubToken: true,
        accounts: {
          select: {
            provider: true,
            accessToken: true
          }
        }
      }
    });

    console.log('Utilisateurs trouvés:', users.length);
    
    users.forEach(user => {
      console.log(`\n--- Utilisateur: ${user.name || user.email} ---`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Token GitHub dans user.githubToken: ${user.githubToken ? 'Présent' : 'Absent'}`);
      
      if (user.accounts && user.accounts.length > 0) {
        console.log('Comptes liés:');
        user.accounts.forEach(account => {
          console.log(`  - ${account.provider}: ${account.accessToken ? 'Token présent' : 'Token absent'}`);
        });
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGitHubToken();
