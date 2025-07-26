import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://votre-site.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/product/*',
          '/vendor/*',
          '/category/*',
          '/blog/*',
          '/products',
          '/vendors',
          '/categories',
        ],
        disallow: [
          '/admin/*',
          '/dashboard/*',
          '/vendor-dashboard/*',
          '/super-admin/*',
          '/api/*',
          '/auth/*',
          '/settings/*',
          '/profile/*',
          '/debug*',
          '/test*',
          '/*.json',
          '/utilities/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/product/*',
          '/vendor/*',
          '/category/*',
          '/blog/*',
        ],
        disallow: [
          '/admin/*',
          '/dashboard/*',
          '/vendor-dashboard/*',
          '/super-admin/*',
          '/api/*',
          '/auth/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
