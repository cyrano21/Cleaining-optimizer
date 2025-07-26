import { Metadata } from 'next';
import Link from 'next/link';
import { generateSEOMetadata } from '@/lib/seo';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { OptimizedImage } from '@/components/seo/OptimizedImage';

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

export const metadata: Metadata = generateSEOMetadata({
  title: 'Blog - Actualités et conseils e-commerce',
  description: 'Découvrez nos derniers articles sur l\'e-commerce, les tendances produits et les conseils d\'achat.',
  url: '/blog',
});

export default async function BlogPage({ searchParams }: BlogPageProps) {
  try {
    await connectDB();
    
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || '1');
    const limit = 9;
    const skip = (page - 1) * limit;
    const category = resolvedSearchParams.category;

    // Construction de la requête
    const query: any = { status: 'published' };
    if (category) {
      query.categories = { $in: [category] };
    }

    // Récupération des articles avec pagination
    const [posts, totalPosts, categories] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName profile.avatar vendor.businessName')
        .select('title slug excerpt featuredImage publishedAt readTime categories author views'),
      Blog.countDocuments(query),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$categories' },
        { $group: { _id: '$categories', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du blog */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog E-commerce
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos derniers articles, conseils d'achat, tendances produits 
            et actualités du monde de l'e-commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Catégories
              </h3>
              <div className="space-y-2">
                <Link
                  href="/blog"
                  className={`block px-3 py-2 rounded-md text-sm ${ 
                    !category 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Tous les articles ({totalPosts})
                </Link>
                {categories.map((cat: any) => (
                  <Link
                    key={cat._id}
                    href={`/blog?category=${encodeURIComponent(cat._id)}`}
                    className={`block px-3 py-2 rounded-md text-sm ${
                      category === cat._id
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {cat._id} ({cat.count})
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="lg:col-span-3">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {posts.map((post) => (
                    <article key={post._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <Link href={`/blog/${post.slug}`}>
                        {post.featuredImage && (
                          <div className="aspect-video relative rounded-t-lg overflow-hidden">
                            <OptimizedImage
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <time dateTime={post.publishedAt}>
                              {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </time>
                            <span className="mx-2">•</span>
                            <span>{post.readTime} min de lecture</span>
                          </div>
                          
                          <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h2>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {post.author.profile?.avatar && (
                                <div className="w-8 h-8 relative rounded-full overflow-hidden mr-2">
                                  <OptimizedImage
                                    src={post.author.profile.avatar}
                                    alt={`${post.author.firstName} ${post.author.lastName}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span className="text-sm text-gray-600">
                                {post.author.vendor?.businessName || 
                                 `${post.author.firstName} ${post.author.lastName}`}
                              </span>
                            </div>

                            {post.categories.length > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {post.categories[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
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
                        return (
                          <Link
                            key={pageNumber}
                            href={`/blog?page=${pageNumber}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                            className={`px-3 py-2 border rounded-md text-sm font-medium ${
                              isCurrentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {pageNumber}
                          </Link>
                        );
                      }
                      return null;
                    })}

                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
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
                  Aucun article trouvé.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur lors du chargement du blog:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600">
            Une erreur est survenue lors du chargement des articles.
          </p>
        </div>
      </div>
    );
  }
}
