"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
export default function Productcard23({ product }) {
  const safeSrc = (src) => {
    return src && src.trim() !== "" ? src : "/images/products/placeholder-1.jpg";
  };
  
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const { setQuickViewItem } = useContextElement();
  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();
  return (
    <div className="card-product list-layout">
      <div className="card-product-wrapper">
        <a href="#" className="product-img">
          <Image
            className=" img-product"
            alt="image-product"
            src={safeSrc(currentImage)}
            width={720}
            height={1005}
 style={{ width: "100%", height: "auto" }}           />
          <Image
            className=" img-hover"
            alt="image-product"
            src={safeSrc(product.imgHoverSrc || currentImage)}
            width={720}
            height={1005}
 style={{ width: "100%", height: "auto" }}           />
        </a>
      </div>
      <div className="card-product-info">
        <a href="#" className="title link">
          {product.title}
        </a>
        <span className="price">${product.price.toFixed(2)}</span>
        <p className="description">
          Button-up shirt sleeves and a relaxed silhouette. It’s tailored with
          drapey, crinkle-texture fabric that’s made from LENZING™ ECOVERO™
          Viscose — responsibly sourced wood-based fibres produced through a
          process that reduces...
        </p>
        {product.colors && (
          <ul className="list-color-product">
            {product.colors.map((color) => (
              <li
                className={`list-color-item color-swatch ${
                  currentImage == color.imgSrc ? "active" : ""
                } `}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
                key={color.name}
              >
                <span className="tooltip">{color.name}</span>
                <span className={`swatch-value ${color.colorClass}`} />
                <Image
                  className=""
                  data-src={color.imgSrc}
                  src={safeSrc(color.imgSrc)}
                  alt="image-product"
                  width={720}
                  height={1005}
 style={{ width: "100%", height: "auto" }}                 />
              </li>
            ))}
          </ul>
        )}
        {product.sizes && (
          <div className="size-list">
            {product.sizes.map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
        )}
        <div className="list-product-btn">
          <a
            href="#quick_add"
            onClick={() => setQuickAddItem(product.id)}
            data-bs-toggle="modal"
            className="box-icon quick-add style-3 hover-tooltip"
          >
            <span className="icon icon-bag" />
            <span className="tooltip">Quick add</span>
          </a>
          <a
            onClick={() => addToWishlist(product.id)}
            className="box-icon wishlist style-3 hover-tooltip"
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
          </a>

          <a
            href="#compare"
            data-bs-toggle="offcanvas"
            aria-controls="offcanvasLeft"
            onClick={() => addToCompareItem(product.id)}
            className="box-icon compare style-3 hover-tooltip"
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
          </a>
          <a
            href="#quick_view"
            onClick={() => setQuickViewItem(product)}
            data-bs-toggle="modal"
            className="box-icon quickview style-3 hover-tooltip"
          >
            <span className="icon icon-view" />
            <span className="tooltip">Quick view</span>
          </a>
        </div>
      </div>
    </div>
  );
}
