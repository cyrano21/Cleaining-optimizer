const lesson1 = {
  id: '15-1',
  title: 'SEO Avancé avec Next.js',
  description:
    'Techniques avancées de référencement naturel : métadonnées dynamiques, structured data, optimisation technique et stratégies de contenu.',
  difficulty: 'avancé',
  duration: 45,
  tags: ['Next.js', 'SEO', 'Métadonnées', 'Structured Data', 'Référencement'],
  prerequisites: ['8-3'],

  content: {
    theory: `
      <h2>🎯 SEO Avancé avec Next.js</h2>
      
      <h3>1. Métadonnées Dynamiques et Contextuelles</h3>
      <p>Création de métadonnées intelligentes qui s'adaptent au contenu et au contexte.</p>
      
      <div class="code-example">
        <pre><code>// app/blog/[slug]/page.js
import { generateMetadata } from '../../../lib/seo-utils'
import { getPost, getRelatedPosts } from '../../../lib/posts'

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  const relatedPosts = await getRelatedPosts(post.id, 3)
  
  if (!post) {
    return {
      title: 'Article non trouvé - Mon Blog',
      robots: { index: false, follow: false }
    }
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const postUrl = \\\`\\$\\{baseUrl}/blog/\\$\\{params.slug}\\\`
  
  return {
    title: \\\`\\$\\{post.title} | Mon Blog\\\`,
    description: post.excerpt || post.content.substring(0, 160),
    keywords: [...post.tags, 'blog', 'article', post.category],
    
    // Open Graph
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: 'Mon Blog',
      images: [
        {
          url: post.featuredImage || \\\`\\$\\{baseUrl}/api/og-image?title=\\\${encodeURIComponent(post.title)}\\\`,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
      locale: 'fr_FR',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
      creator: \\\`@\\$\\{post.author.twitter}\\\`,
    },
    
    // JSON-LD
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
          '@type': 'Person',
          name: post.author.name,
          url: \\\`\\$\\{baseUrl}/author/\\$\\{post.author.slug}\\\`
        },
        publisher: {
          '@type': 'Organization',
          name: 'Mon Blog',
          logo: {
            '@type': 'ImageObject',
            url: \\\`\\$\\{baseUrl}/logo.png\\\`
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': postUrl
        }
      })
    },
    
    // Canonical et alternates
    alternates: {
      canonical: postUrl,
      languages: {
        'fr': postUrl,
        'en': \\\`\\$\\{baseUrl}/en/blog/\\$\\{params.slug}\\\`
      }
    },
    
    // Robots et indexation
    robots: {
      index: post.status === 'published',
      follow: true,
      googleBot: {
        index: post.status === 'published',
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  }
}</code></pre>
      </div>
      
      <h3>2. Structured Data Avancées</h3>
      <p>Implémentation de données structurées complexes pour améliorer la visibilité dans les SERP.</p>
      
      <div class="code-example">
        <pre><code>// lib/structured-data.js
export class StructuredDataManager {
  static generateBreadcrumb(items) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }
  }
  
  static generateFAQ(questions) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    }
  }
  
  static generateProduct(product) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images,
      description: product.description,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand
      },
      offers: {
        '@type': 'Offer',
        url: product.url,
        priceCurrency: product.currency,
        price: product.price,
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Mon E-commerce'
        }
      },
      aggregateRating: product.rating && {
        '@type': 'AggregateRating',
        ratingValue: product.rating.average,
        reviewCount: product.rating.count
      },
      review: product.reviews?.map(review => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating
        },
        author: {
          '@type': 'Person',
          name: review.author
        },
        reviewBody: review.content
      }))
    }
  }
  
  static generateOrganization() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Mon Entreprise',
      url: process.env.NEXT_PUBLIC_BASE_URL,
      logo: \\\`\\$\\{process.env.NEXT_PUBLIC_BASE_URL}/logo.png\\\`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+33-1-23-45-67-89',
        contactType: 'Customer Service'
      },
      sameAs: [
        'https://facebook.com/monentreprise',
        'https://twitter.com/monentreprise',
        'https://linkedin.com/company/monentreprise'
      ]
    }
  }
  
  static generateEvent(event) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: {
        '@type': 'Place',
        name: event.venue,
        address: event.address
      },
      organizer: {
        '@type': 'Organization',
        name: event.organizer
      },
      offers: event.tickets && {
        '@type': 'Offer',
        url: event.ticketUrl,
        price: event.price,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock'
      }
    }
  }
}</code></pre>
      </div>
      
      <h3>3. Optimisation Technique SEO</h3>
      <p>Techniques avancées pour optimiser les aspects techniques du référencement.</p>
      
      <div class="code-example">
        <pre><code>// lib/seo-optimizer.js
export class SEOOptimizer {
  static async generateSitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    
    // Pages statiques
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/about', priority: 0.8, changefreq: 'monthly' },
      { url: '/contact', priority: 0.6, changefreq: 'monthly' },
      { url: '/blog', priority: 0.9, changefreq: 'daily' }
    ]
    
    // Pages dynamiques - Articles
    const posts = await this.getAllPosts() // Assuming this.getAllPosts is defined elsewhere
    const postPages = posts.map(post => ({
      url: \\\`/blog/\\$\\{post.slug}\\\`,
      lastmod: post.updatedAt,
      priority: 0.7,
      changefreq: 'weekly'
    }))
    
    // Pages dynamiques - Catégories
    const categories = await this.getAllCategories() // Assuming this.getAllCategories is defined
    const categoryPages = categories.map(cat => ({
      url: \\\`/category/\\$\\{cat.slug}\\\`,
      lastmod: cat.updatedAt,
      priority: 0.6,
      changefreq: 'weekly'
    }))
    
    const allPages = [...staticPages, ...postPages, ...categoryPages]
    
    const sitemap = \\\`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\\$\\{allPages.map(page => \\\`
  <url>
    <loc>\\$\\{baseUrl}\\$\\{page.url}</loc>
    \\$\\{page.lastmod ? \\\`<lastmod>\\$\\{page.lastmod}</lastmod>\\\` : ''}
    <changefreq>\\$\\{page.changefreq}</changefreq>
    <priority>\\$\\{page.priority}</priority>
  </url>
\\\`).join('')}
</urlset>\\\`
    
    return sitemap
  }
  
  static async generateRobotsTxt() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    
    return \\\`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*?preview=*
Disallow: /*?draft=*

# Specific bots
User-agent: Googlebot
Allow: /api/og-image

User-agent: Bingbot
Crawl-delay: 1

Sitemap: \\$\\{baseUrl}/sitemap.xml
Sitemap: \\$\\{baseUrl}/news-sitemap.xml\\\`
  }
  
  static optimizeInternalLinking(content, relatedPosts = []) {
    let optimizedContent = content
    
    relatedPosts.forEach(post => {
      const regex = new RegExp(\`\\\\b\${post.keywords.join('|')}\\\\b\`, 'gi')
      optimizedContent = optimizedContent.replace(regex, (match) => 
        \\\`<a href="/blog/\\$\\{post.slug}" title="\\$\\{post.title}">\\$\\{match}</a>\\\`
      )
    })
    
    const importantPages = [
      { keywords: ['contact', 'contactez'], url: '/contact', title: 'Nous contacter' },
      { keywords: ['à propos', 'qui sommes'], url: '/about', title: 'À propos de nous' }
    ]
    
    importantPages.forEach(page => {
      const regex = new RegExp(\`\\\\b(\${page.keywords.join('|')})\\\\b\`, 'gi')
      optimizedContent = optimizedContent.replace(regex, 
        \\\`<a href="\\$\\{page.url}" title="\\$\\{page.title}">$1</a>\\\`
      )
    })
    
    return optimizedContent
  }
  
  static analyzeContentSEO(content, targetKeywords = []) {
    const analysis = {
      wordCount: content.split(/\\s+/).length,
      readabilityScore: 0, // Calculation not shown, placeholder
      keywordDensity: {},
      recommendations: []
    }
    
    targetKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi')
      const matches = content.match(regex) || []
      const density = (matches.length / analysis.wordCount) * 100
      
      analysis.keywordDensity[keyword] = {
        count: matches.length,
        density: density.toFixed(2)
      }
      
      if (density < 0.5) {
        analysis.recommendations.push(\\\`Augmenter la densité du mot-clé "\\$\\{keyword}" (actuellement \\$\\{density.toFixed(2)}%)\\\`)
      } else if (density > 3) {
        analysis.recommendations.push(\\\`Réduire la densité du mot-clé "\\$\\{keyword}" (actuellement \\$\\{density.toFixed(2)}%)\\\`)
      }
    })
    
    if (analysis.wordCount < 300) {
      analysis.recommendations.push('Augmenter la longueur du contenu (minimum 300 mots)')
    }
    
    return analysis
  }
}</code></pre>
      </div>
      
      <h3>4. SEO International et Multilingue</h3>
      <p>Stratégies pour optimiser le référencement international.</p>
      
      <div class="code-example">
        <pre><code>// app/[locale]/layout.js
export async function generateMetadata({ params }) {
  const locale = params.locale
  // Assuming getLocalizedSiteName is defined elsewhere
  // const getLocalizedSiteName = (locale) => \`Mon Site \${locale.toUpperCase()}\`;

  return {
    alternates: {
      canonical: \\\`\\$\\{process.env.NEXT_PUBLIC_BASE_URL}/\\$\\{locale}\\\`,
      languages: {
        'fr': \\\`\\$\\{process.env.NEXT_PUBLIC_BASE_URL}/fr\\\`,
        'en': \\\`\\$\\{process.env.NEXT_PUBLIC_BASE_URL}/en\\\`,
        'es': \\\`\\$\\{process.env.NEXT_PUBLIC_BASE_URL}/es\\\`,
        'x-default': \\\`\\$\\{process.env.NEXT_PUBLIC_BASE_URL}/fr\\\`
      }
    },
    other: {
      'Content-Language': locale,
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        // name: getLocalizedSiteName(locale),
        url: \\\`\\$\\{process.env.NEXT_PUBLIC_BASE_URL}/\\$\\{locale}\\\`,
        inLanguage: locale,
        potentialAction: {
          '@type': 'SearchAction',
          target: \\\`\\$\\{process.env.NEXT_PUBLIC_BASE_URL}/\\$\\{locale}/search?q={search_term_string}\\\`,
          'query-input': 'required name=search_term_string'
        }
      })
    }
  }
}

// middleware.js
import { NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['fr', 'en', 'es']
const defaultLocale = 'fr'

function getLocale(request) {
  const acceptedLanguage = request.headers.get('accept-language') ?? undefined
  const headers = { 'accept-language': acceptedLanguage }
  const languages = new Negotiator({ headers }).languages()
  
  return match(languages, locales, defaultLocale)
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  const pathnameIsMissingLocale = locales.every(
    locale => !pathname.startsWith(\\\`/\${locale}/\\\`) && pathname !== \\\`/\${locale}\\\`
  )
  
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    
    return NextResponse.redirect(
      new URL(\\\`/\${locale}\${pathname}\\\`, request.url),
      { status: 301 } 
    )
  }
}</code></pre>
      </div>
    `,

    practicalExample: {
      title: 'Système SEO Complet pour E-commerce',
      code: `// app/products/[slug]/page.js
import { StructuredDataManager } from '../../../lib/structured-data'
// import { SEOOptimizer } from '../../../lib/seo-optimizer' // SEOOptimizer not used in this snippet
import { getProduct, getRelatedProducts, getProductReviews } from '../../../lib/products'

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug)
  
  if (!product) {
    return {
      title: 'Produit introuvable',
      robots: { index: false, follow: false }
    }
  }
  
  const reviews = await getProductReviews(product.id)
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0
  
  return {
    title: \\\`\\$\\{product.name} - Achat en ligne | Ma Boutique\\\`,
    description: \\\`\\$\\{product.description.substring(0, 160)}. Livraison gratuite. Retour 30 jours.\\\`,
    
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map(img => ({
        url: img.url,
        width: img.width,
        height: img.height,
        alt: \\\`\\$\\{product.name} - \\$\\{img.alt}\\\`
      })),
      type: 'product',
      locale: 'fr_FR'
    },
    
    other: {
      'product:price:amount': product.price,
      'product:price:currency': 'EUR',
      'product:availability': product.inStock ? 'instock' : 'oos',
      'application/ld+json': JSON.stringify([
        StructuredDataManager.generateProduct({
          ...product,
          rating: { average: averageRating, count: reviews.length },
          reviews: reviews.slice(0, 5) // Assuming reviews is an array
        }),
        StructuredDataManager.generateBreadcrumb([
          { name: 'Accueil', url: '/' },
          { name: 'Produits', url: '/products' },
          { name: product.category, url: \\\`/category/\\$\\{product.categorySlug}\\\` },
          { name: product.name, url: \\\`/products/\\$\\{product.slug}\\\` }
        ])
      ])
    }
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug)
  const relatedProducts = await getRelatedProducts(product.id, 4)
  const reviews = await getProductReviews(product.id)
  
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(StructuredDataManager.generateFAQ([
            {
              question: "Quelle est la garantie de ce produit ?",
              answer: "Ce produit bénéficie d'une garantie de 2 ans."
            },
            {
              question: "Quels sont les délais de livraison ?",
              answer: "Livraison sous 24-48h en France métropolitaine."
            }
          ]))
        }}
      />
      
      {/* Assuming ProductDetails, ProductReviews, RelatedProducts are defined components */}
      {/* <ProductDetails product={product} /> */}
      {/* <ProductReviews reviews={reviews} /> */}
      {/* <RelatedProducts products={relatedProducts} /> */}
    </div>
  )
}`,
      explanation:
        'Cet exemple montre une page produit optimisée SEO avec métadonnées complètes, données structurées et FAQ intégrée.'
    },

    exercise: {
      question:
        'Quelle est la meilleure pratique pour les métadonnées Open Graph ?',
      options: [
        'Utiliser les mêmes métadonnées pour toutes les pages',
        'Créer des métadonnées spécifiques et contextuelles pour chaque page',
        "Ne pas utiliser d'images Open Graph",
        'Utiliser seulement le titre et la description'
      ],
      correctAnswer: 1,
      explanation:
        "Les métadonnées Open Graph doivent être spécifiques à chaque page pour maximiser l'engagement sur les réseaux sociaux et améliorer le référencement."
    },

    quiz: [
      {
        question: 'Que signifie JSON-LD dans le contexte du SEO ?',
        options: [
          'JavaScript Object Notation for Linked Data',
          'Java Standard Library for Data',
          'JSON Load Definition',
          'JavaScript Online Link Data'
        ],
        correctAnswer: 0
      },
      {
        question:
          'Quelle balise hreflang utiliser pour une page par défaut multilingue ?',
        options: ['x-default', 'default', 'auto', 'universal'],
        correctAnswer: 0
      }
    ],

    project: {
      title: 'Dashboard SEO Complet',
      description:
        'Créez un tableau de bord SEO qui analyse et optimise automatiquement le référencement de votre site.',
      initialCode: `// components/SEODashboard.js
export default function SEODashboard() {
  // À compléter
  return (
    <div>
      <h1>Dashboard SEO</h1>
      {/* Votre code ici */}
    </div>
  )
}`,
      solution: `// components/SEODashboard.js
import { useState, useEffect } from 'react'
// import { SEOOptimizer } from '../lib/seo-optimizer' // Assuming SEOOptimizer exists
// import { StructuredDataManager } from '../lib/structured-data' // Assuming StructuredDataManager exists

export default function SEODashboard() {
  const [seoData, setSeoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  useEffect(() => {
    fetchSEOData()
  }, [])
  
  const fetchSEOData = async () => {
    try {
      // Mock API call for demonstration
      // const response = await fetch('/api/seo/analytics')
      // const data = await response.json()
      const data = { // Mock data
        globalScore: 75,
        indexedPages: 150,
        errors: [{id: 1, title: "Missing meta description", pageId: "p1"}],
        recommendations: [{title: "Improve page speed", description: "Page X is slow", pageId: "p1", priority: "high"}],
        recentActivity: [{date: "2023-10-26", action: "Sitemap updated", impact: "+5 indexed"}],
        pages: [{id: "p1", title: "Homepage", url: "/", seoScore: 80, monthlyVisits: 1200, keywordCount: 5}],
        keywords: [{term: "Next.js SEO", searchVolume: 1000, position: 3, difficulty: "medium", trend: "up"}],
        sitemap: {lastGenerated: "2023-10-25", urlCount: 150},
        structuredData: [{type: "Product", count: 50, valid: true}],
        technicalIssues: [{title: "Broken internal links", description: "Found 3 broken links", affectedPages: 3, severity: "medium"}]
      };
      setSeoData(data)
    } catch (error) {
      console.error('Erreur chargement données SEO:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const generateSitemap = async () => {
    try {
      // const response = await fetch('/api/seo/generate-sitemap', { method: 'POST' })
      // if (response.ok) {
      //   alert('Sitemap généré avec succès!')
      //   fetchSEOData()
      // }
      alert('Sitemap generation requested (mocked).');
      fetchSEOData(); // refresh data
    } catch (error) {
      console.error('Erreur génération sitemap:', error)
    }
  }
  
  const optimizePage = async (pageId) => {
    try {
      // const response = await fetch(\`/api/seo/optimize/\${pageId}\`, { method: 'POST' })
      // if (response.ok) {
      //   alert('Page optimisée!')
      //   fetchSEOData()
      // }
      alert(\`Page \${pageId} optimization requested (mocked).\`);
      fetchSEOData(); // refresh data
    } catch (error) {
      console.error('Erreur optimisation:', error)
    }
  }
  
  if (loading) {
    return <div className="loading">Chargement des données SEO...</div>
  }
  
  return (
    <div className="seo-dashboard">
      <header>
        <h1>Dashboard SEO</h1>
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Score SEO Global</h3>
            <div className="score">{seoData?.globalScore || 0}/100</div>
          </div>
          <div className="stat-card">
            <h3>Pages Indexées</h3>
            <div className="count">{seoData?.indexedPages || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Erreurs SEO</h3>
            <div className="errors">{seoData?.errors?.length || 0}</div>
          </div>
        </div>
      </header>
      
      <nav className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={activeTab === 'pages' ? 'active' : ''}
          onClick={() => setActiveTab('pages')}
        >
          Analyse des pages
        </button>
        <button 
          className={activeTab === 'keywords' ? 'active' : ''}
          onClick={() => setActiveTab('keywords')}
        >
          Mots-clés
        </button>
        <button 
          className={activeTab === 'technical' ? 'active' : ''}
          onClick={() => setActiveTab('technical')}
        >
          SEO Technique
        </button>
      </nav>
      
      <main>
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <section className="recommendations">
              <h2>Recommandations prioritaires</h2>
              {seoData?.recommendations?.map((rec, index) => (
                <div key={index} className={\`recommendation \${rec.priority}\`}>
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                  <button onClick={() => optimizePage(rec.pageId)}>
                    Optimiser automatiquement
                  </button>
                </div>
              ))}
            </section>
            
            <section className="recent-activity">
              <h2>Activité récente</h2>
              {seoData?.recentActivity?.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="date">{activity.date}</span>
                  <span className="action">{activity.action}</span>
                  <span className="impact">{activity.impact}</span>
                </div>
              ))}
            </section>
          </div>
        )}
        
        {activeTab === 'pages' && (
          <div className="pages-tab">
            <h2>Analyse des pages</h2>
            <div className="page-list">
              {seoData?.pages?.map((page, index) => (
                <div key={index} className="page-item">
                  <div className="page-info">
                    <h4>{page.title}</h4>
                    <p className="url">{page.url}</p>
                  </div>
                  <div className="page-metrics">
                    <span className="score">SEO: {page.seoScore}/100</span>
                    <span className="traffic">Trafic: {page.monthlyVisits}</span>
                    <span className="keywords">Mots-clés: {page.keywordCount}</span>
                  </div>
                  <div className="page-actions">
                    <button onClick={() => optimizePage(page.id)}>
                      Optimiser
                    </button>
                    <button onClick={() => window.open(page.url, '_blank')}>
                      Voir la page
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'keywords' && (
          <div className="keywords-tab">
            <h2>Analyse des mots-clés</h2>
            <div className="keyword-tracking">
              {seoData?.keywords?.map((keyword, index) => (
                <div key={index} className="keyword-item">
                  <div className="keyword-info">
                    <h4>{keyword.term}</h4>
                    <span className="volume">Volume: {keyword.searchVolume}</span>
                  </div>
                  <div className="keyword-metrics">
                    <span className="position">Position: {keyword.position}</span>
                    <span className="difficulty">Difficulté: {keyword.difficulty}</span>
                    <span className={\`trend \${keyword.trend}\`}>
                      {keyword.trend === 'up' ? '↗️' : keyword.trend === 'down' ? '↘️' : '→'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'technical' && (
          <div className="technical-tab">
            <h2>SEO Technique</h2>
            
            <section className="sitemap-section">
              <h3>Sitemap</h3>
              <div className="sitemap-info">
                <p>Dernière génération: {seoData?.sitemap?.lastGenerated}</p>
                <p>URLs incluses: {seoData?.sitemap?.urlCount}</p>
                <button onClick={generateSitemap}>
                  Régénérer le sitemap
                </button>
              </div>
            </section>
            
            <section className="structured-data">
              <h3>Données structurées</h3>
              <div className="schema-types">
                {seoData?.structuredData?.map((schema, index) => (
                  <div key={index} className="schema-item">
                    <span className="type">{schema.type}</span>
                    <span className="count">{schema.count} pages</span>
                    <span className={\`status \${schema.valid ? 'valid' : 'invalid'}\`}>
                      {schema.valid ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="performance-issues">
              <h3>Problèmes techniques</h3>
              {seoData?.technicalIssues?.map((issue, index) => (
                <div key={index} className={\`issue \${issue.severity}\`}>
                  <h4>{issue.title}</h4>
                  <p>{issue.description}</p>
                  <span className="affected">Pages affectées: {issue.affectedPages}</span>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

// Styles CSS (à ajouter dans un fichier séparé)
const styles = \\\`
.seo-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif; /* Added basic font */
}

.loading { /* Added loading style */
  text-align: center;
  padding: 50px;
  font-size: 1.2em;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 { /* Added style */
  margin-top: 0;
  font-size: 1em;
  color: #555;
}

.stat-card .score, .stat-card .count, .stat-card .errors { /* Added style */
  font-size: 1.8em;
  font-weight: bold;
  color: #333;
}


.tabs {
  border-bottom: 2px solid #e1e5e9;
  margin-bottom: 30px;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1em; /* Added style */
  border-bottom: 3px solid transparent; /* Adjusted for better visual */
  margin-right: 5px; /* Added style */
}

.tabs button.active {
  border-bottom-color: #0070f3;
  color: #0070f3;
  font-weight: bold; /* Added style */
}

.recommendation, .activity-item, .page-item, .keyword-item, .sitemap-info, .schema-item, .issue { /* Added general padding */
  background: #f9f9f9;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  border-left: 4px solid #ccc; /* Default border */
}

.recommendation.high {
  border-left-color: #ff4757;
  background: #fff5f5;
}

.recommendation.medium {
  border-left-color: #ffa502;
  background: #fffbf0;
}

.recommendation.low {
  border-left-color: #2ed573;
  background: #f0fff4;
}

/* Added some more styles for readability */
h1, h2, h3, h4 {
  color: #333;
}
section {
  margin-bottom: 25px;
}
button {
  padding: 8px 15px;
  border: 1px solid #0070f3;
  background-color: #0070f3;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}
button:hover {
  background-color: #005bb5;
}
.page-item, .keyword-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.trend {
  font-size: 1.2em;
}
.status.valid { color: green; }
.status.invalid { color: red; }
.issue.high { border-left-color: #ff4757; }
.issue.medium { border-left-color: #ffa502; }
.issue.low { border-left-color: #2ed573; }

\\\`
` // IMPORTANT: This is the closing backtick for the 'solution' template literal
    }
  }
}

export default lesson1
