'use client';

import React from 'react';
import { SITE_CONFIG } from '@/config/site';
import { 
  Tv, 
  Sparkles, 
  Coffee, 
  Gamepad2, 
  Baby, 
  Car, 
  SlidersHorizontal, 
  Sun, 
  Bike, 
  Grid
} from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  productCounts: Record<string, number>;
}

// Icon mapping for 9 categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Electronic": <Tv className="w-4 h-4" />,
  "Personal Care": <Sparkles className="w-4 h-4" />,
  "Crockery": <Coffee className="w-4 h-4" />,
  "Toys": <Gamepad2 className="w-4 h-4" />,
  "Baby Toys": <Baby className="w-4 h-4" />,
  "Cars": <Car className="w-4 h-4" />,
  "Sliders": <SlidersHorizontal className="w-4 h-4" />,
  "Swing": <Sun className="w-4 h-4" />,
  "Bikes": <Bike className="w-4 h-4" />,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  productCounts,
}) => {
  return (
    <section id="categories" className="py-8 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Select a category to filter Amazon deals
            </p>
          </div>
          
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline self-start sm:self-auto"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        {/* 
          Category Buttons Layout:
          Responsive Grid on mobile & desktop that wraps cleanly.
          NO HORIZONTAL PAGE OVERFLOW.
        */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3">
          
          {/* ALL CATEGORIES BUTTON */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center justify-center sm:justify-start gap-2 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === null
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:bg-orange-50/50'
            }`}
          >
            <Grid className="w-4 h-4 shrink-0" />
            <span className="truncate">All Deals</span>
          </button>

          {/* 9 CATEGORIES */}
          {SITE_CONFIG.categories.map((catName) => {
            const isSelected = selectedCategory === catName;
            const count = productCounts[catName] || 0;

            return (
              <button
                key={catName}
                onClick={() => onSelectCategory(catName)}
                className={`flex items-center justify-between gap-1.5 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:bg-orange-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`shrink-0 ${isSelected ? 'text-white' : 'text-brand-600'}`}>
                    {CATEGORY_ICONS[catName] || <Grid className="w-4 h-4" />}
                  </span>
                  <span className="truncate">{catName}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
