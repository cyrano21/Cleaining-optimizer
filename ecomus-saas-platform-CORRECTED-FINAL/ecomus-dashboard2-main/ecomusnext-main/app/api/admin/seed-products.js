import { products1 } from "@/data/products";
import dbConnect from "../../../lib/dbConnect.js";
import Product from "../../../models/Product.js";
import Category from "../../../models/Category.js";
import Shop from "../../../models/Shop.js";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  // Vérifier l'authentification et les permissions
  const session = await getSession({ req });
  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ success: false, message: "Non autorisé" });
  }

  // Vérifier la méthode
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Méthode non autorisée" });
  }

  try {
    // Connexion à la base de données
    await dbConnect();

    // Récupérer toutes les boutiques
    const shops = await Shop.find({});
    if (shops.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Aucune boutique trouvée. Veuillez créer des boutiques avant de migrer les produits.",
      });
    }

    // Récupérer toutes les catégories
    const categories = await Category.find({});
    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Aucune catégorie trouvée. Veuillez créer des catégories avant de migrer les produits.",
      });
    }

    // Mapper les catégories de filtrage aux catégories MongoDB
    const categoryMap = {
      "Best seller": categories.find(
        (c) =>
          c.name.toLowerCase().includes("best") ||
          c.name.toLowerCase().includes("populaire")
      ),
      "New arrivals": categories.find(
        (c) =>
          c.name.toLowerCase().includes("new") ||
          c.name.toLowerCase().includes("nouveau")
      ),
      "On Sale": categories.find(
        (c) =>
          c.name.toLowerCase().includes("sale") ||
          c.name.toLowerCase().includes("promo")
      ),
    };

    // Distribuer les produits entre les boutiques
    const productsToInsert = products1.map((product, index) => {
      // Assigner chaque produit à une boutique de manière cyclique
      const shopIndex = index % shops.length;
      const shop = shops[shopIndex];

      // Trouver une catégorie correspondante
      let category = null;
      if (product.filterCategories && product.filterCategories.length > 0) {
        const filterCategory = product.filterCategories[0];
        category = categoryMap[filterCategory] || categories[0];
      } else {
        category = categories[0];
      }

      // Convertir le produit au format MongoDB
      return {
        name: product.title,
        description: `Description de ${product.title}`,
        price: product.price,
        category: category._id,
        shop: shop._id,
        images: [product.imgSrc, product.imgHoverSrc].filter(Boolean),
        stock: product.isAvailable ? Math.floor(Math.random() * 100) + 1 : 0,
        brand: product.brand || "Ecomus",
        isActive: product.isAvailable,
      };
    });

    // Supprimer les produits existants si demandé
    if (req.body.clearExisting) {
      await Product.deleteMany({});
      console.log("Tous les produits existants ont été supprimés");
    }

    // Insérer les produits dans la base de données
    const result = await Product.insertMany(productsToInsert);

    return res.status(200).json({
      success: true,
      message: `${result.length} produits insérés avec succès`,
      count: result.length,
    });
  } catch (error) {
    console.error("Erreur lors de la migration des produits:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la migration des produits",
      error: error.message,
    });
  }
}
