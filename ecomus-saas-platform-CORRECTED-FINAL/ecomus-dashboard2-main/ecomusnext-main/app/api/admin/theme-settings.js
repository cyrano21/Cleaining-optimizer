import dbConnect from "../../../lib/mongodb";
import ThemeSettings from "../../../models/ThemeSettings";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        // Récupérer les paramètres de thème ou créer des paramètres par défaut
        let settings = await ThemeSettings.findOne();

        if (!settings) {
          // Créer des paramètres par défaut si aucun n'existe
          settings = new ThemeSettings({
            showParallaxBanner: false,
            showSlidingAds: false,
            showBlogSidebar: false,
            parallaxBannerSettings: {
              title: "Découvrez nos Offres Exceptionnelles",
              subtitle: "Des produits de qualité à prix imbattables",
              backgroundImage: "/images/parallax-bg.jpg",
              ctaText: "Voir les Offres",
              ctaLink: "/shop",
              enabled: false,
            },
            slidingAdSettings: {
              topAd: {
                title: "Promotion Spéciale",
                description:
                  "Jusqu'à 50% de réduction sur une sélection de produits",
                image: "/images/promo-banner.jpg",
                link: "/shop?sale=true",
                enabled: false,
              },
              bottomAd: {
                title: "Nouveautés",
                description: "Découvrez nos derniers arrivages",
                image: "/images/new-products.jpg",
                link: "/shop?new=true",
                enabled: false,
              },
            },
            blogSidebarSettings: {
              showRecentPosts: true,
              showCategories: true,
              showTags: true,
              maxRecentPosts: 5,
              enabled: false,
            },
          });

          await settings.save();
        }

        res.status(200).json(settings);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres:", error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "POST":
      try {
        const {
          showParallaxBanner,
          showSlidingAds,
          showBlogSidebar,
          parallaxBannerSettings,
          slidingAdSettings,
          blogSidebarSettings,
        } = req.body;

        // Validation des données
        if (
          showParallaxBanner &&
          (!parallaxBannerSettings.title || !parallaxBannerSettings.subtitle)
        ) {
          return res.status(400).json({
            success: false,
            error:
              "Le titre et le sous-titre de la bannière parallax sont requis",
          });
        }

        if (showSlidingAds) {
          if (
            !slidingAdSettings.topAd.title &&
            !slidingAdSettings.bottomAd.title
          ) {
            return res.status(400).json({
              success: false,
              error: "Au moins une publicité doit avoir un titre",
            });
          }
        }

        // Mettre à jour ou créer les paramètres
        let settings = await ThemeSettings.findOne();

        if (settings) {
          // Mettre à jour les paramètres existants
          settings.showParallaxBanner = showParallaxBanner;
          settings.showSlidingAds = showSlidingAds;
          settings.showBlogSidebar = showBlogSidebar;
          settings.parallaxBannerSettings = parallaxBannerSettings;
          settings.slidingAdSettings = slidingAdSettings;
          settings.blogSidebarSettings = blogSidebarSettings;
          settings.updatedAt = new Date();
        } else {
          // Créer de nouveaux paramètres
          settings = new ThemeSettings({
            showParallaxBanner,
            showSlidingAds,
            showBlogSidebar,
            parallaxBannerSettings,
            slidingAdSettings,
            blogSidebarSettings,
          });
        }

        await settings.save();

        res.status(200).json({ success: true, data: settings });
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des paramètres:", error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "DELETE":
      try {
        // Réinitialiser les paramètres aux valeurs par défaut
        const defaultSettings = {
          showParallaxBanner: false,
          showSlidingAds: false,
          showBlogSidebar: false,
          parallaxBannerSettings: {
            title: "",
            subtitle: "",
            backgroundImage: "",
            ctaText: "",
            ctaLink: "",
            enabled: false,
          },
          slidingAdSettings: {
            topAd: {
              title: "",
              description: "",
              image: "",
              link: "",
              enabled: false,
            },
            bottomAd: {
              title: "",
              description: "",
              image: "",
              link: "",
              enabled: false,
            },
          },
          blogSidebarSettings: {
            showRecentPosts: true,
            showCategories: true,
            showTags: true,
            maxRecentPosts: 5,
            enabled: false,
          },
        };

        let settings = await ThemeSettings.findOne();

        if (settings) {
          Object.assign(settings, defaultSettings);
          settings.updatedAt = new Date();
          await settings.save();
        } else {
          settings = new ThemeSettings(defaultSettings);
          await settings.save();
        }

        res.status(200).json({ success: true, data: settings });
      } catch (error) {
        console.error(
          "Erreur lors de la réinitialisation des paramètres:",
          error
        );
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, error: "Méthode non autorisée" });
      break;
  }
}
