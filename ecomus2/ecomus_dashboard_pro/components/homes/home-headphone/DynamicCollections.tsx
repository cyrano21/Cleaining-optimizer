'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { DynamicCollections } from '@/components/shared/DynamicCollections';

// Configuration spécifique pour les collections de casques
const headphoneCollectionsConfig = {
  featured: true,
  categorySlug: 'headphones', // Slug de la catégorie casques
  limit: 6,
  layout: 'carousel',
  variant: 'electronics'
};

export default function HeadphoneCollections() {
  return (
    <section className="flat-spacing-1">
      <div className="container">
        <div className="flat-title">
          <span className="title">Shop by Collections</span>
        </div>
        
        {/* Utilisation du composant DynamicCollections avec la configuration spécifique */}
        <DynamicCollections 
          config={headphoneCollectionsConfig}
          className="tf-sw-collection"
          renderCollection={(collection, index) => (
            <SwiperSlide key={collection._id || index}>
              <div className="collection-item style-left hover-img">
                <div className="collection-inner">
                  <Link
                    href={`/shop-collection-sub?collection=${collection.slug}`}
                    className="collection-image img-style"
                  >
                    <Image
                      className="lazyload"
                      data-src={collection.imgSrc}
                      alt={collection.altText || collection.title}
                      src={collection.imgSrc}
                      width={600}
                      height={721}
                    />
                  </Link>
                  <div className="collection-content">
                    <Link
                      href={`/shop-collection-sub?collection=${collection.slug}`}
                      className="tf-btn collection-title hover-icon fs-15"
                    >
                      <span>{collection.title}</span>
                      <i className="icon icon-arrow1-top-left" />
                    </Link>
                    {collection.description && (
                      <p className="collection-description">{collection.description}</p>
                    )}
                    {collection.price && (
                      <div className="collection-price">
                        {collection.originalPrice && (
                          <span className="price-original">${collection.originalPrice}</span>
                        )}
                        <span className="price-sale">${collection.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )}
          swiperOptions={{
            slidesPerView: 3,
            spaceBetween: 15,
            navigation: {
              clickable: true,
              nextEl: '.snbn1',
              prevEl: '.spbn1'
            },
            pagination: {
              el: '.sw-pagination-collection',
              clickable: true
            },
            breakpoints: {
              1024: {
                slidesPerView: 3,
                spaceBetween: 30
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 15
              },
              640: {
                slidesPerView: 1,
                spaceBetween: 15
              }
            }
          }}
          loadingComponent={
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading collections...</span>
              </div>
            </div>
          }
          errorComponent={(error) => (
            <div className="alert alert-warning text-center py-5">
              <i className="icon icon-warning me-2"></i>
              Unable to load collections. Please try again later.
            </div>
          )}
          emptyComponent={
            <div className="text-center py-5">
              <i className="icon icon-collection fa-3x text-muted mb-3"></i>
              <h6 className="text-muted">No collections available</h6>
              <p className="text-muted">Check back later for new collections.</p>
            </div>
          }
        />
        
        {/* Navigation et pagination pour le carousel */}
        <div className="nav-sw nav-next-slider nav-next-collection box-icon w_46 round">
          <span className="icon icon-arrow-left spbn1" />
          <span className="icon icon-arrow-right snbn1" />
        </div>
        <div className="sw-dots style-2 sw-pagination-collection justify-content-center" />
      </div>
    </section>
  );
}

// Composant de fallback pour maintenir la compatibilité avec l'ancien système
export function HeadphoneCollectionsFallback() {
  // Import des données statiques comme fallback
  const collections3 = [
    {
      id: 1,
      imgSrc: "/images/collections/collection-1.jpg",
      title: "Wireless Headphones",
      altText: "Wireless Headphones Collection"
    },
    {
      id: 2,
      imgSrc: "/images/collections/collection-2.jpg",
      title: "Gaming Headsets",
      altText: "Gaming Headsets Collection"
    },
    {
      id: 3,
      imgSrc: "/images/collections/collection-3.jpg",
      title: "Studio Monitors",
      altText: "Studio Monitors Collection"
    }
  ];

  return (
    <section className="flat-spacing-1">
      <div className="container">
        <div className="flat-title">
          <span className="title">Shop by Collections</span>
        </div>
        <div className="hover-sw-nav hover-sw-2">
          <Swiper
            className="tf-sw-collection"
            slidesPerView={3}
            spaceBetween={15}
            navigation={{
              clickable: true,
              nextEl: '.snbn1',
              prevEl: '.spbn1'
            }}
            pagination={{
              el: '.sw-pagination-collection',
              clickable: true
            }}
            breakpoints={{
              1024: {
                slidesPerView: 3,
                spaceBetween: 30
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 15
              },
              640: {
                slidesPerView: 1,
                spaceBetween: 15
              }
            }}
            modules={[Navigation, Pagination]}
          >
            {collections3.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="collection-item style-left hover-img">
                  <div className="collection-inner">
                    <Link
                      href="/shop-collection-sub"
                      className="collection-image img-style"
                    >
                      <Image
                        className="lazyload"
                        data-src={item.imgSrc}
                        alt={item.altText}
                        src={item.imgSrc}
                        width={600}
                        height={721}
                      />
                    </Link>
                    <div className="collection-content">
                      <Link
                        href="/shop-collection-sub"
                        className="tf-btn collection-title hover-icon fs-15"
                      >
                        <span>{item.title}</span>
                        <i className="icon icon-arrow1-top-left" />
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nav-sw nav-next-slider nav-next-collection box-icon w_46 round">
            <span className="icon icon-arrow-left spbn1" />
            <span className="icon icon-arrow-right snbn1" />
          </div>
          <div className="sw-dots style-2 sw-pagination-collection justify-content-center" />
        </div>
      </div>
    </section>
  );
}