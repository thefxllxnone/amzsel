'use client';

import React from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { Sparkles, Flame } from 'lucide-react';

interface FeaturedSectionProps {
  products: Product[];
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ products }) => {
  const featuredProducts = products.filter(p => p.isFeatured);

  if (featuredProducts.length === 0) return null;

  return (
    <section id="featured" className="py-12 bg-gradient-to-b from-amber-50/40 via-white to-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>HANDPICKED BY EDITORS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>FEATURED DEALS</span>
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              Top recommended Amazon offers with maximum savings today
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs self-start sm:self-auto">
            {featuredProducts.length} Featured Items
          </span>
        </div>

        {/* Featured Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
