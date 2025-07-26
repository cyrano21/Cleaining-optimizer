// Copie locale du composant DefaultShopDetails issu de ecomusnext-main
// (simplifié pour usage preview, à adapter si besoin)
import React from "react";

export default function DefaultShopDetails({ product }) {
  return (
    <div className="flex flex-col md:flex-row gap-8 p-8">
      <div className="flex-shrink-0 w-full md:w-1/2">
        <img
          src={product.imgSrc || product.image}
          alt={product.title}
          className="rounded-lg w-full object-cover"
        />
        <div className="flex gap-2 mt-4">
          {product.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={product.title + " thumb " + idx}
              className="w-16 h-16 object-cover rounded border"
            />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
        <div className="text-gray-600 mb-2">{product.brand}</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-blue-600">{product.price} €</span>
          {product.originalPrice && (
            <span className="text-sm line-through text-gray-400">{product.originalPrice} €</span>
          )}
          {product.discount && (
            <span className="text-xs text-green-600 font-semibold">-{product.discount}%</span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400">★</span>
          <span className="text-sm text-gray-600">{product.rating} ({product.reviews} avis)</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Description :</span>
          <p className="text-gray-700 mt-1">{product.description || "Aucune description disponible."}</p>
        </div>
        <div className="flex gap-2 mb-2">
          {product.colors?.map((color, idx) => (
            <span
              key={idx}
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          {product.sizes?.map((size, idx) => (
            <span key={idx} className="px-2 py-1 border rounded text-xs">{size}</span>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {product.tags?.map((tag, idx) => (
            <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
