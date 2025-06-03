import { allProducts } from "@/data/products";
import Link from "next/link";
import React from "react";

export default function ProductSinglePrevNext({ currentId = 1 }) {
  // Early return if no products data
  if (!allProducts || allProducts.length === 0) {
    return null;
  }
  
  // Ensure currentId is a valid number
  const validCurrentId = Number(currentId) || 1;
  const maxProductId = allProducts.length;
  
  // Calculate previous and next IDs with bounds checking
  const prevId = validCurrentId <= 1 ? maxProductId : validCurrentId - 1;
  const nextId = validCurrentId >= maxProductId ? 1 : validCurrentId + 1;
  
  // Additional safety check to ensure IDs are valid
  if (!prevId || !nextId || isNaN(prevId) || isNaN(nextId)) {
    return null;
  }

  return (
    <div className="tf-breadcrumb-prev-next">
      <Link
        href={`/product-detail/${prevId}`}
        className="tf-breadcrumb-prev hover-tooltip center"
      >
        <i className="icon icon-arrow-left" />
        {/* <span className="tooltip">Cotton jersey top</span> */}
      </Link>
      <a href="#" className="tf-breadcrumb-back hover-tooltip center">
        <i className="icon icon-shop" />
        {/* <span className="tooltip">Back to Women</span> */}
      </a>
      <Link
        href={`/product-detail/${nextId}`}
        className="tf-breadcrumb-next hover-tooltip center"
      >
        <i className="icon icon-arrow-right" />
        {/* <span className="tooltip">Cotton jersey top</span> */}
      </Link>
    </div>
  );
}
