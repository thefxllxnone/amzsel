'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';
import { Search, MessageSquare, Menu, X, Tag, Sparkles, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (category: string | null) => void;
  activeCategory: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSelectCategory,
  activeCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.linkNumber}?text=${encodeURIComponent(SITE_CONFIG.whatsapp.defaultMessage)}`;

  const handleNavClick = (sectionId: string, category?: string) => {
    setMobileMenuOpen(false);
    if (category !== undefined) {
      onSelectCategory(category === 'all' ? null : category);
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo / Brand Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('hero', 'all')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amazon-orange to-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                AS
              </div>
              <div>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 block leading-none">
                  AMAZON <span className="text-brand-600">SELLER</span>
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide">
                  DEALS & DISCOUNTS
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <button
              onClick={() => handleNavClick('hero', 'all')}
              className="hover:text-brand-600 transition-colors py-2"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className={`hover:text-brand-600 transition-colors py-2 ${activeCategory ? 'text-brand-600 font-bold' : ''}`}
            >
              Categories
            </button>
            <button
              onClick={() => handleNavClick('deals')}
              className="hover:text-brand-600 transition-colors py-2 flex items-center gap-1 text-rose-600 font-bold"
            >
              <Tag className="w-3.5 h-3.5" />
              Today's Deals
            </button>
            <button
              onClick={() => handleNavClick('featured')}
              className="hover:text-brand-600 transition-colors py-2 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Featured
            </button>
          </nav>

          {/* Search Bar - Desktop & Tablet */}
          <div className="hidden sm:flex flex-1 max-w-xs md:max-w-sm mx-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search deals or categories..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* WhatsApp CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full shadow-xs hover:shadow-md transition-all shrink-0"
              title="Contact on WhatsApp"
            >
              <MessageSquare className="w-4 h-4 fill-white/20" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden text-xs">Contact</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="sm:hidden pb-3 pt-1">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products or categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 px-1 space-y-2 bg-white animate-in slide-in-from-top-2">
            <button
              onClick={() => handleNavClick('hero', 'all')}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-800 rounded-lg hover:bg-gray-50"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-800 rounded-lg hover:bg-gray-50"
            >
              Browse Categories
            </button>
            <button
              onClick={() => handleNavClick('deals')}
              className="block w-full text-left px-3 py-2 text-sm font-bold text-rose-600 rounded-lg hover:bg-rose-50"
            >
              🔥 Today's Deals
            </button>
            <button
              onClick={() => handleNavClick('featured')}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-amber-600 rounded-lg hover:bg-amber-50"
            >
              ⭐ Featured Deals
            </button>
            <a
              href="/admin"
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-500 border-t border-gray-100 pt-2 hover:text-gray-900"
            >
              Admin Portal
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
