// pages/api/collections/[id].js
import dbConnect from '../../../lib/dbConnect';
import Collection from '../../../models/Collection';

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  await dbConnect();
  const {
    query: { id },
    method
  } = req;

  switch (method) {
    case 'GET':
      try {
        let query = Collection.findById(id);
        
        // Ajouter les relations si demandées
        if (req.query.populate) {
          const populateFields = req.query.populate.split(',')
          populateFields.forEach(field => {
            if (['category', 'shop', 'seller'].includes(field.trim())) {
              query = query.populate(field.trim())
            }
          })
        }
        
        const collection = await query.exec();
        if (!collection) {
          return res.status(404).json({ 
            success: false, 
            error: 'Collection non trouvée' 
          });
        }
        
        res.status(200).json({
          success: true,
          data: collection
        });
      } catch (error) {
        console.error('Erreur lors de la récupération de la collection:', error);
        res.status(400).json({ 
          success: false, 
          error: error.message 
        });
      }
      break;
      
    case 'PUT':
      try {
        const {
          title,
          slug,
          description,
          subtitle,
          image,
          backgroundImage,
          category,
          shop,
          seller,
          featured,
          isActive,
          sortOrder,
          tags,
          metadata,
          seo
        } = req.body;

        // Vérifier l'unicité du slug si il est modifié
        if (slug) {
          const existingCollection = await Collection.findOne({ 
            slug, 
            _id: { $ne: id } 
          });
          if (existingCollection) {
            return res.status(400).json({
              success: false,
              error: 'Une collection avec ce slug existe déjà'
            });
          }
        }

        const collection = await Collection.findByIdAndUpdate(
          id, 
          {
            title,
            slug,
            description,
            subtitle,
            image,
            backgroundImage,
            category,
            shop,
            seller,
            featured,
            isActive,
            sortOrder,
            tags,
            metadata,
            seo,
            updatedAt: new Date()
          }, 
          { 
            new: true, 
            runValidators: true 
          }
        );
        
        if (!collection) {
          return res.status(404).json({ 
            success: false, 
            error: 'Collection non trouvée' 
          });
        }
        
        res.status(200).json({
          success: true,
          data: collection
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la collection:', error);
        res.status(400).json({ 
          success: false, 
          error: error.message 
        });
      }
      break;
      
    case 'DELETE':
      try {
        const deleted = await Collection.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ 
            success: false, 
            error: 'Collection non trouvée' 
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Collection supprimée avec succès'
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de la collection:', error);
        res.status(400).json({ 
          success: false, 
          error: error.message 
        });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: `Méthode ${method} non autorisée`
      });
  }
}