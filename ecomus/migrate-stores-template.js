const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateStoresTemplate() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';
    console.log('🚀 Migration: Ajout du champ homeTemplate aux stores');
    console.log('🔌 Connexion à MongoDB:', uri);
    
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connexion MongoDB établie');
        
        const db = client.db();
        const storesCollection = db.collection('stores');
        
        // 1. Compter les stores sans homeTemplate
        const storesWithoutTemplate = await storesCollection.countDocuments({
            'settings.homeTemplate': { $exists: false }
        });
        
        console.log(`📊 Stores sans homeTemplate: ${storesWithoutTemplate}`);
        
        if (storesWithoutTemplate === 0) {
            console.log('✅ Tous les stores ont déjà un homeTemplate');
            return;
        }
        
        // 2. Récupérer la liste des templates disponibles
        const homeTemplates = [
            'home-01', 'home-02', 'home-03', 'home-04', 'home-05',
            'home-06', 'home-07', 'home-08', 'home-09', 'home-10',
            'home-11', 'home-12', 'home-13', 'home-14', 'home-15',
            'home-16', 'home-17', 'home-18', 'home-19', 'home-20',
            'home-21', 'home-22', 'home-23', 'home-24', 'home-25',
            'home-26', 'home-27', 'home-28', 'home-29', 'home-30',
            'home-31', 'home-32', 'home-33', 'home-34', 'home-35',
            'home-36', 'home-37', 'home-38', 'home-39', 'home-40',
            'home-41', 'home-42', 'home-43', 'home-44', 'home-45',
            'home-46', 'home-47', 'home-48', 'home-49'
        ];
        
        console.log(`🎨 Templates disponibles: ${homeTemplates.length}`);
        
        // 3. Mettre à jour tous les stores sans template
        let updateCount = 0;
        const stores = await storesCollection.find({
            'settings.homeTemplate': { $exists: false }
        }).toArray();
        
        for (const store of stores) {
            // Attribuer un template aléatoire ou basé sur l'index
            const templateIndex = updateCount % homeTemplates.length;
            const selectedTemplate = homeTemplates[templateIndex];
            
            // Initialiser settings si inexistant
            if (!store.settings) {
                store.settings = {};
            }
            
            // Mettre à jour le store
            await storesCollection.updateOne(
                { _id: store._id },
                { 
                    $set: { 
                        'settings.homeTemplate': selectedTemplate 
                    }
                }
            );
            
            console.log(`✅ Store "${store.name}" → ${selectedTemplate}`);
            updateCount++;
        }
        
        console.log(`\n🎉 Migration terminée: ${updateCount} stores mis à jour`);
        
        // 4. Vérification
        const updatedStores = await storesCollection.find({
            'settings.homeTemplate': { $exists: true }
        }).toArray();
        
        console.log(`\n📊 Vérification finale:`);
        console.log(`  - Stores avec homeTemplate: ${updatedStores.length}`);
        
        // Afficher quelques exemples
        console.log(`\n🔍 Exemples de stores avec templates:`);
        for (let i = 0; i < Math.min(5, updatedStores.length); i++) {
            const store = updatedStores[i];
            console.log(`  - "${store.name}" (${store.slug}) → ${store.settings.homeTemplate}`);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Connexion fermée');
    }
}

// Exécuter la migration
migrateStoresTemplate();
