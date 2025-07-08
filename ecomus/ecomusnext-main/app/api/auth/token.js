import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import jwt from "jsonwebtoken";
import dbConnect from "../../../utils/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

/**
 * API pour générer et récupérer un token JWT à partir d'une session NextAuth ou d'identifiants
 */
export default async function handler(req, res) {
  // Pour obtenir un token à partir de la session
  if (req.method === "GET") {
    try {
      // Récupérer la session NextAuth
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      // Générer un token JWT avec les informations de l'utilisateur
      const token = jwt.sign(
        {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role || "user",
        },
        process.env.JWT_SECRET ||
          process.env.NEXTAUTH_SECRET ||
          "your-secret-key",
        { expiresIn: "24h" }
      );

      return res.status(200).json({ token });
    } catch (error) {
      console.error("Erreur de génération du token:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  // Pour obtenir un token avec email/mot de passe
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }

      await dbConnect();

      // Trouver l'utilisateur par email
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      // Générer un token JWT
      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          role: user.role || "user",
        },
        process.env.JWT_SECRET ||
          process.env.NEXTAUTH_SECRET ||
          "your-secret-key",
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Erreur de génération du token:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
