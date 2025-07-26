"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import CountdownComponent from "../common/Countdown";

const fallbackImage = "/images/products/placeholder-1.jpg";

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const {
    id = "",
    imgSrc = "",
    imgHoverSrc = "",
    soldOut = false,
    countdown = false,
    sizes = [],
    title = "Produit",
    price = 0,
    colors = [],
  } = product;

  const [currentImage, setCurrentImage] = useState(
    imgSrc && imgSrc.trim() !== "" ? imgSrc : fallbackImage
  );

  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  useEffect(() => {
    setCurrentImage(imgSrc && imgSrc.trim() !== "" ? imgSrc : fallbackImage);
  }, [imgSrc]);

  const safeSrc = (src) => {
    return src && src.trim() !== "" ? src : fallbackImage;
  };

  return (
    <div className="card-product fl-item" key={id}>
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${id}`} className="product-img">
          <Image
            className="img-product"
            src={safeSrc(currentImage)}
            alt={title}
            width={720}
            height={1005}
            style={{ width: "100%", height: "auto" }}
          />
          <Image
            className="img-hover"
            src={safeSrc(imgHoverSrc || currentImage)}
            alt={title}
            width={720}
            height={1005}
            style={{ width: "100%", height: "auto" }}
          />
        </Link>
        {soldOut ? (
          <div className="sold-out">
            <span>Sold out</span>
          </div>
        ) : (
          <>
            <div className="list-product-btn">
              <a
                href="#quick_add"
                onClick={() => setQuickAddItem(id)}
                data-bs-toggle="modal"
                className="box-icon bg_white quick-add tf-btn-loading"
              >
                🛒
              </a>
              <a
                onClick={() => addToWishlist(id)}
                className="box-icon bg_white wishlist btn-icon-action"
              >
                ❤️
              </a>
              <a
                href="#compare"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
                onClick={() => addToCompareItem(id)}
                className="box-icon bg_white compare btn-icon-action"
              >
                🔄
              </a>
              <a
                href="#quick_view"
                onClick={() => setQuickViewItem(product)}
                data-bs-toggle="modal"
                className="box-icon bg_white quickview tf-btn-loading"
              >
                👁️
              </a>
            </div>
            {countdown && (
              <div className="countdown-box">
                <CountdownComponent />
              </div>
            )}
            {sizes.length > 0 && (
              <div className="size-list">
                {sizes.map((size) => (
                  <span key={size}>{size}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${id}`} className="title link">
          {title}
        </Link>
        <span className="price">{price.toFixed(2)} €</span>
        {colors.length > 0 && (
          <ul className="list-color-product">
            {colors.map((color, i) => (
              <li
                key={i}
                className={`list-color-item color-swatch`}
                onMouseEnter={() =>
                  setCurrentImage(color.imgSrc && color.imgSrc.trim() !== "" ? color.imgSrc : fallbackImage)
                }
              >
                <span className="tooltip">{color.name}</span>
                <span className={`swatch-value ${color.colorClass}`} />
                <Image
                  src={safeSrc(color.imgSrc)}
                  alt={title}
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

export default ProductCard;
