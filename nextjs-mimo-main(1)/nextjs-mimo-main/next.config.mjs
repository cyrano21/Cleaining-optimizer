import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configurez ici les options CSS si nécessaire
  // Ne pas utiliser de syntaxe CSS directement dans ce fichier
  
  // Options pour améliorer la stabilité et le routage
  onDemandEntries: {
    // période en ms où les pages compilées sont conservées en mémoire
    maxInactiveAge: 60 * 1000,
    // nombre maximum de pages à conserver en mémoire
    pagesBufferLength: 5,
  },
  
  // Optimisations pour la production
  compress: true,
  
  // Ajout d'une gestion d'erreur plus détaillée en développement
  typescript: {
    // ⚠️ Ne pas activer en production
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
};

export default withBundleAnalyzer(nextConfig);
