"use client";
import React, { useState } from "react";
import { ProductCard } from "../../shopCards/ProductCard";
import { useProducts } from "../../../hooks/useApi";
import LoadingSpinner from "../../ui/LoadingSpinner";
import ErrorMessage from "../../ui/ErrorMessage";

export default function ProductsAPI() {
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  
  // Charger les produits avec pagination
  const { 
    data: productsData, 
    error, 
    isLoading 
  } = useProducts({ 
    page, 
    limit: 12 
  });

  // Mettre à jour la liste complète quand de nouveaux produits arrivent
  React.useEffect(() => {
    if (productsData?.products) {
      if (page === 1) {
        setAllProducts(productsData.products);
      } else {
        setAllProducts(prev => [...prev, ...productsData.products]);
      }
    }
  }, [productsData, page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    setHasLoadedMore(true);
  };

  const hasMorePages = productsData && productsData.currentPage < productsData.totalPages;

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <section className="flat-spacing-5 pt_0 flat-seller">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp" data-wow-delay="0s">
            Best Seller
          </span>
          <p className="sub-title wow fadeInUp" data-wow-delay="0s">
            Shop the Latest Styles: Stay ahead of the curve with our newest
            arrivals
          </p>
        </div>
        
        {isLoading && page === 1 ? (
          <LoadingSpinner />
        ) : (
          <>
            <div
              className="grid-layout wow fadeInUp"
              data-wow-delay="0s"
              data-grid="grid-4"
            >
              {allProducts.map((product, i) => (
                <ProductCard product={product} key={product._id || i} />
              ))}
            </div>
            
            {hasMorePages && (
              <div className="tf-pagination-wrap view-more-button text-center">
                <button
                  className={`tf-btn-loading tf-loading-default style-2 btn-loadmore ${
                    isLoading && page > 1 ? "loading" : ""
                  }`}
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  <span className="text">
                    {isLoading && page > 1 ? "Loading..." : "Load more"}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
