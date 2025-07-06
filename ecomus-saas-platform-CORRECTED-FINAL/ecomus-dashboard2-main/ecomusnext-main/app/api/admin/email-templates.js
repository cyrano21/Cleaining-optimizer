// pages/api/admin/email-templates.js
import dbConnect from "../../../utils/dbConnect";
import EmailTemplate from "../../../models/EmailTemplate";
import { isAuthenticated, isAdmin } from "../../../middleware/auth";

export default isAuthenticated(isAdmin(async function handler(req, res) {
  try {
    // Connexion à la base de données
    await dbConnect();

    // Traitement selon la méthode HTTP
    switch (req.method) {
      case 'GET':
        return await getEmailTemplates(req, res, req.user);
      case 'POST':
        return await createEmailTemplate(req, res, req.user);
      default:
        return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error("Erreur dans l'API des modèles d'emails:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors du traitement de la requête"
    });
  }
}));

/**
 * Récupère tous les modèles d'emails
 */
async function getEmailTemplates(req, res, user) {
  try {
    const templates = await EmailTemplate.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des modèles d'emails:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des modèles d'emails"
    });
  }
}

/**
 * Crée un nouveau modèle d'email
 */
async function createEmailTemplate(req, res, user) {
  try {
    const { name, subject, content } = req.body;

    // Vérification des paramètres requis
    if (!name || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Nom, sujet et contenu du modèle requis'
      });
    }

    // Création du modèle
    const template = new EmailTemplate({
      name,
      subject,
      content,
      createdBy: user._id,
      createdAt: new Date()
    });

    await template.save();

    return res.status(201).json({
      success: true,
      message: 'Modèle d\'email créé avec succès',
      template
    });
  } catch (error) {
    console.error("Erreur lors de la création du modèle d'email:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création du modèle d'email"
    });
  }
}