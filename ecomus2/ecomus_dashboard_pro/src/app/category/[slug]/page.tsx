import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateSEOMetadata } from '@/lib/seo';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { OptimizedImage } from '@/components/seo/OptimizedImage';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}

// Générer les métadonnées SEO pour la page catégorie
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    await connectDB();
    const resolvedParams = await params;
    const category = await Category.findOne({ slug: resolvedParams.slug });

    if (!category) {
      return {
        title: 'Catégorie non trouvée',
        description: 'Cette catégorie n\'existe pas.',
      };
    }    return generateSEOMetadata({
      title: category.seoTitle || `${category.name} - Achat en ligne`,
      description: category.seoDescription || `Découvrez notre sélection de produits ${category.name.toLowerCase()}. ${category.description}`,
      image: category.image || '/images/default-category.jpg',
      url: `/category/${resolvedParams.slug}`,
      keywords: category.seoKeywords,
    });
  } catch (error) {
    console.error('Erreur lors de la génération des métadonnées:', error);
    return {
      title: 'Erreur',
      description: 'Une erreur est survenue.',
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const category = await Category.findOne({ slug: resolvedParams.slug });

    if (!category) {
      notFound();
    }

    // Paramètres de filtrage et tri
    const page = parseInt(resolvedSearchParams.page || '1');
    const limit = 12;
    const skip = (page - 1) * limit;
    const sortBy = resolvedSearchParams.sort || 'createdAt';
    const priceMin = resolvedSearchParams.priceMin ? parseFloat(resolvedSearchParams.priceMin) : undefined;
    const priceMax = resolvedSearchParams.priceMax ? parseFloat(resolvedSearchParams.priceMax) : undefined;

    // Construction de la requête de filtrage
    const query: any = {
      category: category.name,
      status: 'active',
    };

    if (priceMin !== undefined || priceMax !== undefined) {
      query.price = {};
      if (priceMin !== undefined) query.price.$gte = priceMin;
      if (priceMax !== undefined) query.price.$lte = priceMax;
    }

    // Construction du tri
    let sort: any = {};
    switch (sortBy) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Récupérer les produits avec pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('vendor', 'firstName lastName vendor.businessName')
        .select('name slug images price category rating vendor'),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    // Statistiques de prix pour les filtres
    const priceStats = await Product.aggregate([
      { $match: { category: category.name, status: 'active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    const minPrice = priceStats[0]?.minPrice || 0;
    const maxPrice = priceStats[0]?.maxPrice || 1000;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      description: category.description,
      url: `/category/${category.slug}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: totalProducts,
        itemListElement: products.map((product, index) => ({
          '@type': 'Product',
          position: index + 1,
          name: product.name,
          url: `/product/${product.slug}`,
          image: product.images[0],
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'EUR',
          },
        })),
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
          {/* En-tête de catégorie */}
          <div className="mb-8">
            {category.image && (
              <div className="aspect-[3/1] relative mb-6 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
                    <p className="text-xl opacity-90">{category.description}</p>
                  </div>
                </div>
              </div>
            )}

            {!category.image && (
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
                <p className="text-xl text-gray-600">{category.description}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {totalProducts} produit{totalProducts > 1 ? 's' : ''} trouvé{totalProducts > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filtres */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>

                {/* Filtre de prix */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Prix</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={resolvedSearchParams.priceMin}
                        min={minPrice}
                        max={maxPrice}
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={resolvedSearchParams.priceMax}
                        min={minPrice}
                        max={maxPrice}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Prix: {minPrice.toFixed(2)}€ - {maxPrice.toFixed(2)}€
                    </p>
                  </div>
                </div>

                {/* Tri */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Trier par</h4>                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue={resolvedSearchParams.sort}
                    aria-label="Trier les produits par"
                  >
                    <option value="createdAt">Plus récents</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Nom A-Z</option>
                    <option value="rating">Mieux notés</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grille de produits */}
            <div className="lg:col-span-3">
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        href={`/product/${product.slug}`}
                        className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square relative mb-4 rounded-t-lg overflow-hidden">                          <OptimizedImage
                            src={product.images[0] || '/images/products/placeholder-1.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {product.vendor?.vendor?.businessName || 
                             `${product.vendor?.firstName} ${product.vendor?.lastName}`}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              {product.price.toFixed(2)} €
                            </span>
                            {product.rating && product.rating.average > 0 && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {product.rating.average.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                      {page > 1 && (                        <Link
                          href={`/category/${category.slug}?page=${page - 1}${resolvedSearchParams.sort ? `&sort=${resolvedSearchParams.sort}` : ''}`}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Précédent
                        </Link>
                      )}

                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = pageNumber === page;
                        
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= page - 2 && pageNumber <= page + 2)
                        ) {
                          return (                            <Link
                              key={pageNumber}
                              href={`/category/${category.slug}?page=${pageNumber}${resolvedSearchParams.sort ? `&sort=${resolvedSearchParams.sort}` : ''}`}
                              className={`px-3 py-2 border rounded-md text-sm font-medium ${
                                isCurrentPage
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {pageNumber}
                            </Link>
                          );
                        } else if (
                          pageNumber === page - 3 ||
                          pageNumber === page + 3
                        ) {
                          return (
                            <span key={pageNumber} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      {page < totalPages && (                        <Link
                          href={`/category/${category.slug}?page=${page + 1}${resolvedSearchParams.sort ? `&sort=${resolvedSearchParams.sort}` : ''}`}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Suivant
                        </Link>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Aucun produit trouvé dans cette catégorie.
                  </p>
                  <Link
                    href="/"
                    className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Erreur lors du chargement de la catégorie:', error);
    notFound();
  }
}
