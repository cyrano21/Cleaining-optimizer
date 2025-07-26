"use client";
import React from 'react';
import { lookbookProducts } from '../../data/products';
import LookbookComponent from './LookbookComponent';

export default function Lookbook({ title = "Shop The Look", showTitle = true }: { title?: string; showTitle?: boolean } = {}) {
  const limit = 4;
  const displayProducts = lookbookProducts.slice(0, limit);

  return (
    <section className="flat-spacing-1">
      <div className="container">
        {showTitle && (
          <div className="flat-title">
            <span className="title">{title}</span>
          </div>
        )}
        <div className="wrap-lookbook lookbook-sw">
          <ul className="lookbook-product-list">
            {displayProducts.map((product, index) => (
              <LookbookComponent key={index} product={product} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}