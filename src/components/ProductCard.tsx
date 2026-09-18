'use client';

import React from 'react';
import { Product } from '@/types/product';
import { SITE_CONFIG } from '@/config/site';
import { ExternalLink, MessageSquare, Tag, CheckCircle2, XCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const whatsappMsg = `Hi, I am interested in this deal on AMAZON SELLER:\n\n*${product.name}*\nCategory: ${product.category}\nPrice: ₹${product.currentPrice.toLocaleString('en-IN')}\nDiscount: ${product.discountPercent}% OFF\nLink: ${product.amazonUrl || 'N/A'}`;
  
  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.linkNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Category Badge */}
          <span className="bg-white/90 backdrop-blur-md text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/40 shadow-xs uppercase tracking-wider">
            {product.category}
          </span>

          {/* Discount Badge */}
          {product.discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{product.discountPercent}% OFF</span>
            </span>
          )}
        </div>

        {/* Optional Custom Deal Badge */}
        {product.dealBadge && (
          <div className="absolute bottom-2.5 left-2.5 bg-amber-400 text-gray-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
            {product.dealBadge}
          </div>
        )}

        {/* Stock status overlay if unavailable */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          {/* Pricing Row */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-gray-900">
              ₹{product.currentPrice.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.currentPrice && (
              <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          
          {/* VIEW DEAL ON AMAZON BUTTON */}
          <a
            href={product.amazonUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full inline-flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all shadow-2xs ${
              product.isAvailable
                ? 'bg-amazon-orange hover:bg-amber-500 text-gray-950 shadow-xs hover:shadow-md'
                : 'bg-gray-200 text-gray-500 pointer-events-none'
            }`}
          >
            <span>VIEW DEAL ON AMAZON</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* WHATSAPP INQUIRY BUTTON */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 font-semibold text-xs py-2 px-3 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask about this deal</span>
          </a>

        </div>

      </div>

    </div>
  );
};
