// filepath: g:\ewebsite2\pages\api\admin\send-recommendations.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import { isAuthenticated, isAdmin } from '../../../middleware/auth';
import { sendEmail } from '../../../utils/mailer'; // Assurez-vous que cette fonction existe

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();
    console.log('[API send-recommendations] Connexion DB réussie');

    const { userId, recommendedProducts, message } = req.body;

    if (!userId || !recommendedProducts || !Array.isArray(recommendedProducts) || recommendedProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Les données de recommandation sont incomplètes'
      });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: 'L\'utilisateur n\'a pas d\'adresse email'
      });
    }

    // Construire le contenu HTML de l'email
    const productsHtml = recommendedProducts.map(product => `
      <tr>
        <td style="padding: 15px;">
          <div style="border-radius: 5px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="padding: 15px;">
              <h3 style="margin-top: 0; color: #333;">${product.name}</h3>
              <p style="color: #666;">Catégorie: ${product.category}</p>
              ${product.tags && product.tags.length > 0 ? 
                `<p style="color: #888; font-size: 0.9em;">Tags: ${product.tags.join(', ')}</p>` : ''
              }
              <p style="margin-bottom: 10px;">
                <span style="background-color: #4CAF50; color: white; padding: 3px 8px; border-radius: 20px; font-size: 0.8em;">
                  ${product.averageRating}/5 ★
                </span>
              </p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop/product/${product.slug}" 
                style="display: inline-block; background-color: #007bff; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
                Voir le produit
              </a>
            </div>
          </div>
        </td>
      </tr>
    `).join('');

    const customMessage = message || `
      <p>En fonction de vos précédents avis et achats, nous avons sélectionné ces produits qui pourraient vous plaire.</p>
      <p>Cliquez sur un produit pour le découvrir et bénéficier d'une réduction spéciale de 10% avec le code <strong>FIDELITE10</strong>.</p>
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recommandations personnalisées</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #999; }
            .cta-button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; }
            @media only screen and (max-width: 600px) {
              .container { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #4CAF50;">Recommandations spéciales pour vous</h1>
              <p style="font-size: 1.1em;">Bonjour ${user.name || 'cher client'},</p>
            </div>
            
            ${customMessage}
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
              ${productsHtml}
            </table>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="cta-button">
                Découvrir plus de produits
              </a>
            </div>
            
            <div class="footer">
              <p>Si vous ne souhaitez plus recevoir nos recommandations personnalisées, <a href="${process.env.NEXT_PUBLIC_SITE_URL}/preferences">cliquez ici</a>.</p>
              <p>&copy; ${new Date().getFullYear()} Votre Boutique. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email
    const emailResult = await sendEmail({
      to: user.email,
      subject: `${user.name || 'Cher client'}, des produits sélectionnés spécialement pour vous !`,
      html: htmlContent
    });

    if (emailResult.success) {
      // Enregistrer l'envoi dans l'historique de recommandations de l'utilisateur
      if (!user.recommendationHistory) {
        user.recommendationHistory = [];
      }
      
      user.recommendationHistory.push({
        date: new Date(),
        products: recommendedProducts.map(p => ({
          productId: p.productId,
          name: p.name,
          matchScore: p.matchScore || null
        }))
      });
      
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Recommandations envoyées avec succès',
        email: user.email
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi des recommandations',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('[API send-recommendations] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

export default isAuthenticated(isAdmin(handler));