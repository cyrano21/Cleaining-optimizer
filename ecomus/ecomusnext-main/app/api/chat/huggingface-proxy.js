import { getSession } from "next-auth/react";
import dbConnect from "../../../utils/dbConnect";
import Conversation from "../../../models/Conversation";
import User from "../../../models/User";

// Prompts spécifiques à l'e-commerce pour différents contextes
const ECOMMERCE_CONTEXTS = {
  PRODUCT_INQUIRY:
    "Tu es un assistant de magasin en ligne spécialisé dans les produits de notre catalogue. Ton but est d'aider les clients à trouver les produits qui répondent à leurs besoins, expliquer les caractéristiques, et suggérer des alternatives si nécessaire. Réponds de manière concise et précise.",

  ORDER_SUPPORT:
    "Tu es un conseiller du service client spécialisé dans le suivi des commandes. Tu peux aider avec les questions sur les délais de livraison, le statut des commandes, et les politiques de retour. Sois rassurant et informatif.",

  GENERAL_INQUIRY:
    "Tu es un assistant virtuel pour notre boutique en ligne. Ton rôle est d'aider les visiteurs avec toutes leurs questions sur nos produits, le processus d'achat, les méthodes de paiement, et notre politique de confidentialité. Réponds de façon amicale et professionnelle.",

  TECHNICAL_SUPPORT:
    "Tu es un spécialiste du support technique pour notre site e-commerce. Tu aides les clients avec des problèmes techniques comme la navigation sur le site, les problèmes de compte, et les difficultés lors du paiement. Sois patient et propose des solutions étape par étape.",
};

// Suggestions de réponses rapides pour des scénarios courants
const QUICK_RESPONSES = {
  GREETING:
    "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui avec votre shopping ?",
  THANKS:
    "Je vous en prie ! Y a-t-il autre chose que je puisse faire pour vous aider avec vos achats ?",
  GOODBYE:
    "Merci de nous avoir contactés ! N'hésitez pas à revenir si vous avez d'autres questions. Bonne journée !",
  SHIPPING:
    "Notre délai de livraison standard est de 3 à 5 jours ouvrables. Pour les commandes express, comptez 24 à 48 heures. Souhaitez-vous en savoir plus sur nos options de livraison ?",
  RETURNS:
    "Notre politique de retour vous permet de renvoyer les articles dans les 30 jours suivant la réception. Les articles doivent être non utilisés et dans leur emballage d'origine. Avez-vous besoin d'aide pour initier un retour ?",
  PAYMENT:
    "Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), PayPal, et les virements bancaires. Toutes nos transactions sont sécurisées. Quelle méthode de paiement préférez-vous utiliser ?",
  SIZE_GUIDE:
    "Vous pouvez trouver notre guide des tailles sur la page produit. Cliquez sur 'Guide des tailles' sous les options de taille. Souhaitez-vous que je vous aide à trouver la bonne taille pour un article spécifique ?",
  DISCOUNT:
    "Nous proposons régulièrement des réductions. Inscrivez-vous à notre newsletter pour être informé des promotions à venir. Vous pouvez également consulter notre page 'Offres spéciales'.",
  UNAVAILABLE:
    "Je suis désolé de vous informer que cet article est actuellement en rupture de stock. Souhaitez-vous être notifié lorsqu'il sera de nouveau disponible, ou préférez-vous que je vous suggère des alternatives similaires ?",
};

