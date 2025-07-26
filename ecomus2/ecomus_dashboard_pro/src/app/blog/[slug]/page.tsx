import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Types } from 'mongoose';
import { generateSEOMetadata } from '@/lib/seo';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import OptimizedImage from '@/components/seo/OptimizedImage';

// Types pour un auteur et un article de blog peuplés afin de garantir la sécurité du type.
interface IPopulatedAuthor {
  firstName: string;
  lastName: string;
  vendor?: {
    businessName?: string;
  };
  profile?: {
    avatar?: string;
  };
}

interface IBlogPost {
  _id: Types.ObjectId;
  author: IPopulatedAuthor;
  title: string;
  seoTitle?: string;
  excerpt: string;
  seoDescription?: string;
  featuredImage?: string;
  slug: string;
  seoKeywords?: string[];
  publishedAt?: Date;
  updatedAt: Date;
  categories: string[];
  tags?: string[];
  content: string;
  views: number;
  readTime: number;
}

interface IRelatedPost {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: Date;
  readTime: number;
  categories: string[];
}

type Props = {
  params: Promise<{ slug: string }>;
};

// Générer les métadonnées SEO pour l'article de blog
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    await connectDB();
    const resolvedParams = await params;
    const post = (await Blog.findOne({ slug: resolvedParams.slug, status: 'published' })
      .populate('author', 'firstName lastName vendor.businessName')
      .lean()) as IBlogPost | null;

    if (!post) {
      return {
        title: 'Article non trouvé',
        description: "Cet article n'existe pas.",
      };
    }

    const additionalMeta: Record<string, string> = {
      'article:modified_time': post.updatedAt.toISOString(),
    };

    const authorName = post.author.vendor?.businessName || `${post.author.firstName} ${post.author.lastName}`;
    additionalMeta['article:author'] = authorName;

    if (post.publishedAt) {
      additionalMeta['article:published_time'] = post.publishedAt.toISOString();
    }
    if (post.categories?.[0]) {
      additionalMeta['article:section'] = post.categories[0];
    }
    if (post.tags?.length) {
      additionalMeta['article:tag'] = post.tags.join(',');
    }    return generateSEOMetadata({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      image: post.featuredImage || '/images/default-blog.jpg',
      url: `/blog/${resolvedParams.slug}`,
      type: 'article',
      keywords: post.seoKeywords,
      additionalMeta,
    });
  } catch (error) {
    // Erreur silencieuse en production, log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur lors de la génération des métadonnées:', error);
    }
    return {
      title: 'Erreur',
      description: 'Une erreur est survenue lors du chargement des métadonnées.',
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  try {
    await connectDB();
    const resolvedParams = await params;

    // Récupération de l'article et mise à jour des vues
    const post = (await Blog.findOneAndUpdate(
      { slug: resolvedParams.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'firstName lastName profile.avatar vendor.businessName')
      .lean()) as IBlogPost | null;

    if (!post) {
      notFound();
    }

    // Articles similaires
    const relatedPosts = (await Blog.find({
      _id: { $ne: post._id },
      status: 'published',
      $or: [
        { categories: { $in: post.categories } },
        { tags: { $in: post.tags ?? [] } },
      ],
    })
      .limit(3)
      .sort({ publishedAt: -1 })
      .select('title slug excerpt featuredImage publishedAt readTime categories')
      .lean()) as unknown as IRelatedPost[];

    const authorName = post.author.vendor?.businessName || `${post.author.firstName} ${post.author.lastName}`;
    
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.featuredImage,
      author: { '@type': 'Person', name: authorName },
      publisher: {
        '@type': 'Organization',
        name: 'Ecomus',
        logo: { '@type': 'ImageObject', url: '/images/logo.png' },
      },
      dateModified: post.updatedAt.toISOString(),
      wordCount: post.content.split(/\s+/).length,      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `/blog/${resolvedParams.slug}`,
      },
      ...(post.publishedAt && { datePublished: post.publishedAt.toISOString() }),
      keywords: post.tags?.join(', '),
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2">
              <div className="flex items-center">
                {post.author?.profile?.avatar && (
                  <div className="w-8 h-8 relative rounded-full overflow-hidden mr-2">
                    <OptimizedImage src={post.author.profile.avatar} alt={authorName} fill className="object-cover" />
                  </div>
                )}
                <span>Par {authorName}</span>
              </div>
              <time dateTime={post.publishedAt?.toISOString()}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                }) : 'Date inconnue'}
              </time>
              <span>•</span>
              <span>{post.readTime} min de lecture</span>
              <span>•</span>
              <span>{post.views} vues</span>
            </div>
            {post.featuredImage && (
              <div className="aspect-video relative rounded-lg overflow-hidden my-6">
                <OptimizedImage src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
              </div>
            )}
          </header>

          <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />

          {post.tags && post.tags.length > 0 && (
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Articles similaires
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost._id.toString()}
                    href={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    {relatedPost.featuredImage && (
                      <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                        <OptimizedImage src={relatedPost.featuredImage} alt={relatedPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </>
    );
  } catch (error) {
    console.error("Erreur lors du chargement de l'article:", error);
    notFound();
  }
}