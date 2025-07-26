"use client";

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';
import { ecomusApi } from '@/lib/ecomus-api';
import { logger } from '@/lib/logger';
import { usePerformanceMonitoring, measureAsync } from '@/lib/monitoring/performance-monitor';
import CollectionErrorBoundary from '@/components/error-boundaries/CollectionErrorBoundary';
import { safeValidateCollection } from '@/lib/validation/schemas';

// Interface pour les collections
interface Collection {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imgSrc?: string;
  image?: string;
  altText?: string;
  subheading?: string;
  heading?: string;
  price?: number;
  backgroundColor?: string;
  featured: boolean;
  isActive: boolean;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  itemCount?: number;
  storeId?: string;
}

// Interface pour la configuration du composant
interface CollectionsConfig {
  variant?: 'fashion' | 'cosmetic' | 'electronic' | 'furniture' | 'headphone' | 'plant' | 'gaming' | 'book' | 'default';
  layout?: 'grid' | 'carousel' | 'circle' | 'banner';
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
  slidesPerView?: number;
  spaceBetween?: number;
  featured?: boolean;
  limit?: number;
  categoryId?: string;
  storeId?: string;
  className?: string;
  breakpoints?: {
    [key: number]: {
      slidesPerView: number;
      spaceBetween?: number;
    };
  };
}

// Configuration par défaut pour chaque variante
const variantConfigs: Record<string, Partial<CollectionsConfig>> = {
  fashion: {
    layout: 'grid',
    slidesPerView: 4,
    spaceBetween: 30,
    breakpoints: {
      768: { slidesPerView: 4 },
      576: { slidesPerView: 2 },
      0: { slidesPerView: 1 }
    }
  },
  cosmetic: {
    layout: 'carousel',
    slidesPerView: 3,
    spaceBetween: 20,
    breakpoints: {
      768: { slidesPerView: 3 },
      576: { slidesPerView: 2 },
      0: { slidesPerView: 1 }
    }
  },
  electronic: {
    layout: 'carousel',
    slidesPerView: 4,
    spaceBetween: 30,
    breakpoints: {
      768: { slidesPerView: 4 },
      576: { slidesPerView: 2 },
      0: { slidesPerView: 1 }
    }
  },
  headphone: {
    layout: 'circle',
    slidesPerView: 6,
    spaceBetween: 30,
    breakpoints: {
      768: { slidesPerView: 6 },
      576: { slidesPerView: 4 },
      0: { slidesPerView: 2 }
    }
  },
  furniture: {
    layout: 'grid',
    slidesPerView: 3,
    spaceBetween: 30,
    breakpoints: {
      768: { slidesPerView: 3 },
      576: { slidesPerView: 2 },
      0: { slidesPerView: 1 }
    }
  },
  plant: {
    layout: 'carousel',
    slidesPerView: 4,
    spaceBetween: 30,
    breakpoints: {
      768: { slidesPerView: 4 },
      576: { slidesPerView: 2 },
      0: { slidesPerView: 1 }
    }
  },
  gaming: {
    layout: 'carousel',
    slidesPerView: 3,
    spaceBetween: 30,
    breakpoints: {
      768: { slidesPerView: 3 },
      576: { slidesPerView: 2 },
      0: { slidesPerView: 1 }
    }
  },
  book: {
    layout: 'carousel',
    slidesPerView: 4,
    spaceBetween: 20,
    breakpoints: {
      768: { slidesPerView: 4 },
      576: { slidesPerView: 2 },
      0: { slidesPerView: 1 }
    }
  },
  default: {
    layout: 'carousel',
    slidesPerView: 3,
    spaceBetween: 30,
    breakpoints: {
      768: { slidesPerView: 3 },
      576: { slidesPerView: 2 },
      0: { slidesPerView: 1 }
    }
  }
};

interface DynamicCollectionsProps {
  config?: CollectionsConfig;
  store?: {
    id: string;
    name: string;
    slug: string;
  };
}

