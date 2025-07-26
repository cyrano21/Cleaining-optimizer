const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixDatabaseCorruption() {
  console.log('🚀 Démarrage de la correction de la base de données...');
  console.log('📍 URI MongoDB:', process.env.MONGODB_URI ? 'Configuré' : 'Non configuré');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI non configuré dans .env');
    return;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connexion à MongoDB établie');
    
    const db = client.db();
    
    // Vérifier les collections avec des ObjectId corrompus
    const collections = ['stores', 'products', 'users'];
    
    for (const collectionName of collections) {
      console.log(`\n🔍 Vérification de la collection: ${collectionName}`);
      const collection = db.collection(collectionName);
      
      // Trouver les documents avec des vendor/store invalides
      const documents = await collection.find({}).toArray();
      
      for (const doc of documents) {
        let needsUpdate = false;
        const updateFields = {};
        
        // Vérifier le champ vendor
        if (doc.vendor && typeof doc.vendor === 'string' && doc.vendor.length !== 24) {
          console.log(`❌ Vendor invalide trouvé: ${doc.vendor} dans ${doc._id}`);
          // Essayer de trouver un vendeur valide ou mettre null
          const validVendor = await db.collection('users').findOne({ role: { $in: ['vendor', 'admin'] } });
          if (validVendor) {
            updateFields.vendor = validVendor._id;
            needsUpdate = true;
            console.log(`✅ Correction: ${doc.vendor} -> ${validVendor._id}`);
          }
        }
        
        // Vérifier le champ store
        if (doc.store && typeof doc.store === 'string' && doc.store.length !== 24) {
          console.log(`❌ Store invalide trouvé: ${doc.store} dans ${doc._id}`);
          // Essayer de trouver un store valide ou mettre null
          const validStore = await db.collection('stores').findOne({});
          if (validStore) {
            updateFields.store = validStore._id;
            needsUpdate = true;
            console.log(`✅ Correction: ${doc.store} -> ${validStore._id}`);
          }
        }
        
        // Vérifier le champ owner dans les stores
        if (collectionName === 'stores' && doc.owner && typeof doc.owner === 'string' && doc.owner.length !== 24) {
          console.log(`❌ Owner invalide trouvé: ${doc.owner} dans store ${doc._id}`);
          const validOwner = await db.collection('users').findOne({ role: { $in: ['vendor', 'admin'] } });
          if (validOwner) {
            updateFields.owner = validOwner._id;
            needsUpdate = true;
            console.log(`✅ Correction owner: ${doc.owner} -> ${validOwner._id}`);
          }
        }
        
        // Vérifier tous les champs qui pourraient contenir "TechVision Corp"
        for (const [key, value] of Object.entries(doc)) {
          if (value === "TechVision Corp" && key !== '_id') {
            console.log(`❌ "TechVision Corp" trouvé dans ${key} du document ${doc._id}`);
            // Si c'est un champ qui devrait être un ObjectId d'utilisateur
            if (['vendor', 'owner', 'createdBy', 'updatedBy'].includes(key)) {
              const validUser = await db.collection('users').findOne({ role: { $in: ['vendor', 'admin'] } });
              if (validUser) {
                updateFields[key] = validUser._id;
                needsUpdate = true;
                console.log(`✅ Correction ${key}: TechVision Corp -> ${validUser._id}`);
              }
            } else {
              // Pour d'autres champs, essayer de mettre une valeur par défaut ou null
              updateFields[key] = null;
              needsUpdate = true;
              console.log(`✅ ${key} mis à null`);
            }
          }
        }
        
        // Appliquer les corrections
        if (needsUpdate) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: updateFields }
          );
          console.log(`📝 Document ${doc._id} mis à jour`);
        }
      }
    }
    
    console.log('\n✅ Correction de la base de données terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await client.close();
  }
}

// Exécuter la correction
fixDatabaseCorruption();