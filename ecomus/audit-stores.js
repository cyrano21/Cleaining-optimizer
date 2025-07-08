const { MongoClient } = require('mongodb');
require('dotenv').config();

async function auditStores() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';
    console.log('🔌 Connexion à MongoDB:', uri);
    
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connexion MongoDB établie');
        
        const db = client.db();
        
        // 1. Vérifier les collections
        const collections = await db.listCollections().toArray();
        console.log('\n📦 Collections disponibles:');
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        // 2. Compter les stores
        const storesCount = await db.collection('stores').countDocuments();
        console.log(`\n🏪 Nombre total de stores: ${storesCount}`);
        
        // 3. Vérifier les stores avec homeTemplate
        const storesWithTemplate = await db.collection('stores').find({
            homeTemplate: { $exists: true }
        }).toArray();
        
        console.log(`\n🎨 Stores avec template: ${storesWithTemplate.length}`);
        
        // 4. Lister les templates utilisés
        const templates = [...new Set(storesWithTemplate.map(s => s.homeTemplate))];
        console.log('\n📋 Templates en usage:');
        templates.forEach(template => {
            const count = storesWithTemplate.filter(s => s.homeTemplate === template).length;
            console.log(`  - ${template}: ${count} stores`);
        });
        
        // 5. Exemple de store
        const sampleStore = await db.collection('stores').findOne();
        console.log('\n🔍 Structure d\'un store exemple:');
        console.log(JSON.stringify(sampleStore, null, 2));
        
        // 6. Vérifier les produits
        const productsCount = await db.collection('products').countDocuments();
        console.log(`\n📦 Nombre de produits: ${productsCount}`);
        
        // 7. Vérifier les utilisateurs/vendeurs
        const usersCount = await db.collection('users').countDocuments();
        console.log(`\n👥 Nombre d'utilisateurs: ${usersCount}`);
        
    } catch (error) {
        console.error('❌ Erreur MongoDB:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Connexion fermée');
    }
}

// Exécuter l'audit
auditStores();
