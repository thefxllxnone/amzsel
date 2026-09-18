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
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch catalogue and categories from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (!prodRes.ok || !prodData.success) {
        throw new Error(prodData.error || 'Failed to fetch catalogue from server');
      }

      setProducts(prodData.data || []);

      if (catRes.ok && catData.success) {
        setCategories(catData.data || []);
      }
    } catch (err: any) {
      console.error('Error loading products on homepage:', err);
      setError(err?.message || 'Catalogue could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden max-w-full">
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
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          productCounts={productCounts}
        />

        {/* Featured Deals Section */}
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