// Détecte le contexte de la conversation basé sur les mots-clés
function detectContext(userMessage, conversationHistory) {
  const lowerMessage = userMessage.toLowerCase();

  // Analyse des mots-clés pour déterminer le contexte
  if (
    lowerMessage.includes("produit") ||
    lowerMessage.includes("article") ||
    lowerMessage.includes("acheter") ||
    lowerMessage.includes("prix") ||
    lowerMessage.includes("disponible") ||
    lowerMessage.includes("stock")
  ) {
    return "PRODUCT_INQUIRY";
  }

  if (
    lowerMessage.includes("commande") ||
    lowerMessage.includes("livraison") ||
    lowerMessage.includes("retour") ||
    lowerMessage.includes("remboursement") ||
    lowerMessage.includes("colis") ||
    lowerMessage.includes("expédition")
  ) {
    return "ORDER_SUPPORT";
  }

  if (
    lowerMessage.includes("connexion") ||
    lowerMessage.includes("compte") ||
    lowerMessage.includes("mot de passe") ||
    lowerMessage.includes("paiement") ||
    lowerMessage.includes("erreur") ||
    lowerMessage.includes("problème")
  ) {
    return "TECHNICAL_SUPPORT";
  }

  return "GENERAL_INQUIRY"; // Contexte par défaut
}

// Vérifie si une réponse rapide est appropriée
function getQuickResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.match(/^(bonjour|salut|hello|hi|hey)/i)) {
    return QUICK_RESPONSES.GREETING;
  }

  if (lowerMessage.match(/merci|thanks|thank you/i)) {
    return QUICK_RESPONSES.THANKS;
  }

  if (lowerMessage.match(/au revoir|bye|à bientôt|a plus/i)) {
    return QUICK_RESPONSES.GOODBYE;
  }

  if (
    lowerMessage.includes("livraison") &&
    (lowerMessage.includes("temps") || lowerMessage.includes("délai"))
  ) {
    return QUICK_RESPONSES.SHIPPING;
  }

  if (lowerMessage.match(/retour|rembourse|échange/i)) {
    return QUICK_RESPONSES.RETURNS;
  }

  if (lowerMessage.match(/paiement|payer|carte|paypal/i)) {
    return QUICK_RESPONSES.PAYMENT;
  }

  if (
    lowerMessage.match(/taille|mesure|guide/i) &&
    !lowerMessage.includes("entreprise")
  ) {
    return QUICK_RESPONSES.SIZE_GUIDE;
  }

  if (lowerMessage.match(/promo|reduction|rabais|solde|discount/i)) {
    return QUICK_RESPONSES.DISCOUNT;
  }

  if (
    lowerMessage.includes("disponible") &&
    (lowerMessage.includes("pas") || lowerMessage.includes("plus"))
  ) {
    return QUICK_RESPONSES.UNAVAILABLE;
  }

  return null; // Aucune réponse rapide appropriée
}

// Fonction pour adapter la réponse au contexte e-commerce
function adaptResponseToEcommerce(response, userInput) {
  console.log("[DEBUG] adaptResponseToEcommerce - Réponse reçue:", response);
  console.log("[DEBUG] adaptResponseToEcommerce - Input utilisateur:", userInput);
  
  // Si la réponse est vide ou undefined, utiliser le fallback
  if (!response || response.trim() === "") {
    console.log("[DEBUG] Réponse vide, utilisation du fallback");
    return getFallbackResponse(userInput);
  }

  // Vérifier si la réponse contient des éléments inappropriés
  const inappropriatePatterns = [
    "I don't know",
    "I can't help", 
    "I am an AI",
    "not sure",
    "I cannot",
    "I'm not able",
    "I don't have"
  ];

  const hasInappropriateContent = inappropriatePatterns.some(pattern => 
    response.toLowerCase().includes(pattern.toLowerCase())
  );

  if (hasInappropriateContent) {
    console.log("[DEBUG] Contenu inapproprié détecté, utilisation du fallback");
    return getFallbackResponse(userInput);
  }

  // Si la réponse semble valide, l'utiliser directement
  console.log("[DEBUG] Réponse valide, utilisation de la réponse Hugging Face");
  return response;
}

