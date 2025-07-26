import connectDB from 'config/db';
import User from '@/models/User'; 
import { deleteImage } from 'config/cloudinary';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID utilsateur manquant" });
  }

  try {
    // Connexion à MongoDB
    const conn = await connectDB();

    if (!conn) {
      return res
        .status(500)
        .json({ error: "Erreur de connexion à la base de données" });
    }

    switch (req.method) {
      case "GET": {
        // Récupérer un utilsateur spécifique
        const user = await User.findById(id).select("-password");
        if (!user) {
          return res.status(404).json({ error: "utilsateur non trouvé" });
        }
        return res.status(200).json(user);
      }

      case "PUT": {
        // Mettre à jour un utilsateur
        const userData = req.body;

        // Si le mot de passe est fourni, le hacher
        if (userData.password) {
          const salt = await bcrypt.genSalt(10);
          userData.password = await bcrypt.hash(userData.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(id, userData, {
          new: true,
          runValidators: true,
        }).select("-password");

        if (!updatedUser) {
          return res.status(404).json({ error: "utilsateur non trouvé" });
        }

        return res.status(200).json(updatedUser);
      }

      case "DELETE": {
        // Supprimer un utilsateur
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
          return res.status(404).json({ error: "utilsateur non trouvé" });
        }

        // Si l'utilsateur a une image de profil sur Cloudinary, la supprimer
        if (userToDelete.cloudinaryId) {
          try {
            await deleteImage(userToDelete.cloudinaryId);
          } catch (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
            // Continuer malgré l'erreur de suppression d'image
          }
        }

        await User.findByIdAndDelete(id);
        return res
          .status(200)
          .json({ message: "utilsateur supprimé avec succès" });
      }

      default:
        return res.status(405).json({ error: "Méthode non autorisée" });
    }
  } catch (error) {
    console.error("Erreur API utilsateur:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
