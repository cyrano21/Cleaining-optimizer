// Script pour lister toutes les boutiques via l'API
async function listAllStores() {
  try {
    console.log('🔍 Récupération de toutes les boutiques...\n');
    
    const response = await fetch('http://localhost:3000/api/stores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`📊 ${result.data.length} boutique(s) trouvée(s):\n`);
      
      result.data.forEach((store, index) => {
        console.log(`${index + 1}. ${store.name}`);
        console.log(`   📍 ID: ${store.id}`);
        console.log(`   🏪 Propriétaire: ${store.ownerDetails?.name || 'N/A'} (${store.ownerDetails?.email || 'N/A'})`);
        console.log(`   📊 Statut: ${store.status || 'N/A'}`);
        console.log(`   ✅ Actif: ${store.isActive ? 'Oui' : 'Non'}`);
        console.log(`   ⭐ Vérifié: ${store.isVerified ? 'Oui' : 'Non'}`);
        console.log(`   📅 Créé le: ${new Date(store.createdAt).toLocaleDateString('fr-FR')}`);
        console.log('');
      });

      // Trouver la boutique Ecomus
      const ecomusStore = result.data.find(store => 
        store.name.toLowerCase().includes('ecomus')
      );

      if (ecomusStore) {
        console.log('🎯 Boutique Ecomus trouvée:');
        console.log(`   Nom: ${ecomusStore.name}`);
        console.log(`   Statut: ${ecomusStore.status}`);
        console.log(`   Actif: ${ecomusStore.isActive ? 'Oui' : 'Non'}`);
        
        if (!ecomusStore.isActive) {
          console.log('\n⚠️  La boutique Ecomus n\'est pas active!');
          console.log('💡 Vous pouvez l\'activer via l\'interface admin ou en utilisant l\'API.');
        } else {
          console.log('\n✅ La boutique Ecomus est active!');
        }
      } else {
        console.log('❌ Aucune boutique Ecomus trouvée.');
      }

    } else {
      console.log('❌ Erreur lors de la récupération des boutiques:', result.error || 'Réponse inattendue');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Assurez-vous que le serveur de développement est en cours d\'exécution (npm run dev)');
  }
}

// Exécuter le script
listAllStores();