// Formatage des messages pour l'historique utilisé avec Hugging Face
function formatMessagesForHuggingFace(messages) {
  const formattedHistory = {
    past_user_inputs: [],
    generated_responses: [],
  };

  let lastUserMsg = "";

  // Extraire et formatter les messages pour l'API Hugging Face
  for (const msg of messages) {
    if (msg.sender === "user") {
      formattedHistory.past_user_inputs.push(msg.content);
      lastUserMsg = msg.content;
    } else {
      formattedHistory.generated_responses.push(msg.content);
    }
  }

  return {
    formattedHistory,
    lastUserMsg,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userMessage, conversationHistory = [], sessionId } = req.body;

    if (!userMessage) {
      return res.status(400).json({ message: "User message is required" });
    }

    // Désactiver les réponses rapides pour forcer l'utilisation de l'IA
    // const quickResponse = getQuickResponse(userMessage);
    // if (quickResponse) {
    //   // Sauvegarder la conversation si l'utilisateur est connecté
    //   const session = await getSession({ req });
    //   if (session?.user?.id) {
    //     await saveConversation(session.user.id, sessionId, userMessage, quickResponse, req);
    //   }
    //
    //   return res.status(200).json({ response: quickResponse });
    // }

    // Détecter le contexte de la conversation
    const context = detectContext(userMessage, conversationHistory);
    const promptContext = ECOMMERCE_CONTEXTS[context];

    // Formater l'historique pour l'API Hugging Face
    const { formattedHistory, lastUserMsg } =
      formatMessagesForHuggingFace(conversationHistory);

    // Appel à l'API Hugging Face
    console.log("[DEBUG] Début de l'appel à Hugging Face API");
    let huggingFaceResponse;
    let apiError = null;
    try {
      console.log("[DEBUG] Appel de callHuggingFaceAPI avec:", {
        promptContext: promptContext?.substring(0, 50),
        userMessage,
      });
      huggingFaceResponse = await callHuggingFaceAPI(
        promptContext,
        formattedHistory,
        userMessage
      );
      console.log(
        "[DEBUG] Réponse de Hugging Face reçue (type):",
        typeof huggingFaceResponse
      );
      console.log(
        "[DEBUG] Réponse de Hugging Face reçue (contenu):",
        huggingFaceResponse
      );
    } catch (error) {
      console.error("[ERROR] Erreur lors de l'appel Hugging Face:", error);
      apiError = error.message;
      huggingFaceResponse = getFallbackResponse(userMessage, promptContext);
      console.log("[DEBUG] Utilisation du fallback:", huggingFaceResponse);
    }

    // Adapter la réponse au contexte e-commerce
    const adaptedResponse = adaptResponseToEcommerce(
      huggingFaceResponse,
      userMessage
    );
    console.log("[DEBUG] Réponse adaptée finale:", adaptedResponse);

    // Sauvegarder la conversation si l'utilisateur est connecté
    const session = await getSession({ req });
    if (session?.user?.id) {
      await saveConversation(
        session.user.id,
        sessionId,
        userMessage,
        adaptedResponse,
        req
      );
    }

    console.log(
      "[DEBUG] Envoi de la réponse finale au client:",
      adaptedResponse
    );

    // Logs de diagnostic temporaires
    const diagnosticLogs = {
      apiKeyExists: !!process.env.HUGGINGFACE_API_KEY,
      apiKeyLength: process.env.HUGGINGFACE_API_KEY?.length,
      apiKeyPrefix: process.env.HUGGINGFACE_API_KEY?.substring(0, 5),
      huggingFaceResponse: huggingFaceResponse,
      adaptedResponse: adaptedResponse,
      userMessage: userMessage,
      apiError: apiError,
    };

    return res.status(200).json({
      response: adaptedResponse,
      debug: {
        huggingFaceUsed:
          huggingFaceResponse !==
          getFallbackResponse(userMessage, promptContext),
        originalResponse: huggingFaceResponse,
        diagnostics: diagnosticLogs,
      },
    });
  } catch (error) {
    console.error("Error in Hugging Face proxy:", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du traitement de votre message",
      error: error.message,
    });
  }
}

