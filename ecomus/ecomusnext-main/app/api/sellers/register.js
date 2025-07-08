import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '../../../utils/dbConnect';
import Seller from '../../../models/Seller';
import User from '../../../models/User';
import Notification from '../../../models/Notification';
import { getSession } from 'next-auth/react';

// Désactiver le parsing du body par Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sellers');

// Fonction pour s'assurer que le dossier de téléchargement existe
const ensureUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Fonction pour notifier les administrateurs
const notifyAdmins = async (seller) => {
  try {
    // Récupérer tous les administrateurs
    const admins = await User.find({ role: 'admin' });
    
    if (!admins || admins.length === 0) {
      console.log('Aucun administrateur trouvé pour les notifications');
      return;
    }
    
    // Créer une notification pour chaque administrateur
    const notifications = admins.map(admin => ({
      type: 'seller_request',
      title: 'Nouvelle demande de vendeur',
      message: `${seller.businessName} a soumis une demande pour devenir vendeur.`,
      recipientId: admin._id,
      relatedId: seller._id,
      onModel: 'Seller',
      actionUrl: '/admin/seller-management',
      read: false
    }));
    
    // Insérer toutes les notifications
    await Notification.insertMany(notifications);
    console.log(`${notifications.length} notifications créées pour les administrateurs`);
  } catch (error) {
    console.error('Erreur lors de la création des notifications:', error);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier que l'utilisateur est connecté
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ success: false, message: 'Vous devez être connecté pour soumettre une demande' });
    }

    const userId = session.user.id;

    // Connecter à la base de données
    await dbConnect();

    // Vérifier si l'utilisateur a déjà soumis une demande
    const existingSeller = await Seller.findOne({ user: userId });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà soumis une demande de vendeur',
        status: existingSeller.status
      });
    }

    // Créer le dossier d'upload si nécessaire
    ensureUploadDir();

    // Parser le formulaire multipart
    const form = new IncomingForm({ 
      multiples: true,
      uploadDir: uploadDir,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erreur lors du parsing du formulaire:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors du traitement du formulaire' });
      }

      try {
        // Traiter les documents
        const verificationDocuments = [];
        let logo = '';
        
        // Traiter le logo s'il existe
        if (files.logo) {
          const file = files.logo;
          const fileName = `${userId}-logo-${uuidv4()}${path.extname(file.originalFilename)}`;
          const newPath = path.join(uploadDir, fileName);
          
          // Renommer le fichier
          fs.renameSync(file.filepath, newPath);
          
          // Ajouter l'URL du fichier
          logo = `/uploads/sellers/${fileName}`;
        }
        
        // Traiter les documents de vérification
        if (files.documents) {
          // Si un seul fichier a été téléchargé
          const documents = Array.isArray(files.documents) ? files.documents : [files.documents];
          
          for (const file of documents) {
            const fileName = `${userId}-doc-${uuidv4()}${path.extname(file.originalFilename)}`;
            const newPath = path.join(uploadDir, fileName);
            
            // Renommer le fichier
            fs.renameSync(file.filepath, newPath);
            
            // Ajouter l'URL du fichier à la liste
            verificationDocuments.push(`/uploads/sellers/${fileName}`);
          }
        }

        // Préparer les données de l'adresse
        const address = {
          street: fields.street || '',
          city: fields.city || '',
          postalCode: fields.postalCode || '',
          country: fields.country || ''
        };

        // Préparer les données bancaires
        const bankInfo = {
          accountHolder: fields.accountHolder || '',
          bankName: fields.bankName || '',
          iban: fields.iban || '',
          swift: fields.swift || ''
        };

        // Créer l'objet seller
        const newSeller = new Seller({
          user: userId,
          businessName: fields.businessName,
          businessDescription: fields.businessDescription,
          logo: logo,
          contactEmail: fields.contactEmail,
          contactPhone: fields.contactPhone,
          website: fields.website || '',
          taxId: fields.taxId || '',
          address: address,
          bankInfo: bankInfo,
          verificationDocuments: verificationDocuments,
          status: 'pending',
          createdAt: new Date()
        });

        await newSeller.save();

        // Mettre à jour le rôle de l'utilisateur
        await User.findByIdAndUpdate(userId, {
          $set: { sellerStatus: 'pending' }
        });

        // Notifier les administrateurs de la nouvelle demande
        await notifyAdmins(newSeller);

        return res.status(201).json({
          success: true,
          message: 'Demande de vendeur soumise avec succès',
          sellerId: newSeller._id
        });
      } catch (error) {
        console.error('Erreur lors de la création du vendeur:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
      }
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}