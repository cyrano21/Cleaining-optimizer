"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import CountdownComponent from "../common/Countdown";
export const ProductCard = ({ product, viewMode = 'grid' }) => {
  const [currentImage, setCurrentImage] = useState(product.imgSrc || null);
  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();
  useEffect(() => {
    setCurrentImage(product.imgSrc || null);
  }, [product]);

  return (
    <div className={`card-product fl-item ${viewMode === 'list' ? 'card-product-list' : ''}`} key={product.id}>
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">          <Image
            className=" img-product"
            data-src={product.imgSrc}
            src={currentImage || "/images/placeholder.svg"}
            alt="image-product"
            width={720}
            height={1005}
            style={{ width: "100%", height: "auto" }}
          />
          <Image
            className=" img-hover"
            data-src={
              product.imgHoverSrc ? product.imgHoverSrc : product.imgSrc
            }
            src={(product.imgHoverSrc ? product.imgHoverSrc : product.imgSrc) || "/images/placeholder.svg"}
            alt="image-product"
            width={720}
            height={1005}
            style={{ width: "100%", height: "auto" }}
          />
        </Link>
        {product.soldOut ? (
          <div className="sold-out">
            <span>Sold out</span>
          </div>
        ) : (
          <>
            <div className="list-product-btn">
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
                aria-controls="offcanvasLeft"
                onClick={() => addToCompareItem(product.id)}
                className="box-icon bg_white compare btn-icon-action"
              >
                <span
                  className={`icon icon-compare ${
                    isAddedtoCompareItem(product.id) ? "added" : ""
                  }`}
                />
                <span className="tooltip">
                  {" "}
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
            {product.countdown && (
              <div className="countdown-box">
                <div className="js-countdown">
                  <CountdownComponent />
                </div>
              </div>
            )}
            {product.sizes && (
              <div className="size-list">
                {product.sizes.map((size) => (
                  <span key={size}>{size}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title || product.name}
        </Link>
        
        {/* Brand */}
        {product.brand && (
          <div className="product-brand">
            <span className="brand-text">{product.brand}</span>
          </div>
        )}
        
        {/* Category */}
        {product.category && (
          <div className="product-category">
            <span className="category-text">{product.category}</span>
          </div>
        )}
        
        {/* Rating */}
        {product.rating && (
          <div className="product-rating">
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="rating-text">({product.rating})</span>
            {product.reviewCount && (
              <span className="review-count">{product.reviewCount} avis</span>
            )}
          </div>
        )}
        
        {/* Price */}
        <div className="product-price">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          )}
          <span className="price">${product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="discount-percentage">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>
        
        {/* Stock Status */}
        <div className="stock-status">
          {product.inStock === false ? (
            <span className="out-of-stock">Rupture de stock</span>
          ) : (
            <span className="in-stock">En stock</span>
          )}
        </div>
        
        {/* Badges */}
        <div className="product-badges">
          {product.isNew && <span className="badge new-badge">Nouveau</span>}
          {product.isOnSale && <span className="badge sale-badge">Promo</span>}
          {product.isFeatured && <span className="badge featured-badge">Vedette</span>}
        </div>
        
        {/* Description */}
        {product.description && (
          <div className="product-description">
            <p className="description-text">{product.description.substring(0, 100)}...</p>
          </div>
        )}
        
        {/* Sizes */}
        {product.sizes && (
          <div className="size-list">
            <span className="size-label">Tailles:</span>
            {product.sizes.map((size) => (
              <span key={size} className="size-item">{size}</span>
            ))}
          </div>
        )}
        
        {/* Colors */}
        {product.colors && (
          <ul className="list-color-product">
            {product.colors.map((color, i) => (
              <li
                className={`list-color-item color-swatch ${
                  currentImage == color.imgSrc ? "active" : ""
                } `}
                key={i}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
              >
                <span className="tooltip">{color.name}</span>
                <span className={`swatch-value ${color.colorClass}`} />
                <Image
                  className=""
                  data-src={color.imgSrc}
                  src={color.imgSrc || "/images/placeholder.svg"}
                  alt="image-product"
                  width={720}
                  height={1005}
                  style={{ width: "100%", height: "auto" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
