"use client";

import { useEffect, useState } from "react";
const categories = [
  { id: 1, name: "Fashion", isActive: true, link: "/shop-default" },
  { id: 2, name: "Men", isActive: false, link: "/shop-men" },
  { id: 3, name: "Women", isActive: false, link: "/shop-women" },
  { id: 4, name: "Denim", isActive: false, link: "/shop-default" },
  { id: 5, name: "Dress", isActive: false, link: "/shop-default" },
];

const filterColors = [
  { name: "Orange", colorClass: "bg_orange-3" },
  { name: "Black", colorClass: "bg_dark" },
  { name: "White", colorClass: "bg_white" },
  { name: "Brown", colorClass: "bg_brown" },
  { name: "Light Purple", colorClass: "bg_purple" },
  { name: "Light Green", colorClass: "bg_light-green" },
  { name: "Pink", colorClass: "bg_purple" },
  { name: "Blue", colorClass: "bg_blue-2" },
  { name: "Dark Blue", colorClass: "bg_dark-blue" },
  { name: "Light Grey", colorClass: "bg_light-grey" },
  { name: "Beige", colorClass: "bg_beige" },
  { name: "Light Blue", colorClass: "bg_light-blue" },
  { name: "Grey", colorClass: "bg_grey" },
  { name: "Light Pink", colorClass: "bg_light-pink" },
];
const brands = ["Ecomus", "M&H"];
const availabilities = [
  { id: 1, isAvailable: true, text: "Available", count: 14 },
  { id: 2, isAvailable: false, text: "Out of Stock", count: 2 },
];
const sizes = ["S", "M", "L", "XL"];
import Slider from "rc-slider";
import { products1 } from "@/data/products";
import Link from "next/link";
/**
 * @param {Object} props
 * @param {function} props.setProducts
 * @param {Array} props.products
 */
export default function ShopFilter({ setProducts, products }) {
  // ...logique d'état et de filtre inchangée...
  // (copier-coller la logique d'état et de filtre ici, inchangée)

  // ...existing code for state and filter logic...

  return (
    <div
      className="offcanvas offcanvas-start"
      tabIndex="-1"
      id="filterShop"
      aria-labelledby="filterShopLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="filterShopLabel">Filtres</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Fermer"
        ></button>
      </div>
      <div className="offcanvas-body">
        {/* Place ici le contenu du filtre, par exemple les widgets de filtre, le formulaire, etc. */}
        {/* ...existing code for filter widgets and form... */}
        <div className="canvas-body">
          {/* ...widgets de filtre, formulaire, etc. (reprendre le contenu existant) ... */}
          {/* ...existing code... */}
        </div>
      </div>
    </div>
  );
}
