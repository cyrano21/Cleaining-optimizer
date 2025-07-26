"use client";

import React, { useState } from "react";

export default function Sorting({ setFinalSorted, products }) {
  const [sortType, setSortType] = useState("default");

  const handleSort = (e) => {
    const value = e.target.value;
    setSortType(value);
    let sortedProducts = [...products];
    switch (value) {
      case "price-asc":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        sortedProducts = [...products];
    }
    setFinalSorted(sortedProducts);
  };

  return (
    <select value={sortType} onChange={handleSort} className="form-select">
      <option value="default">Default sorting</option>
      <option value="price-asc">Sort by price: low to high</option>
      <option value="price-desc">Sort by price: high to low</option>
      <option value="name-asc">Sort by name: A to Z</option>
      <option value="name-desc">Sort by name: Z to A</option>
    </select>
  );
}
