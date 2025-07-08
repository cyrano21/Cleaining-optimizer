"use client";
import Image from "next/image";
import { products15 } from "@/data/products";
import { useContextElement } from "@/context/Context";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Navigation } from "swiper/modules";

export default function Products({ 
  products: apiProducts, 
  title = "Trending Products",
  limit = 12,
  showFilters = false,
  categoryId 
}) {
  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  // Utiliser les produits de l'API en priorité, sinon fallback vers les données statiques
  const rawProducts = apiProducts?.products || products15;
  
  // Appliquer la limite si spécifiée
  const limitedProducts = limit ? rawProducts.slice(0, limit) : rawProducts;
  
  // Mapper les produits pour s'assurer que imgSrc et imgHoverSrc sont disponibles
  const productsToShow = limitedProducts.map(product => ({
    ...product,
    imgSrc: product.imgSrc || (product.images && product.images[0]) || '/images/placeholder.jpg',
    imgHoverSrc: product.imgHoverSrc || (product.images && product.images[1]) || (product.images && product.images[0]) || '/images/placeholder.jpg'
  }));

  console.log('🔧 Home-Electronic Products - API products:', apiProducts);
  console.log('🔧 Home-Electronic Products - Raw products:', rawProducts);
  console.log('🔧 Home-Electronic Products - Mapped products:', productsToShow);

  return (
    <section className="flat-spacing-19">
      <div className="container">
        <div className="flat-title flex-row justify-content-between px-0">
          <span className="title wow fadeInUp" data-wow-delay="0s">
            {title}
          </span>
          <div className="box-sw-navigation">
            <div className="nav-sw square nav-next-slider nav-next-sell-1 snbp161">
              <span className="icon icon-arrow1-left" />
            </div>
            <div className="nav-sw square nav-prev-slider nav-prev-sell-1 snbn161">
              <span className="icon icon-arrow1-right" />
            </div>
          </div>
        </div>
        <div className="hover-sw-nav hover-sw-2">
          <div className="swiper tf-sw-product-sell-1 wrap-sw-over">
            <Swiper
              dir="ltr"
              slidesPerView={4}
              spaceBetween={30}
              breakpoints={{
                1100: {
                  slidesPerView: 4,
                },
                768: {
                  slidesPerView: 3,
                },

                640: {
                  slidesPerView: 2,
                },
                0: {
                  slidesPerView: 2,
                },
              }}
              className="swiper-wrapper"
              modules={[Navigation]}
              navigation={{
                prevEl: ".snbp161",
                nextEl: ".snbn161",
              }}
            >
              {productsToShow.map((product, index) => (
                <SwiperSlide className="swiper-slide height-auto" key={index}>
                  <div className="card-product overflow-hidden bg_white radius-20 border-line h-100">
                    <div className="card-product-wrapper">
                      <Link
                        href={`/product-detail/${product.id}`}
                        className="product-img"
                      >
                        <Image
                          className="lazyload img-product"
                          src={product.imgSrc}
                          alt="image-product"
                          width={360}
                          height={360}
 style={{ width: "100%", height: "auto" }}                         />
                        <Image
                          className="lazyload img-hover"
                          src={product.imgHoverSrc}
                          alt="image-product"
                          width={360}
                          height={360}
 style={{ width: "100%", height: "auto" }}                         />
                      </Link>
                      <div className="list-product-btn absolute-2">
                        <a
                          href="#quick_add"
                          onClick={() => setQuickAddItem(product.id)}
                          data-bs-toggle="modal"
                          className="box-icon bg_white quick-add tf-btn-loading"
                        >
                          <span className="icon icon-bag" />
                          <span className="tooltip">Quick Add</span>
                        </a>
                        <a
                          onClick={() => addToWishlist(product.id)}
                          className="box-icon bg_white wishlist btn-icon-action"
                        >
                          <span
                            className={`icon icon-heart ${
                              isAddedtoWishlist(product.id) ? "added" : ""
                            }`}
                          />
                          <span className="tooltip">
                            {isAddedtoWishlist(product.id)
                              ? "Already Wishlisted"
                              : "Add to Wishlist"}
                          </span>
                          <span className="icon icon-delete" />
                        </a>
                        <a
                          href="#compare"
                          data-bs-toggle="offcanvas"
                          onClick={() => addToCompareItem(product.id)}
                          aria-controls="offcanvasLeft"
                          className="box-icon bg_white compare btn-icon-action"
                        >
                          <span
                            className={`icon icon-compare ${
                              isAddedtoCompareItem(product.id) ? "added" : ""
                            }`}
                          />
                          <span className="tooltip">
                            {isAddedtoCompareItem(product.id)
                              ? "Already Compared"
                              : "Add to Compare"}
                          </span>
                          <span className="icon icon-check" />
                        </a>
                        <a
                          href="#quick_view"
                          onClick={() => setQuickViewItem(product)}
                          data-bs-toggle="modal"
                          className="box-icon bg_white quickview tf-btn-loading"
                        >
                          <span className="icon icon-view" />
                          <span className="tooltip">Quick View</span>
                        </a>
                      </div>
                    </div>
                    <div className="card-product-info has-padding">
                      <Link
                        href={`/product-detail/${product.id}`}
                        className="title link"
                      >
                        {product.title}
                      </Link>
                      {product.oldPrice ? (
                        <span className="price">
                          <span className="old-price">{product.oldPrice}</span>
                          <span className="new-price">
                            ${product.price.toFixed(2)}
                          </span>
                        </span>
                      ) : (
                        <span className="price">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
