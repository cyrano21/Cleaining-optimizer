import { Metadata } from 'next';

interface SEOMetadataOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  additionalMeta?: Record<string, string>;
}

export function generateSEOMetadata(options: SEOMetadataOptions): Metadata {
  const {
    title,
    description,
    image = '/images/default-og.jpg',
    url = '',
    type = 'website',
    keywords = [],
    additionalMeta = {}
  } = options;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      type,
      url,
      images: [
        {
          url: image,
          width: 1200, // Retour à width
          height: 630, // Retour à height
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    other: additionalMeta,
  };

  return metadata;
}

export function generateBlogSEO({
  title,
  description,
  slug,
  image,
  author,
  publishedAt,
  modifiedAt,
  tags = [],
  category,
}: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  author?: string;
  publishedAt?: Date;
  modifiedAt?: Date;
  tags?: string[];
  category?: string;
}): Metadata {
  const url = `/blog/${slug}`;
  
  const additionalMeta: Record<string, string> = {};
  
  if (author) additionalMeta['article:author'] = author;
  if (publishedAt) additionalMeta['article:published_time'] = publishedAt.toISOString();
  if (modifiedAt) additionalMeta['article:modified_time'] = modifiedAt.toISOString();
  if (category) additionalMeta['article:section'] = category;
  if (tags.length > 0) additionalMeta['article:tag'] = tags.join(',');

  return generateSEOMetadata({
    title,
    description,
    image,
    url,
    type: 'article',
    keywords: tags,
    additionalMeta,
  });
}