// Appel à l'API Hugging Face
async function callHuggingFaceAPI(
  promptContext,
  formattedHistory,
  userMessage
) {
  const debugInfo = { steps: [] };
  try {
    debugInfo.steps.push("Début de callHuggingFaceAPI");
    // Utilisation du modèle français de Hugging Face plus adapté
    const apiUrl =
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

    // Vérifier si une clé API est configurée
    debugInfo.steps.push("Vérification clé API");
    console.log("[DEBUG] Vérification de la clé API Hugging Face:", {
      exists: !!process.env.HUGGINGFACE_API_KEY,
      length: process.env.HUGGINGFACE_API_KEY?.length,
      prefix: process.env.HUGGINGFACE_API_KEY?.substring(0, 5),
    });

    if (
      !process.env.HUGGINGFACE_API_KEY ||
      process.env.HUGGINGFACE_API_KEY === "hf_api_key_here"
    ) {
      debugInfo.steps.push("Clé API manquante - fallback");
      console.log(
        "[DEBUG] Aucune clé API Hugging Face configurée, utilisation du mode de secours"
      );
      return {
        response: getFallbackResponse(userMessage, promptContext),
        debugInfo,
      };
    }

    debugInfo.steps.push("Clé API OK - préparation prompt");

    // Format adapté pour Mistral
    const prompt = `<s>[INST] ${promptContext}
    
    Historique de la conversation:
    ${formattedHistory.past_user_inputs
      .map(
        (q, i) =>
          `User: ${q}\nAssistant: ${
            formattedHistory.generated_responses[i] || ""
          }`
      )
      .join("\n")}
    
    Question actuelle: ${userMessage} [/INST]</s>`;

    console.log(
      "[DEBUG] Envoi à Hugging Face avec la clé:",
      process.env.HUGGINGFACE_API_KEY.substring(0, 5) + "..."
    );
    console.log("[DEBUG] Prompt envoyé:", prompt.substring(0, 200) + "...");

    console.log("[DEBUG] Tentative d'appel à l'API Hugging Face...");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
          use_cache: true,
        },
      }),
    });

    console.log(
      "[DEBUG] Réponse reçue de Hugging Face - Status:",
      response.status,
      "OK:",
      response.ok
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[ERROR] Erreur API Hugging Face - Status:",
        response.status
      );
      console.error("[ERROR] Erreur API Hugging Face - Text:", errorText);
      console.log("[DEBUG] Utilisation du fallback à cause de l'erreur API");
      return getFallbackResponse(userMessage, promptContext);
    }

    const data = await response.json();
    console.log(
      "[DEBUG] Réponse complète de Hugging Face:",
      JSON.stringify(data, null, 2)
    );
    console.log(
      "[DEBUG] Type de données reçues:",
      typeof data,
      Array.isArray(data) ? "Array" : "Object"
    );

    // Extraction propre de la réponse
    let generatedText = "";
    if (Array.isArray(data)) {
      console.log(
        "[DEBUG] Données sous forme de tableau, premier élément:",
        data[0]
      );
      generatedText = data[0]?.generated_text || "";
    } else {
      console.log("[DEBUG] Données sous forme d'objet:", data);
      generatedText = data.generated_text || "";
    }

    console.log("[DEBUG] Texte généré brut:", generatedText);

    // Nettoyer la réponse (enlever le prompt s'il est inclus)
    if (generatedText.includes("[/INST]")) {
      const parts = generatedText.split("[/INST]");
      generatedText = parts[parts.length - 1].trim();
    }

    console.log("[DEBUG] Texte généré nettoyé:", generatedText);

    return (
      generatedText ||
      "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ?"
    );
  } catch (error) {
    console.error("Erreur lors de l'appel à Hugging Face:", error);
    return getFallbackResponse(userMessage, promptContext);
  }
}

