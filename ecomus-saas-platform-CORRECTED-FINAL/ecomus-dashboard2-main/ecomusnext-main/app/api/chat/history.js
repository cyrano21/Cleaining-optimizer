import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../utils/dbConnect";
import Conversation from "../../../models/Conversation";

export default async function handler(req, res) {
  console.log("[API Chat History] Requête reçue:", req.method, req.url);
  console.log("[API Chat History] Tentative de récupération de la session...");

  // Tenter de récupérer la session avec getServerSession
  const session = await getServerSession(req, res, authOptions);
  console.log("[API Chat History] Session récupérée:", !!session);

  // En développement, permettre l'accès même sans session
  const isDev = process.env.NODE_ENV === "development";
  const userId = session?.user?.id || (isDev ? "dev-user-id" : null);

  // Vérifier si l'utilisateur est connecté (sauf en développement)
  if (!userId) {
    console.log(
      "[API Chat History] Accès refusé - Utilisateur non authentifié"
    );
    return res.status(401).json({ message: "Non autorisé" });
  }

  console.log("[API Chat History] Utilisateur authentifié:", userId);

  // Récupérer l'ID de session du chat
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ message: "ID de session requis" });
  }

  // En développement, renvoyer des données par défaut si nécessaire
  if (isDev && userId === "dev-user-id") {
    console.log(
      "[API Chat History] Mode développement: renvoyer des données fictives"
    );
    return res.status(200).json({
      conversation: {
        messages: [
          {
            sender: "bot",
            content: "Bonjour! Comment puis-je vous aider aujourd'hui?",
            timestamp: new Date(),
          },
          {
            sender: "user",
            content: "J'ai une question sur votre site.",
            timestamp: new Date(),
          },
          {
            sender: "bot",
            content: "Je serais ravi de vous aider. Quelle est votre question?",
            timestamp: new Date(),
          },
        ],
      },
    });
  }

  try {
    await dbConnect();
    console.log(
      "[API Chat History] Connexion à la BD réussie, recherche de conversation pour:",
      userId,
      sessionId
    );

    // Récupérer la conversation active pour cet utilisateur et cette session
    const conversation = await Conversation.findOne({
      userId: userId, // Utiliser la variable userId qui gère le cas du développement
      sessionId,
      active: true,
    });

    console.log("[API Chat History] Conversation trouvée:", !!conversation);

    if (!conversation) {
      return res.status(200).json({
        message: "Aucune conversation trouvée",
        conversation: null,
      });
    }

    return res.status(200).json({ conversation });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des conversations:",
      error
    );
    return res.status(500).json({
      message:
        "Une erreur est survenue lors de la récupération de l'historique des conversations",
      error: error.message,
    });
  }
}
