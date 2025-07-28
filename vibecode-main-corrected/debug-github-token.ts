import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugGitHubToken() {
  try {
    console.log('🔍 Début du diagnostic du token GitHub...');
    
    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️ Aucun utilisateur trouvé. Connectez-vous d\'abord avec GitHub.');
      return;
    }
    
    // Récupérer les utilisateurs avec leurs tokens
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        githubToken: true,
        accounts: {
          select: {
            provider: true,
            accessToken: true,
            refreshToken: true,
            scope: true
          }
        }
      }
    });
    
    console.log('\n👥 Utilisateurs trouvés:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Token GitHub (user.githubToken): ${user.githubToken ? '✅ PRÉSENT' : '❌ ABSENT'}`);
      
      if (user.githubToken) {
        console.log(`   Token format: ${user.githubToken.substring(0, 10)}...`);
      }
      
      if (user.accounts && user.accounts.length > 0) {
        console.log('   Comptes OAuth:');
        user.accounts.forEach(account => {
          console.log(`     - ${account.provider}: ${account.accessToken ? '✅ Token OAuth' : '❌ Pas de token'}`);
          if (account.provider === 'github') {
            console.log(`       Scope: ${account.scope}`);
            console.log(`       Token format: ${account.accessToken ? account.accessToken.substring(0, 10) + '...' : 'N/A'}`);
          }
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugGitHubToken();