// Fonction de réponse de secours basée sur des règles simples
function getFallbackResponse(userMessage, context) {
  // Convertir le message en minuscules pour la recherche de mots-clés
  const message = userMessage.toLowerCase();

  // Réponses selon les mots-clés
  if (
    message.includes("créer une boutique") ||
    message.includes("ouvrir une boutique")
  ) {
    return "Pour créer une boutique, vous pouvez vous rendre sur la page 'Créer une boutique' depuis le menu principal. Vous devrez remplir un formulaire avec les informations de votre boutique comme le nom, la description, les catégories et vos coordonnées.";
  }

  if (
    message.includes("produit") &&
    (message.includes("ajouter") || message.includes("créer"))
  ) {
    return "Pour ajouter un produit, vous devez d'abord avoir une boutique. Ensuite, connectez-vous à votre espace vendeur et utilisez le bouton 'Ajouter un produit'. Vous pourrez renseigner les détails comme le nom, la description, le prix et les images.";
  }

  if (
    message.includes("commande") &&
    (message.includes("statut") ||
      message.includes("état") ||
      message.includes("suivre"))
  ) {
    return "Vous pouvez suivre l'état de votre commande en vous connectant à votre compte et en allant dans la section 'Mes commandes'. Cliquez sur une commande spécifique pour voir son statut actuel et l'historique des étapes.";
  }

  if (
    message.includes("livraison") &&
    (message.includes("délai") || message.includes("temps"))
  ) {
    return "Nos délais de livraison standard sont de 3 à 5 jours ouvrables. Pour les commandes express, comptez 24 à 48 heures. Le délai exact dépend de votre localisation et est indiqué lors de la validation de votre commande.";
  }

  if (message.includes("retour") || message.includes("remboursement")) {
    return "Notre politique de retour vous permet de renvoyer les articles dans les 30 jours suivant la réception. Les articles doivent être non utilisés et dans leur emballage d'origine. Pour initier un retour, connectez-vous à votre compte et suivez les instructions dans la section 'Mes commandes'.";
  }

  if (
    message.includes("contact") ||
    message.includes("service client") ||
    message.includes("joindre")
  ) {
    return "Vous pouvez contacter notre service client par email à support@monsite.com ou par téléphone au +33 1 23 45 67 89 du lundi au vendredi de 9h à 18h. Vous pouvez également utiliser le formulaire de contact disponible sur notre site.";
  }

  if (
    message.includes("paiement") ||
    message.includes("moyens de paiement") ||
    message.includes("carte")
  ) {
    return "Nous acceptons plusieurs moyens de paiement : cartes bancaires (Visa, Mastercard, American Express), PayPal, et virements bancaires. Toutes les transactions sont sécurisées par un protocole de cryptage SSL.";
  }

  // Réponse par défaut
  return "Je suis votre assistant virtuel. Comment puis-je vous aider concernant nos produits, votre commande ou notre service ? Pour créer une boutique, cliquez sur 'Créer une boutique' dans le menu principal.";
}

// Sauvegarde la conversation dans la base de données
async function saveConversation(
  userId,
  sessionId,
  userMessage,
  botResponse,
  req
) {
  try {
    await dbConnect();

    // Obtenir les métadonnées de la requête
    const metadata = {
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      referrer: req.headers["referer"] || "",
    };

    // Vérifier si une conversation existe déjà pour cet utilisateur et session
    let conversation = await Conversation.findOne({
      userId,
      sessionId,
      active: true,
    });

    if (!conversation) {
      // Créer une nouvelle conversation
      conversation = new Conversation({
        userId,
        sessionId,
        messages: [],
        metadata,
      });
    }

    // Ajouter les messages à la conversation
    conversation.messages.push(
      { content: userMessage, sender: "user", timestamp: new Date() },
      { content: botResponse, sender: "bot", timestamp: new Date() }
    );

    // Mettre à jour la date de dernière activité
    conversation.lastActivity = new Date();

    // Sauvegarder la conversation
    await conversation.save();
  } catch (error) {
    console.error("Error saving conversation:", error);
    // Ne pas échouer complètement si la sauvegarde échoue
  }
}
