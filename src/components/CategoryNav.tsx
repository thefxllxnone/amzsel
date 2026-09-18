'use client';

import React from 'react';
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
  Grid,
  Tag
} from 'lucide-react';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  productCounts: Record<string, number>;
}

// Icon mapping fallback helper
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Electronic": <Tv className="w-4 h-4 shrink-0" />,
  "Personal Care": <Sparkles className="w-4 h-4 shrink-0" />,
  "Crockery": <Coffee className="w-4 h-4 shrink-0" />,
  "Toys": <Gamepad2 className="w-4 h-4 shrink-0" />,
  "Baby Toys": <Baby className="w-4 h-4 shrink-0" />,
  "Cars": <Car className="w-4 h-4 shrink-0" />,
  "Sliders": <SlidersHorizontal className="w-4 h-4 shrink-0" />,
  "Swing": <Sun className="w-4 h-4 shrink-0" />,
  "Bikes": <Bike className="w-4 h-4 shrink-0" />,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productCounts,
}) => {
  const totalCount = Object.values(productCounts).reduce((a, b) => a + b, 0);

  return (
    <section id="categories" className="py-8 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              EXPLORE CATEGORIES
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Select a category to filter Amazon deals
            </p>
          </div>
          
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        {/* 
          UNCOMPRESSED RESPONSIVE CATEGORY BUTTONS
          Uses flex-wrap layout on desktop and grid/wrap on mobile.
          FULL NAMES ALWAYS DISPLAY WITHOUT TRUNCATION (No "Ele...", "Cro...")
        */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* ALL DEALS BUTTON */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-2xs ${
              selectedCategory === null
                ? 'bg-brand-600 text-white border-brand-600 shadow-md transform scale-[1.02]'
                : 'bg-white text-gray-800 border-gray-200 hover:border-brand-400 hover:bg-orange-50/50'
            }`}
          >
            <Grid className="w-4 h-4 shrink-0" />
            <span>ALL DEALS</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ml-1 ${
                selectedCategory === null
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* DYNAMIC CATEGORY BUTTONS */}
          {categories.map((catName) => {
            const isSelected = selectedCategory?.toLowerCase() === catName.toLowerCase();
            const count = productCounts[catName] || 0;
            const icon = CATEGORY_ICONS[catName] || <Tag className="w-4 h-4 shrink-0" />;

            return (
              <button
                key={catName}
                onClick={() => onSelectCategory(catName)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-2xs ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md transform scale-[1.02]'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-brand-400 hover:bg-orange-50/50'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-brand-600'}>
                  {icon}
                </span>
                <span className="capitalize">{catName}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ml-1 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
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
