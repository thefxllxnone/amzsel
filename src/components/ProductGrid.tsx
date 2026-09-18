'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { SearchX, SlidersHorizontal, ArrowUpDown, Tag } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  selectedCategory: string | null;
  onClearFilters: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  searchQuery,
  selectedCategory,
  onClearFilters,
  isLoading = false,
  error = null,
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'discount' | 'price-low' | 'price-high'>('default');

  // Filter products by search & category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category match
      if (selectedCategory && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesBadge = product.dealBadge?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesBadge) {
          return false;
        }
      }
      return true;
    });
  }, [products, searchQuery, selectedCategory]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'discount') {
      return list.sort((a, b) => b.discountPercent - a.discountPercent);
    }
    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.currentPrice - b.currentPrice);
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.currentPrice - a.currentPrice);
    }
    return list;
  }, [filteredProducts, sortBy]);

  return (
    <section id="deals" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2">
              <Tag className="w-3.5 h-3.5 text-rose-600" />
              <span>UP TO 70% OFF</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              TODAY'S GREAT DEALS
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              Handpicked products with prices worth checking out.
            </p>
          </div>

          {/* Controls: Active filter info + Sort dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm">
              <ArrowUpDown className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-gray-500 font-medium hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-gray-800 focus:outline-hidden cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Active Filters Pill */}
            {(selectedCategory || searchQuery) && (
              <button
                onClick={onClearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl transition-colors"
              >
                Reset Filters ({sortedProducts.length} items)
              </button>
            )}
          </div>
        </div>

        {/* Error Alert State */}
        {error && (
          <div className="my-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
            <h3 className="text-base font-bold text-rose-900">Catalogue Error</h3>
            <p className="text-sm text-rose-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs font-bold bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sortedProducts.length === 0 && (
          <div className="py-16 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">NO DEALS FOUND</h3>
            <p className="text-sm text-gray-500">
              Try another product or category search. We couldn't find matches for{" "}
              {searchQuery ? `"${searchQuery}"` : selectedCategory ? `category "${selectedCategory}"` : 'your query'}.
            </p>
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-xs"
            >
              Show All Products
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && sortedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
