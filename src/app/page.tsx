'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryNav } from '@/components/CategoryNav';
import { FeaturedSection } from '@/components/FeaturedSection';
import { ProductGrid } from '@/components/ProductGrid';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch catalogue from API
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch catalogue from server');
      }

      setProducts(data.data || []);
    } catch (err: any) {
      console.error('Error loading products on homepage:', err);
      setError(err?.message || 'Catalogue could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Compute product counts per category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const handleExploreClick = () => {
    const elem = document.getElementById('deals');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoriesClick = () => {
    const elem = document.getElementById('categories');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Header Navigation */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={setSelectedCategory}
        activeCategory={selectedCategory}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner */}
        <Hero
          onExploreClick={handleExploreClick}
          onCategoriesClick={handleCategoriesClick}
        />

        {/* Categories Bar */}
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          productCounts={productCounts}
        />

        {/* Featured Deals Section (only when no filter active or initial view) */}
        {!selectedCategory && !searchQuery && (
          <FeaturedSection products={products} />
        )}

        {/* Main Product Deals Catalogue */}
        <ProductGrid
          products={products}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
          error={error}
        />
      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer onSelectCategory={setSelectedCategory} />
    </div>
  );
}
