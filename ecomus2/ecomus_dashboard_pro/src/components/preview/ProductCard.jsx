// Copie locale du composant ProductCard issu de ecomusnext-main
// (simplifié pour usage preview, à adapter si besoin)
import React from "react";

export function ProductCard({ product }) {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-lg transition cursor-pointer">
      <div className="w-full aspect-square mb-3 overflow-hidden rounded">
        <img
          src={product.imgSrc || product.image || null}
          alt={product.title}
          className="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-base line-clamp-2">{product.title}</div>
        <div className="text-sm text-gray-500">{product.brand}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold" style={{ color: '#2563eb' }}>{product.price} €</span>
          {product.originalPrice && (
            <span className="text-xs line-through text-gray-400">{product.originalPrice} €</span>
          )}
        </div>
        {product.discount && (
          <span className="text-xs text-green-600 font-semibold">-{product.discount}%</span>
        )}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-400">★</span>
          <span className="text-xs text-gray-600">{product.rating} ({product.reviews})</span>
        </div>
      </div>
    </div>
  );
}