function DynamicCollectionsInner({ config = {}, store }: DynamicCollectionsProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Monitoring des performances
  const { startRender, endRender, recordMount, recordError } = usePerformanceMonitoring('DynamicCollections');

  // Fusionner la configuration avec les valeurs par défaut de la variante
  const variant = config.variant || 'default';
  const mergedConfig = {
    ...variantConfigs[variant],
    ...config,
    showTitle: config.showTitle !== false,
    showNavigation: config.showNavigation !== false,
    showPagination: config.showPagination !== false
  };

  useEffect(() => {
    fetchCollections();
  }, [config.featured, config.categoryId, config.storeId, config.limit]);

  const fetchCollections = async () => {
    const operationId = `dynamic-collections-${Date.now()}`;
    
    try {
      startRender();
      setLoading(true);
      setError(null);

      const params: any = {
        status: 'active',
        limit: mergedConfig.limit || 10
      };

      if (mergedConfig.featured !== undefined) {
        params.featured = mergedConfig.featured;
      }

      if (mergedConfig.categoryId) {
        params.category = mergedConfig.categoryId;
      }

      if (mergedConfig.storeId || store?.id) {
        params.storeId = mergedConfig.storeId || store?.id;
      }
      
      logger.info('Fetching collections for dynamic component', {
        component: 'DynamicCollections',
        variant: mergedConfig.variant,
        params,
        storeId: store?.id
      });

      const response = await measureAsync(
        'dynamic-collections.fetch',
        () => ecomusApi.getPublicCollections(params)
      );
      
      if (response.success && response.data) {
        // Validation des données reçues
        const validatedCollections = response.data.map((collection: any) => {
          const validation = safeValidateCollection(collection);
          if (!validation.success) {
            logger.warn('Invalid collection data in dynamic component', {
              component: 'DynamicCollections',
              collectionId: collection._id,
              errors: validation.error.errors
            });
            return collection; // Retourner les données non validées en cas d'erreur
          }
          return validation.data;
        });
        
        setCollections(validatedCollections);
        endRender();
        
        logger.info('Collections loaded successfully in dynamic component', {
          component: 'DynamicCollections',
          count: validatedCollections.length,
          variant: mergedConfig.variant
        });
      } else {
        const errorMessage = 'Erreur lors du chargement des collections';
        setError(errorMessage);
        recordError(errorMessage);
        logger.error('Failed to load collections in dynamic component', {
          component: 'DynamicCollections',
          error: response.error || errorMessage,
          params
        });
      }
    } catch (err: any) {
      const errorMessage = 'Erreur de connexion';
      setError(errorMessage);
      recordError(err.message);
      logger.error('Exception while loading collections in dynamic component', {
        component: 'DynamicCollections',
        error: err.message,
        stack: err.stack,
        params
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCollectionItem = (collection: Collection, index: number) => {
    const imageUrl = collection.imgSrc || collection.image || '/images/collections/default-collection.jpg';
    const altText = collection.altText || collection.title;
    const linkUrl = `/collections/${collection.slug || collection._id}`;

    if (mergedConfig.layout === 'circle') {
      return (
        <div className="collection-item-circle has-bg hover-img" key={collection._id}>
          <Link href={linkUrl} className="collection-image img-style">
            <Image
              src={imageUrl}
              alt={altText}
              width={124}
              height={125}
              style={{ width: "100%", height: "auto" }}
            />
          </Link>
          <div className="collection-content text-center">
            <Link href={linkUrl} className="link title fw-6">
              {collection.title}
            </Link>
          </div>
        </div>
      );
    }

    if (mergedConfig.layout === 'banner') {
      return (
        <div className="collection-item-banner" key={collection._id}>
          <div className="collection-inner" style={{ backgroundColor: collection.backgroundColor }}>
            <div className="collection-image">
              <Link href={linkUrl}>
                <Image
                  src={imageUrl}
                  alt={altText}
                  width={300}
                  height={200}
                  style={{ width: "100%", height: "auto" }}
                />
              </Link>
            </div>
            <div className="collection-content">
              {collection.subheading && (
                <p className="subheading">{collection.subheading}</p>
              )}
              <h3 className="heading">
                <Link href={linkUrl}>{collection.heading || collection.title}</Link>
              </h3>
              {collection.description && (
                <p className="description">{collection.description}</p>
              )}
              {collection.price && (
                <p className="price">${collection.price}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Layout par défaut (grid/carousel)
    return (
      <div className="collection-item" key={collection._id}>
        <div className="collection-inner">
          <div className="collection-image">
            <Link href={linkUrl}>
              <Image
                src={imageUrl}
                alt={altText}
                width={300}
                height={200}
                style={{ width: "100%", height: "auto" }}
              />
            </Link>
          </div>
          <div className="collection-content">
            <h3 className="title">
              <Link href={linkUrl}>{collection.title}</Link>
            </h3>
            {collection.description && (
              <p className="description">{collection.description}</p>
            )}
            {collection.itemCount && (
              <p className="item-count">{collection.itemCount} articles</p>
            )}
            {collection.category && (
              <p className="category">{collection.category.name}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className={`flat-spacing-10 ${mergedConfig.className || ''}`}>
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement des collections...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`flat-spacing-10 ${mergedConfig.className || ''}`}>
        <div className="container">
          <div className="alert alert-warning text-center">
            <p className="mb-0">{error}</p>
            <button 
              className="btn btn-outline-primary btn-sm mt-2" 
              onClick={fetchCollections}
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!collections.length) {
    return (
      <section className={`flat-spacing-10 ${mergedConfig.className || ''}`}>
        <div className="container">
          <div className="text-center">
            <p className="text-muted">Aucune collection disponible pour le moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const sectionClass = mergedConfig.layout === 'circle' 
    ? 'flat-spacing-10 flat-testimonial'
    : 'flat-spacing-10';

  return (
    <section className={`${sectionClass} ${mergedConfig.className || ''}`}>
      <div className="container">
        {mergedConfig.showTitle && (mergedConfig.title || mergedConfig.subtitle) && (
          <div className="flat-title text-center">
            {mergedConfig.subtitle && (
              <span className="subtitle wow fadeInUp" data-wow-delay="0s">
                {mergedConfig.subtitle}
              </span>
            )}
            {mergedConfig.title && (
              <span className="title wow fadeInUp" data-wow-delay="0s">
                {mergedConfig.title}
              </span>
            )}
          </div>
        )}

        {mergedConfig.layout === 'grid' ? (
          <div className="row">
            {collections.map((collection, index) => (
              <div key={collection._id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                {renderCollectionItem(collection, index)}
              </div>
            ))}
          </div>
        ) : (
          <div className="wrap-carousel">
            <Swiper
              dir="ltr"
              slidesPerView={mergedConfig.slidesPerView}
              spaceBetween={mergedConfig.spaceBetween}
              breakpoints={mergedConfig.breakpoints}
              modules={[Navigation, Pagination]}
              navigation={mergedConfig.showNavigation ? {
                prevEl: `.snbp-${variant}`,
                nextEl: `.snbn-${variant}`,
              } : false}
              pagination={mergedConfig.showPagination ? {
                clickable: true,
                el: `.spd-${variant}`
              } : false}
              className="tf-sw-collections"
            >
              {collections.map((collection, index) => (
                <SwiperSlide key={collection._id}>
                  {renderCollectionItem(collection, index)}
                </SwiperSlide>
              ))}
            </Swiper>
            
            {mergedConfig.showNavigation && (
              <>
                <div className={`nav-sw nav-next-slider nav-next-collections lg snbp-${variant}`}>
                  <span className="icon icon-arrow-left" />
                </div>
                <div className={`nav-sw nav-prev-slider nav-prev-collections lg snbn-${variant}`}>
                  <span className="icon icon-arrow-right" />
                </div>
              </>
            )}
            
            {mergedConfig.showPagination && (
              <div className={`sw-dots style-2 sw-pagination-collections justify-content-center spd-${variant}`} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Composant principal avec Error Boundary
const DynamicCollections: React.FC<DynamicCollectionsProps> = (props) => {
  return (
    <CollectionErrorBoundary>
      <DynamicCollectionsInner {...props} />
    </CollectionErrorBoundary>
  );
};

// Export des configurations prédéfinies pour faciliter l'utilisation
export const CollectionsVariants = {
  Fashion: (props: Omit<DynamicCollectionsProps, 'config'> & { config?: Partial<CollectionsConfig> }) => (
    <DynamicCollections {...props} config={{ variant: 'fashion', ...props.config }} />
  ),
  Cosmetic: (props: Omit<DynamicCollectionsProps, 'config'> & { config?: Partial<CollectionsConfig> }) => (
    <DynamicCollections {...props} config={{ variant: 'cosmetic', ...props.config }} />
  ),
  Electronic: (props: Omit<DynamicCollectionsProps, 'config'> & { config?: Partial<CollectionsConfig> }) => (
    <DynamicCollections {...props} config={{ variant: 'electronic', ...props.config }} />
  ),
  Headphone: (props: Omit<DynamicCollectionsProps, 'config'> & { config?: Partial<CollectionsConfig> }) => (
    <DynamicCollections {...props} config={{ variant: 'headphone', ...props.config }} />
  ),
  Furniture: (props: Omit<DynamicCollectionsProps, 'config'> & { config?: Partial<CollectionsConfig> }) => (
    <DynamicCollections {...props} config={{ variant: 'furniture', ...props.config }} />
  ),
  Plant: (props: Omit<DynamicCollectionsProps, 'config'> & { config?: Partial<CollectionsConfig> }) => (
    <DynamicCollections {...props} config={{ variant: 'plant', ...props.config }} />
  ),
  Gaming: (props: Omit<DynamicCollectionsProps, 'config'> & { config?: Partial<CollectionsConfig> }) => (
    <DynamicCollections {...props} config={{ variant: 'gaming', ...props.config }} />
  ),
  Book: (props: Omit<DynamicCollectionsProps, 'config'> & { config?: Partial<CollectionsConfig> }) => (
    <DynamicCollections {...props} config={{ variant: 'book', ...props.config }} />
  )
};

export default DynamicCollections;