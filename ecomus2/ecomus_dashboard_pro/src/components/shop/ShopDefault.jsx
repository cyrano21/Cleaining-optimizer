"use client";
import React, { useState, useEffect } from "react";
import { layouts } from "@/data/shop";
import ProductGrid from "./ProductGrid";
import Pagination from "../common/Pagination";
import ShopFilter from "./ShopFilter";
import Sorting from "./Sorting";

/**
 * @param {Object} props
 * @param {Array} props.products
 * @param {string} props.searchTerm
 * @param {function} props.setSearchTerm
 */
export default function ShopDefault({ products: externalProducts = [], searchTerm = '', setSearchTerm = () => {} }) {
  const [gridItems, setGridItems] = useState(4);
  const [products, setProducts] = useState(externalProducts);
  const [finalSorted, setFinalSorted] = useState(externalProducts);
  
  // Mettre à jour les produits quand les props changent
  useEffect(() => {
    setProducts(externalProducts);
    setFinalSorted(externalProducts);
  }, [externalProducts]);
  return (
    <>
      <section className="flat-spacing-2">
        <div className="container">
          <div className="tf-shop-control grid-3 align-items-center">
            <div className="tf-control-filter">
              <button
                onClick={() => {
                  try {
                    const offcanvas = document.getElementById('filterShop');
                    if (!offcanvas) {
                      console.error('Offcanvas #filterShop introuvable dans le DOM');
                      alert('Erreur : le panneau de filtre n\'est pas présent dans la page.');
                      return;
                    }
                    if (!window.bootstrap || !window.bootstrap.Offcanvas) {
                      console.error('window.bootstrap.Offcanvas non chargé');
                      alert('Erreur : le JavaScript Bootstrap n\'est pas chargé. Essayez de rafraîchir la page.');
                      return;
                    }
                    const bsOffcanvas = new window.bootstrap.Offcanvas(offcanvas);
                    if (bsOffcanvas) bsOffcanvas.show();
                  } catch (err) {
                    console.error('Erreur inattendue lors de l\'ouverture du filtre Offcanvas :', err);
                    alert('Erreur inattendue lors de l\'ouverture du filtre. Voir la console pour plus de détails.');
                  }
                }}
                className="tf-btn-filter bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <span className="icon icon-filter" />
                <span className="text">Filtrer</span>
              </button>
            </div>
            <ul className="tf-control-layout d-flex justify-content-center">
              {layouts.map((layout, index) => (
                <li
                  key={index}
                  className={`tf-view-layout-switch ${layout.className} ${
                    gridItems == layout.dataValueGrid ? "active" : ""
                  }`}
                  onClick={() => setGridItems(layout.dataValueGrid)}
                >
                  <div className="item">
                    <span className={`icon ${layout.iconClass}`} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="tf-control-sorting d-flex justify-content-end">
              <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                <Sorting setFinalSorted={setFinalSorted} products={products} />
              </div>
            </div>
          </div>
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="wrapper-control-shop">
            <div className="meta-filter-shop" />
            <ProductGrid allproducts={finalSorted} gridItems={gridItems} />
            {/* pagination */}
            {finalSorted.length ? (
              <ul className="tf-pagination-wrap tf-pagination-list tf-pagination-btn">
                <Pagination />
              </ul>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">🛍️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit disponible'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Essayez de modifier votre recherche' 
                    : 'Cette boutique n\'a pas encore de produits'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <ShopFilter setProducts={setProducts} products={externalProducts} />
    </>
  );
}
