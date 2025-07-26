'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { DashboardLayout } from "@/components/layouts/dashboard-layout";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  inStock: boolean;
}

interface Category {
  id: number;
  name: string;
  count: number;
}

const ShopPage = () => {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'none' | 'left' | 'right'>('none');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('featured');

  // real data for Produits
  const Produits: Product[] = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 299,
      originalPrice: 399,
      image: "/api/placeholder/300/300",
      rating: 4.5,
      reviews: 128,
      category: "electronics",
      brand: "TechBrand",
      inStock: true
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 199,
      image: "/api/placeholder/300/300",
      rating: 4.2,
      reviews: 89,
      category: "electronics",
      brand: "SmartTech",
      inStock: true
    },
    {
      id: 3,
      name: "Running Shoes",
      price: 129,
      originalPrice: 159,
      image: "/api/placeholder/300/300",
      rating: 4.7,
      reviews: 256,
      category: "fashion",
      brand: "SportBrand",
      inStock: true
    },
    {
      id: 4,
      name: "Coffee Maker",
      price: 89,
      image: "/api/placeholder/300/300",
      rating: 4.3,
      reviews: 67,
      category: "home",
      brand: "HomeTech",
      inStock: false
    },
    {
      id: 5,
      name: "Laptop Bag",
      price: 49,
      originalPrice: 69,
      image: "/api/placeholder/300/300",
      rating: 4.1,
      reviews: 34,
      category: "accessories",
      brand: "TravelGear",
      inStock: true
    },
    {
      id: 6,
      name: "Bluetooth Speaker",
      price: 79,
      image: "/api/placeholder/300/300",
      rating: 4.4,
      reviews: 145,
      category: "electronics",
      brand: "AudioTech",
      inStock: true
    }
  ];

  // real data for Catégories
  const Catégories: Category[] = [
    { id: 1, name: "All Produits", count: Produits.length },
    { id: 2, name: "Electronics", count: Produits.filter(p => p.category === 'electronics').length },
    { id: 3, name: "Fashion", count: Produits.filter(p => p.category === 'fashion').length },
    { id: 4, name: "Home & Garden", count: Produits.filter(p => p.category === 'home').length },
    { id: 5, name: "Accessories", count: Produits.filter(p => p.category === 'accessories').length }
  ];

  const brands = Array.from(new Set(Produits.map(p => p.brand)));

  // Filter Produits based on selected filters
  const filteredProduits = Produits.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    return true;
  });

  // Sort Produits
  const sortedProduits = Array.from(filteredProduits).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-${i < Math.floor(rating) ? 'warning' : 'muted'}`}>
        ★
      </span>
    ));
  };

  const FilterSidebar = ({ side }: { side: 'left' | 'right' }) => (
    <div className={`col-lg-3 ${side === 'right' ? 'order-lg-2' : ''}`}>
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Filters</h5>
        </div>
        <div className="card-body">
          {/* Catégories Filter */}
          <div className="mb-4">
            <h6 className="mb-3">Catégories</h6>
            {Catégories.map(category => (
              <div key={category.id} className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="category"
                  id={`category-${category.id}`}
                  checked={selectedCategory === (category.name === 'All Produits' ? 'all' : category.name.toLowerCase().replace(' & ', '').replace(' ', ''))}
                  onChange={() => setSelectedCategory(category.name === 'All Produits' ? 'all' : category.name.toLowerCase().replace(' & ', '').replace(' ', ''))}
                />
                <label className="form-check-label" htmlFor={`category-${category.id}`}>
                  {category.name} ({category.count})
                </label>
              </div>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="mb-4">
            <h6 className="mb-3">Price Range</h6>
            <div className="row">
              <div className="col-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                />
              </div>
              <div className="col-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                />
              </div>
            </div>
          </div>

          {/* Brands Filter */}
          <div className="mb-4">
            <h6 className="mb-3">Brands</h6>
            {brands.map(brand => (
              <div key={brand} className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id={`brand-${brand}`} />
                <label className="form-check-label" htmlFor={`brand-${brand}`}>
                  {brand}
                </label>
              </div>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="mb-4">
            <h6 className="mb-3">Rating</h6>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id={`rating-${rating}`} />
                <label className="form-check-label" htmlFor={`rating-${rating}`}>
                  {renderStars(rating)} & Up
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => {
    if (viewType === 'list') {
      return (
        <div className="col-12 mb-4">
          <div className="card h-100">
            <div className="row g-0">
              <div className="col-md-3">
                <Image src={product.image} width={200} height={150} className="img-fluid rounded-start h-100 object-fit-cover" alt={product.name} />
              </div>
              <div className="col-md-9">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title">{product.name}</h5>
                      <p className="text-muted mb-2">{product.brand}</p>
                      <div className="d-flex align-items-center mb-2">
                        {renderStars(product.rating)}
                        <span className="ms-2 text-muted">({product.reviews} reviews)</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="h5 text-primary mb-0">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-muted text-decoration-line-through ms-2">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <button className="btn btn-primary mb-2" disabled={!product.inStock}>
                        {product.inStock ? 'Ajouter au panier' : 'Out of Stock'}
                      </button>
                      <br />
                      <button className="btn btn-outline-secondary btn-sm" aria-label="Add to wishlist">
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="card h-100">
          <div className="position-relative">
            <Image src={product.image} width={300} height={250} className="card-img-top object-cover" alt={product.name} style={{ height: '250px' }} />
            {product.originalPrice && (
              <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            )}
            <button className="btn btn-outline-light position-absolute top-0 end-0 m-2" aria-label="Add to favorites">
              <i className="fas fa-heart"></i>
            </button>
          </div>
          <div className="card-body">
            <h6 className="card-title">{product.name}</h6>
            <p className="text-muted small mb-2">{product.brand}</p>
            <div className="d-flex align-items-center mb-2">
              {renderStars(product.rating)}
              <span className="ms-2 text-muted small">({product.reviews})</span>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="h6 text-primary mb-0">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-muted text-decoration-line-through ms-2 small">${product.originalPrice}</span>
                )}
              </div>
              <button className="btn btn-primary btn-sm" disabled={!product.inStock}>
                {product.inStock ? 'Ajouter au panier' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (




    <DashboardLayout>
<div className="container-fluid content-inner mt-n5 py-0">
      {/* Shop Navigation */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                  <li className="breadcrumb-item"><Link href="/e-commerce">E-commerce</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Shop</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Header */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <h2 className="mb-0">Shop</h2>
                <div className="d-flex gap-2">
                  {/* View Type Buttons */}
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${viewType === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewType('grid')}
                      title="Grid View"
                    >
                      <i className="fas fa-th"></i>
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewType === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewType('list')}
                      title="List View"
                    >
                      <i className="fas fa-list"></i>
                    </button>
                  </div>

                  {/* Filter Type Buttons */}
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${filterType === 'none' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilterType('none')}
                      title="No Filter"
                    >
                      No Filter
                    </button>
                    <button
                      type="button"
                      className={`btn ${filterType === 'left' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilterType('left')}
                      title="Left Filter"
                    >
                      Left Filter
                    </button>
                    <button
                      type="button"
                      className={`btn ${filterType === 'right' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilterType('right')}
                      title="Right Filter"
                    >
                      Right Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="row">
        {/* Left Filter */}
        {filterType === 'left' && <FilterSidebar side="left" />}

        {/* Main Content */}
        <div className={`col-lg-${filterType === 'none' ? '12' : '9'} ${filterType === 'right' ? 'order-lg-1' : ''}`}>
          {/* Toolbar */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <div>
                  <span className="text-muted">Showing {sortedProduits.length} of {Produits.length} Produits</span>
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div className="d-flex align-items-center">
                    <label htmlFor="sortBy" className="form-label me-2 mb-0">Sort by:</label>
                    <select
                      id="sortBy"
                      className="form-select w-auto"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Produits Grid/List */}
          <div className="row">
            {sortedProduits.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="row">
            <div className="col-12">
              <nav aria-label="Produits pagination">
                <ul className="pagination justify-content-center">
                  <li className="page-item disabled">
                    <span className="page-link">Previous</span>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">1</span>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">2</a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">3</a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* Right Filter */}
        {filterType === 'right' && <FilterSidebar side="right" />}
      </div>

      {/* Catégories List Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Catégories List</h4>
            </div>
            <div className="card-body">
              <div className="row">
                {Catégories.slice(1).map(category => (
                  <div key={category.id} className="col-lg-3 col-md-6 mb-4">
                    <div className="card text-center h-100">
                      <div className="card-body">
                        <div className="mb-3">
                          <i className="fas fa-cube fa-3x text-primary"></i>
                        </div>
                        <h5 className="card-title">{category.name}</h5>
                        <p className="text-muted">{category.count} Produits</p>
                        <button
                          className="btn btn-primary"
                          onClick={() => setSelectedCategory(category.name.toLowerCase().replace(' & ', '').replace(' ', ''))}
                        >
                          View Produits
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</DashboardLayout>
    
  );
};

export default ShopPage;

