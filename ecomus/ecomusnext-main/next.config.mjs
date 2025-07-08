import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Import i18next config (disabled to prevent automatic redirects)
// const { i18n } = require('./next-i18next.config.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // i18n, // Désactivé pour éviter les redirections automatiques
  reactStrictMode: false, // Désactiver le mode strict pour éviter les doubles rendus
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ecomusnext-themesflat.vercel.app",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
  // Redirections pour les anciennes pages dashboard utilisateur
  async redirects() {
    return [
      {
        source: '/my-account',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/my-account-orders',
        destination: '/dashboard/orders',
        permanent: true,
      },
      {
        source: '/my-account-orders-details',
        destination: '/dashboard/orders',
        permanent: true,
      },
      {
        source: '/my-account-edit',
        destination: '/dashboard/settings',
        permanent: true,
      },
      {
        source: '/my-account-address',
        destination: '/dashboard/addresses',
        permanent: true,
      },
      {
        source: '/my-account-wishlist',
        destination: '/dashboard/wishlist',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
