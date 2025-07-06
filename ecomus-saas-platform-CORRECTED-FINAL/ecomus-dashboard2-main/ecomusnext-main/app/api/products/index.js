import dbConnect from "../../../lib/dbConnect";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import mongoose from "mongoose";

export default async function handler(req, res) {
  const { method } = req;

  console.log(`[API products] Méthode: ${method}`);
  console.log(`[API products DEBUG] URL complète: ${req.url}`);
  console.log(`[API products DEBUG] Headers: ${JSON.stringify(req.headers)}`);

  // Connexion à la base de données
  try {
    await dbConnect();
    console.log("[API products] Connexion à la base de données réussie");
    console.log(
      "[API products DEBUG] État de la connexion MongoDB:",
      mongoose.connection.readyState
    );
  } catch (error) {
    console.error(
      "[API products] Erreur de connexion à la base de données:",
      error
    );
    return res.status(500).json({
      success: false,
      error: "Erreur de connexion à la base de données",
    });
  }

  switch (method) {
    case "GET":
      try {
        // Récupérer les paramètres de requête
        const { category, limit = 10, page = 1, includeInactive } = req.query;

        // Convertir les paramètres en nombres et s'assurer qu'ils sont valides
        const limitNum = Math.min(parseInt(limit) || 10, 100); // Maximum 100 produits par page
        const pageNum = parseInt(page) || 1;

        console.log(
          `[API products] Paramètres de pagination: limit=${limitNum}, page=${pageNum}`
        );

        // Déterminer si la requête vient de l'admin ou du front-end public
        const isAdminRequest =
          req.headers["x-admin-request"] === "true" ||
          req.query.admin === "true" ||
          includeInactive === "true" ||
          req.headers["referer"]?.includes("/admin/products");

        // En mode développement, log plus détaillé des paramètres de requête
        console.log(
          `[API products] Paramètres complets: ${JSON.stringify(req.query)}`
        );
        console.log(`[API products] includeInactive: ${includeInactive}`);
        console.log(
          `[API products] Mode admin: ${isAdminRequest ? "OUI" : "NON"}`
        );
        console.log(
          `[API products] Headers complets: ${JSON.stringify(req.headers)}`
        );

        // Pour l'admin, récupérer tous les produits (visibles ou non)
        // Pour le front-end public, ne récupérer que les produits visibles, sauf si on vient de la page "shop?category=X"
        // car ce filtrage spécifique gère sa propre visibilité
        const isCategoryPageRequest = !!category;
        const query = isAdminRequest ? {} : { isActive: true };

        // Filtrer par boutique si spécifié
        const shop = req.query.shop;
        if (shop) {
          console.log("[API products] Filtrage par boutique:", shop);
          if (mongoose.Types.ObjectId.isValid(shop)) {
            query.shop = new mongoose.Types.ObjectId(shop);
          } else {
            console.error("[API products] ID de boutique invalide:", shop);
            return res.status(400).json({
              success: false,
              message: "ID de boutique invalide",
            });
          }
        }
        console.log(
          `[API products] Filtre de visibilité: ${
            isAdminRequest
              ? "Tous les produits (admin)"
              : isCategoryPageRequest
              ? "Tous les produits (filtrage catégorie)"
              : "Produits visibles uniquement"
          }`
        );

        // Filtrer par catégorie si spécifié
        if (category) {
          console.log("[API products] Catégorie spécifiée:", category);
          // Récupérer l'ID de la catégorie à partir du slug ou de l'ID
          const isObjectId = mongoose.Types.ObjectId.isValid(category);
          const categoryQuery = isObjectId
            ? { _id: new mongoose.Types.ObjectId(category) } // Convertir en ObjectId explicitement
            : { slug: category };

          // Pour les requêtes non-admin, ne chercher que les catégories actives
          if (!isAdminRequest) {
            categoryQuery.isActive = true;
          }

          console.log("[API products] isAdminRequest:", isAdminRequest);

          console.log("[API products] Recherche par critères:", categoryQuery);

          try {
            const cat = await Category.findOne(categoryQuery);
            if (!cat) {
              console.log(
                "[API products] Catégorie non trouvée avec la requête exacte, tentative avec une recherche insensible à la casse sur le slug"
              );
              // Tentative avec une recherche insensible à la casse si c'est un slug
              if (!isObjectId) {
                const slugRegex = new RegExp(`^${category}$`, "i");
                const catByInsensitiveSlug = await Category.findOne({
                  slug: slugRegex,
                  ...(!isAdminRequest ? { isActive: true } : {}),
                });

                if (catByInsensitiveSlug) {
                  console.log(
                    "[API products] Catégorie trouvée avec recherche insensible à la casse:",
                    catByInsensitiveSlug.slug
                  );
                  // Assurons-nous de stocker l'ID de catégorie comme un ObjectId explicite
                  query.category = new mongoose.Types.ObjectId(
                    catByInsensitiveSlug._id.toString()
                  );
                  console.log(
                    "[API products] Utilisation de l'ID de catégorie:",
                    query.category,
                    "isActive:",
                    catByInsensitiveSlug.isActive,
                    "Type:",
                    query.category.constructor.name
                  );
                  // Continuer le traitement avec cette catégorie
                } else {
                  console.log(
                    "[API products] Catégorie non trouvée ou inactive avec le slug/id après toutes les tentatives:",
                    category
                  );
                  return res.status(200).json({
                    success: true,
                    data: [], // Retourner un tableau vide plutôt qu'une erreur 404
                    message: "Aucun produit trouvé pour cette catégorie",
                  });
                }
              } else {
                return res.status(200).json({
                  success: true,
                  data: [], // Retourner un tableau vide plutôt qu'une erreur 404
                  message: "Aucun produit trouvé pour cette catégorie",
                });
              }
            } else {
              // Assurons-nous de stocker l'ID de catégorie comme un ObjectId explicite
              query.category = new mongoose.Types.ObjectId(cat._id.toString());
              console.log(
                "[API products] Utilisation de l'ID de catégorie:",
                query.category,
                "isActive:",
                cat.isActive,
                "Type:",
                query.category.constructor.name
              );
            }
          } catch (catError) {
            console.error(
              "[API products] Erreur lors de la recherche de catégorie:",
              catError
            );
            return res.status(200).json({
              success: true,
              data: [], // Retourner un tableau vide plutôt qu'une erreur 404
              message: "Erreur lors de la recherche de produits par catégorie",
            });
          }
        } else {
          console.log("[API products] Aucune catégorie spécifiée");
        }

        // Avant le filtrage par catégorie, compter tous les produits dans la base de données
        console.log(
          "[API products] Vérification du nombre total de produits dans la base de données"
        );
        const totalProductCount = await Product.countDocuments({});
        console.log(
          `[API products] Nombre total de produits dans la base de données: ${totalProductCount}`
        );

        // Si nous filtrons par catégorie, vérifions le nombre de produits pour cette catégorie spécifique
        if (query.category) {
          // Correction du problème de comparaison d'ID :
          // Convertir en instance ObjectId pour s'assurer de la compatibilité entre types
          try {
            const categoryIdStr = query.category.toString();
            if (mongoose.Types.ObjectId.isValid(categoryIdStr)) {
              // Remplacer directement par un ObjectId pour assurer la comparaison correcte
              query.category = new mongoose.Types.ObjectId(categoryIdStr);
              console.log(
                `[API products] ID de catégorie formaté en ObjectId: ${query.category}`
              );
            }

            // Compter TOUS les produits avec l'ID de catégorie, sans filtrer par isActive
            const categoryProductCount = await Product.countDocuments({
              category: query.category,
            });
            console.log(
              `[API products] Nombre de produits pour la catégorie ${category}: ${categoryProductCount}`
            );

            // Vérification supplémentaire en cas d'absence de résultats
            if (categoryProductCount === 0) {
              console.log(
                `[API products] ATTENTION: 0 produits trouvés pour cette catégorie. Diagnostic complet...`
              );

              // Vérifier s'il y a des produits qui correspondent à cette catégorie d'une autre manière
              // Pour aider au diagnostic, mais pas nécessaire pour la correction principale
              const allProducts = await Product.find({}).limit(20);
              console.log(
                `[API products] Échantillon de ${allProducts.length} produits récupérés pour diagnostic`
              );

              // Examiner quelques produits pour voir comment les catégories sont stockées
              if (allProducts.length > 0) {
                const productCategories = allProducts.map((p) => ({
                  productId: p._id,
                  categoryId: p.category ? p.category.toString() : "undefined",
                  categoryType: p.category ? typeof p.category : "undefined",
                }));

                console.log(
                  `[API products] Format des catégories dans les produits:`
                );
                console.log(productCategories.slice(0, 3));
              }
            }
          } catch (e) {
            console.error(
              `[API products] Erreur lors du traitement de l'ID de catégorie:`,
              e
            );
          }
        }

        // Récupérer les produits
        console.log("[API products] Requête de recherche:", query);

        console.log(
          "[API products DEBUG] Tentative de find sur le modèle Product"
        );
        // Limites raisonnables pour la pagination
        const MAX_LIMIT = 100; // Maximum pour les résultats
        const DEFAULT_LIMIT = 50; // Limite par défaut

        // Valider les paramètres utilisateur avec des valeurs raisonnables
        const validatedLimit = Math.min(limitNum || DEFAULT_LIMIT, MAX_LIMIT);
        const validatedPage = Math.max(1, pageNum || 1);
        const skipAmount = (validatedPage - 1) * validatedLimit;

        console.log(
          `[API products] Pagination: limit=${validatedLimit}, page=${validatedPage}, skip=${skipAmount}`
        );

        let products = [];

        try {
          products = await Product.find(query)
            .populate("category") // Récupérer tout l'objet catégorie
            .limit(validatedLimit)
            .skip(skipAmount)
            .sort({ createdAt: -1 });

          console.log("[API products DEBUG] Requête exécutée avec succès");

          // Enrichir les produits avec le slug de catégorie pour faciliter le filtrage côté client
          products = products.map((product) => {
            const enrichedProduct = product.toObject
              ? product.toObject()
              : { ...product };
            // Ajouter le slug de catégorie si disponible
            if (
              product.category &&
              typeof product.category === "object" &&
              product.category.slug
            ) {
              enrichedProduct.categorySlug = product.category.slug;
            }
            return enrichedProduct;
          });
        } catch (queryError) {
          console.error(
            "[API products] Erreur lors de la requête de produits:",
            queryError
          );
          return res.status(200).json({
            success: true,
            data: [],
            message: "Erreur lors de la recherche de produits",
          });
        }

        const count = await Product.countDocuments(query);
        console.log("[API products] Nombre total de produits trouvés:", count);
        console.log(
          "[API products] Nombre de produits retournés:",
          products.length
        );

        if (products.length > 0) {
          console.log(
            "[API products] Premier produit trouvé:",
            JSON.stringify(products[0])
          );
        } else {
          console.log(
            "[API products DEBUG] Aucun produit trouvé dans la base de données"
          );
          // Vérifier la structure des collections dans la base de données
          try {
            const collections = await mongoose.connection.db
              .listCollections()
              .toArray();
            console.log(
              "[API products DEBUG] Collections disponibles:",
              collections.map((c) => c.name)
            );

            // Vérifier si la collection products existe
            const productsCollection = collections.find(
              (c) => c.name === "products"
            );
            if (!productsCollection) {
              console.log(
                "[API products DEBUG] Collection products inexistante!"
              );
            } else {
              // Compter tous les documents dans la collection products sans filtre
              const totalDocs = await mongoose.connection.db
                .collection("products")
                .countDocuments({});
              console.log(
                "[API products DEBUG] Nombre total de documents dans la collection products:",
                totalDocs
              );
            }
          } catch (err) {
            console.error(
              "[API products DEBUG] Erreur lors de la vérification des collections:",
              err
            );
          }
        }

        // Assurez-vous que products est bien un tableau
        if (!Array.isArray(products)) {
          console.error(
            "[API products] Les produits récupérés ne forment pas un tableau:",
            products
          );
          products = []; // Fournir un tableau vide pour éviter l'erreur
        }

        console.log(
          `[API products] Nombre de produits trouvés: ${products.length}`
        );

        // Si aucun produit n'est trouvé, nous pouvons vérifier l'état du modèle
        if (products.length === 0) {
          console.log(
            "[API products DEBUG] Description du modèle Product:",
            Object.keys(Product)
          );
          console.log(
            "[API products DEBUG] Schema du modèle Product:",
            Product.schema
              ? Object.keys(Product.schema.paths)
              : "Pas de schema disponible"
          );
        }

        // Structure cohérente de la réponse
        return res.status(200).json({
          success: true,
          data: products, // Les données sont toujours dans la propriété "data"
          pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / parseInt(limit)),
          },
        });
      } catch (error) {
        console.error(
          "[API products] Erreur lors de la récupération des produits:",
          error
        );
        console.error("[API products DEBUG] Stack trace:", error.stack);
        return res
          .status(400)
          .json({ success: false, error: error.message, stack: error.stack });
      }
    case "POST":
      try {
        console.log("[API products] Traitement de la requête POST");
        console.log("[API products] Body:", req.body);

        // Vérifier que l'ID de la boutique est fourni
        if (!req.body.shop) {
          console.error("[API products] Erreur: ID de boutique manquant");
          return res.status(400).json({
            success: false,
            message: "L'ID de la boutique est requis",
          });
        }

        // Traiter les attributs si présents
        const productData = { ...req.body };

        // Convertir les attributs en Map si fournis sous forme d'objet
        if (
          productData.attributes &&
          typeof productData.attributes === "object" &&
          !productData.attributes instanceof Map
        ) {
          const attributesMap = new Map();
          Object.entries(productData.attributes).forEach(([key, value]) => {
            attributesMap.set(key, value);
          });
          productData.attributes = attributesMap;
        }

        // Créer un nouveau produit
        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();

        console.log(
          "[API products] Produit créé avec succès:",
          savedProduct._id
        );

        return res.status(201).json({
          success: true,
          data: savedProduct,
        });
      } catch (error) {
        console.error(
          "[API products] Erreur lors de la création du produit:",
          error
        );
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    case "PUT":
      try {
        console.log("[API products] Traitement de la requête PUT");

        // Vérifier que l'ID du produit est fourni
        if (!req.body._id) {
          console.error("[API products] Erreur: ID du produit manquant");
          return res.status(400).json({
            success: false,
            message: "L'ID du produit est requis",
          });
        }

        // Récupérer le produit existant
        const existingProduct = await Product.findById(req.body._id);

        if (!existingProduct) {
          console.error("[API products] Erreur: Produit non trouvé");
          return res.status(404).json({
            success: false,
            message: "Produit non trouvé",
          });
        }

        // Vérifier si l'utilisateur tente de modifier la boutique
        if (
          req.body.shop &&
          req.body.shop.toString() !== existingProduct.shop.toString()
        ) {
          console.error(
            "[API products] Erreur: Tentative de modification de la boutique"
          );
          return res.status(400).json({
            success: false,
            message:
              "La boutique d'un produit ne peut pas être modifiée après sa création",
          });
        }

        // Traiter les attributs si présents
        const productData = { ...req.body };

        // Convertir les attributs en Map si fournis sous forme d'objet
        if (
          productData.attributes &&
          typeof productData.attributes === "object" &&
          !productData.attributes instanceof Map
        ) {
          const attributesMap = new Map();
          Object.entries(productData.attributes).forEach(([key, value]) => {
            attributesMap.set(key, value);
          });
          productData.attributes = attributesMap;
        }

        // Mettre à jour le produit
        const updatedProduct = await Product.findByIdAndUpdate(
          req.body._id,
          productData,
          { new: true, runValidators: true }
        );

        console.log(
          "[API products] Produit mis à jour avec succès:",
          updatedProduct._id
        );

        return res.status(200).json({
          success: true,
          data: updatedProduct,
        });
      } catch (error) {
        console.error(
          "[API products] Erreur lors de la mise à jour du produit:",
          error
        );
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      return res
        .status(405)
        .json({ success: false, error: `Méthode ${method} non autorisée` });
  }
}
