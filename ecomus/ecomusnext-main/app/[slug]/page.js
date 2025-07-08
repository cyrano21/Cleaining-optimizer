import { notFound } from 'next/navigation';
import StoreHomeRenderer from '@/components/stores/StoreHomeRenderer';

// Fonction pour récupérer les données du store
async function getStoreData(slug) {
  try {
    // Utiliser l'API du dashboard sur le port 3001
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/public/store/${slug}`, {
      cache: 'no-store', // Toujours récupérer les données fraîches
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Store non trouvé
      }
      throw new Error('Erreur lors de la récupération du store');
    }

    const data = await response.json();
    return data.success ? data.store : null;
  } catch (error) {
    console.error('Erreur getStoreData:', error);
    return null;
  }
}

// Métadonnées dynamiques pour le SEO
export async function generateMetadata({ params }) {
  const { slug } = await params; // Attendre params pour Next.js 15
  const store = await getStoreData(slug);

  if (!store) {
    return {
      title: 'Boutique non trouvée',
      description: 'Cette boutique n\'existe pas ou n\'est plus disponible.',
    };
  }

  return {
    title: `${store.name} - Boutique en ligne`,
    description: store.description || `Découvrez ${store.name}, votre boutique en ligne de confiance.`,
    keywords: store.keywords?.join(', ') || '',
    openGraph: {
      title: store.name,
      description: store.description,
      images: store.logo ? [store.logo] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: store.name,
      description: store.description,
      images: store.logo ? [store.logo] : [],
    },
  };
}

// Composant principal de la page store
export default async function StorePage({ params }) {
  const { slug } = await params; // Attendre params pour Next.js 15
  const store = await getStoreData(slug);

  if (!store) {
    notFound();
  }

  return <StoreHomeRenderer store={store} />;
}

// Génération statique pour les stores populaires (optionnel)
export async function generateStaticParams() {
  try {
    // Utiliser l'API du dashboard sur le port 3001
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/public/stores?limit=10`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data.stores?.map((store) => ({
        slug: store.slug,
      })) || [];
    }
  } catch (error) {
    console.error('Erreur generateStaticParams:', error);
  }

  return [];
}
