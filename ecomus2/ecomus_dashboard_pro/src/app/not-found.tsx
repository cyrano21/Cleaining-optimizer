import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page non trouvée | Ecomus Dashboard',
  description: 'La page que vous recherchez n\'existe pas. Retournez à l\'accueil ou explorez nos produits.',
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          <p className="text-gray-600 mb-6">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
          
          <Link 
            href="/products"
            className="inline-block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Voir nos produits
          </Link>
          
          <Link 
            href="/blog"
            className="inline-block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Lire notre blog
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Si vous pensez qu'il s'agit d'une erreur, 
            <Link href="/contact" className="text-blue-600 hover:underline ml-1">
              contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
