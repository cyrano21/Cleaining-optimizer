import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateSEOMetadata } from '@/lib/seo';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import OptimizedImage from '@/components/seo/OptimizedImage';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Générer les métadonnées SEO pour la page produit
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    await connectDB();
    const resolvedParams = await params;
    const product = await Product.findOne({ slug: resolvedParams.slug }).populate('vendor');

    if (!product) {
      return {
        title: 'Produit non trouvé',
        description: 'Ce produit n\'existe pas.',
      };
    }

    return generateSEOMetadata({      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description,
      image: product.images[0] || '/images/products/placeholder-1.jpg',
      url: `/product/${resolvedParams.slug}`,
      type: 'website',
      additionalMeta: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'EUR',
        'product:brand': product.vendor?.vendor?.businessName || 'Vendeur',
        'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
        'product:category': product.category,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération des métadonnées:', error);
    return {
      title: 'Erreur',
      description: 'Une erreur est survenue.',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const product = await Product.findOne({ slug: resolvedParams.slug }).populate('vendor');

    if (!product) {
      notFound();
    }

    // Produits similaires
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
    })
      .limit(4)
      .select('name slug images price category');

    const vendor = product.vendor;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: vendor?.vendor?.businessName || 'Vendeur',
      },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'EUR',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: vendor?.vendor?.businessName || 'Vendeur',
        },
      },
      aggregateRating: product.rating && {
        '@type': 'AggregateRating',
        ratingValue: product.rating.average,
        reviewCount: product.rating.count,
      },
    };

    return (
      <>
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Accueil
                </Link>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <Link href={`/category/${product.category}`} className="text-gray-500 hover:text-gray-700">
                  {product.category}
                </Link>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li className="text-gray-900 font-medium">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images du produit */}
            <div className="space-y-4">
              <div className="aspect-square relative">
                <OptimizedImage
                  src={product.images[0] || '/images/products/placeholder-1.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="aspect-square relative">
                      <OptimizedImage
                        src={image}
                        alt={`${product.name} - Image ${index + 2}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Détails du produit */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 mb-4">
                  SKU: {product.sku}
                </p>
                {product.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating.average)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({product.rating.count} avis)
                    </span>
                  </div>
                )}
              </div>

              <div className="text-3xl font-bold text-gray-900">
                {product.price.toFixed(2)} €
              </div>

              <div className="prose prose-sm">
                <p>{product.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">Disponibilité:</span>
                  <span className={`ml-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-medium text-gray-900">Catégorie:</span>
                  <Link href={`/category/${product.category}`} className="ml-2 text-blue-600 hover:text-blue-800">
                    {product.category}
                  </Link>
                </div>

                {vendor && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">Vendeur:</span>
                    <Link href={`/vendor/${vendor.vendor?.slug || vendor._id}`} className="ml-2 text-blue-600 hover:text-blue-800">
                      {vendor.vendor?.businessName || vendor.firstName + ' ' + vendor.lastName}
                    </Link>
                  </div>
                )}
              </div>

              <button
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
              </button>
            </div>
          </div>

          {/* Produits similaires */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Produits similaires
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct._id}
                    href={`/product/${relatedProduct.slug}`}
                    className="group"
                  >
                    <div className="aspect-square relative mb-4">                      <OptimizedImage
                        src={relatedProduct.images[0] || '/images/products/placeholder-1.jpg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {relatedProduct.price.toFixed(2)} €
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error);
    notFound();
  }
}