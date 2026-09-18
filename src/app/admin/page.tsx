'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, AdminStats } from '@/types/product';
import { SITE_CONFIG } from '@/config/site';
import { 
  Lock, 
  LogOut, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Star, 
  CheckCircle, 
  XCircle, 
  Upload, 
  ExternalLink, 
  LayoutDashboard, 
  Package, 
  AlertCircle,
  FolderPlus,
  Home
} from 'lucide-react';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Admin Search & Category Filter
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');

  // Modal State for Product Add / Edit
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formImage, setFormImage] = useState<string>('');
  const [formCurrentPrice, setFormCurrentPrice] = useState<string>('');
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('');
  const [formAmazonUrl, setFormAmazonUrl] = useState<string>('');
  const [formDealBadge, setFormDealBadge] = useState<string>('');
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Category Modal State
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [editingCatOldName, setEditingCatOldName] = useState<string | null>(null);
  const [editingCatNewName, setEditingCatNewName] = useState<string>('');

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (!prodRes.ok || !prodData.success) {
        throw new Error(prodData.error || 'Failed to load products');
      }

      setProducts(prodData.data || []);

      if (catRes.ok && catData.success) {
        setCategories(catData.data || []);
      }
    } catch (err: any) {
      console.error('Admin Load Error:', err);
      setFetchError(err?.message || 'Failed to connect to catalogue storage');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Invalid username or password');
        return;
      }

      localStorage.setItem('admin_token', data.token);
      setIsAuthenticated(true);
      setPasswordInput('');
    } catch (err: any) {
      setLoginError('Authentication request failed. Please check network.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  // Product Modal Handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0] || 'Electronic');
    setFormImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
    setFormCurrentPrice('');
    setFormOriginalPrice('');
    setFormAmazonUrl('https://www.amazon.in');
    setFormDealBadge('');
    setFormIsFeatured(false);
    setFormIsAvailable(true);
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormImage(product.image);
    setFormCurrentPrice(product.currentPrice.toString());
    setFormOriginalPrice(product.originalPrice.toString());
    setFormAmazonUrl(product.amazonUrl || '');
    setFormDealBadge(product.dealBadge || '');
    setFormIsFeatured(product.isFeatured);
    setFormIsAvailable(product.isAvailable);
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormImage(data.url);
    } catch (err: any) {
      setFormError(`Image upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formCurrentPrice || !formOriginalPrice) {
      setFormError('Product Name, Current Price and Original Price are required.');
      return;
    }

    const currentPriceNum = Number(formCurrentPrice);
    const originalPriceNum = Number(formOriginalPrice);

    if (isNaN(currentPriceNum) || isNaN(originalPriceNum)) {
      setFormError('Prices must be valid numbers.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formName.trim(),
        category: formCategory || categories[0] || 'Electronic',
        image: formImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        currentPrice: currentPriceNum,
        originalPrice: originalPriceNum,
        amazonUrl: formAmazonUrl.trim(),
        dealBadge: formDealBadge.trim(),
        isFeatured: formIsFeatured,
        isAvailable: formIsAvailable,
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      setIsProductModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete product');
        return;
      }
      await loadData();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? data.data : p));
      }
    } catch (err) {
      console.error('Toggle featured error:', err);
    }
  };

  const handleToggleAvailable = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? data.data : p));
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
    }
  };

  // CATEGORY MANAGEMENT HANDLERS
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to add category');
        return;
      }
      setCategories(data.data);
      setNewCatInput('');
    } catch (err: any) {
      alert(`Category add error: ${err.message}`);
    }
  };

  const handleRenameCategory = async (oldName: string) => {
    if (!editingCatNewName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: editingCatNewName.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to rename category');
        return;
      }
      setCategories(data.data);
      setEditingCatOldName(null);
      setEditingCatNewName('');
      await loadData();
    } catch (err: any) {
      alert(`Category rename error: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    const productsInCat = products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
    if (productsInCat.length > 0) {
      if (!confirm(`Warning: Category "${catName}" contains ${productsInCat.length} products. Deleting it will remove the category from list. Continue?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    }

    try {
      const res = await fetch(`/api/categories?name=${encodeURIComponent(catName)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete category');
        return;
      }
      setCategories(data.data);
      await loadData();
    } catch (err: any) {
      alert(`Category delete error: ${err.message}`);
    }
  };

  // Filtered list for admin view
  const filteredProducts = products.filter(p => {
    if (adminCategoryFilter !== 'all' && p.category.toLowerCase() !== adminCategoryFilter.toLowerCase()) {
      return false;
    }
    if (adminSearch.trim()) {
      const query = adminSearch.toLowerCase().trim();
      return p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    }
    return true;
  });

  const stats: AdminStats = {
    totalProducts: products.length,
    featuredProducts: products.filter(p => p.isFeatured).length,
    unavailableProducts: products.filter(p => !p.isAvailable).length,
    totalCategories: categories.length,
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amazon-orange to-brand-600 rounded-2xl flex items-center justify-center text-white text-xl font-black mx-auto shadow-md">
              AS
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              AMAZON SELLER Admin
            </h1>
            <p className="text-xs text-gray-500">
              Sign in to manage catalogue products & categories
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Admin ID
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter Admin ID (admin1)"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter Password"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>LOG IN TO ADMIN</span>
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold">
              <Home className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col max-w-full overflow-x-hidden">
      
      {/* Top Admin Header */}
      <header className="bg-amazon-dark text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amazon-orange to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              AS
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight truncate">
              AMAZON SELLER <span className="text-amazon-orange">ADMIN</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-amazon-navy px-3 py-1.5 rounded-lg border border-gray-700"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/60 border border-rose-800/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-500 uppercase">TOTAL PRODUCTS</p>
              <p className="text-xl font-black text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-500 uppercase">FEATURED</p>
              <p className="text-xl font-black text-gray-900">{stats.featuredProducts}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-500 uppercase">CATEGORIES</p>
              <p className="text-xl font-black text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-500 uppercase">ACTIVE / STOCK</p>
              <p className="text-xl font-black text-gray-900">{stats.totalProducts - stats.unavailableProducts}</p>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-gray-200 gap-4 text-sm font-bold">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalogue ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Categories Management ({categories.length})</span>
          </button>
        </div>

        {/* ========================================== */}
        {/* TAB 1: PRODUCT CATALOGUE MANAGEMENT */}
        {/* ========================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                    Product Catalogue
                  </h2>
                  <p className="text-xs text-gray-500">
                    Add, edit, upload images, update deal URLs & stock availability
                  </p>
                </div>

                <button
                  onClick={openAddProductModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD NEW PRODUCT</span>
                </button>
              </div>

              {/* SEARCH & CATEGORY FILTER BAR */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={adminCategoryFilter}
                  onChange={(e) => setAdminCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {fetchError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Catalogue load error: {fetchError}</span>
                </div>
                <button
                  onClick={loadData}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* MOBILE STACKED CARDS (0px HORIZONTAL OVERFLOW!) */}
            <div className="block md:hidden space-y-4">
              {isLoading ? (
                <div className="p-8 text-center text-sm font-semibold text-gray-500">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-sm text-gray-500">
                  No products found matching criteria.
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0 bg-gray-50"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
                            {p.category}
                          </span>
                          {p.discountPercent > 0 && (
                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                              {p.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-2">{p.name}</h4>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-black text-gray-900">₹{p.currentPrice.toLocaleString('en-IN')}</span>
                          {p.originalPrice > p.currentPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                            p.isFeatured
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          <Star className={`w-3 h-3 ${p.isFeatured ? 'fill-amber-600 text-amber-600' : ''}`} />
                          <span>{p.isFeatured ? 'Featured' : 'Regular'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleAvailable(p)}
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                            p.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {p.isAvailable ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>{p.isAvailable ? 'In Stock' : 'Out'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4 text-center">Featured</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Loading products catalogue...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0 bg-gray-50"
                            />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-gray-900 truncate">{p.name}</p>
                              {p.amazonUrl ? (
                                <a
                                  href={p.amazonUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-brand-600 hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Amazon Deal URL</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">No URL set</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div>
                            <span className="font-extrabold text-gray-900">₹{p.currentPrice.toLocaleString('en-IN')}</span>
                            {p.originalPrice > p.currentPrice && (
                              <span className="ml-1.5 text-xs text-gray-400 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                            )}
                            <p className="text-[10px] font-bold text-rose-600">{p.discountPercent}% OFF</p>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              p.isFeatured
                                ? 'bg-amber-100 border-amber-300 text-amber-700'
                                : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600'
                            }`}
                            title="Toggle Featured"
                          >
                            <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-amber-500' : ''}`} />
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleAvailable(p)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                              p.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {p.isAvailable ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{p.isAvailable ? 'Available' : 'Unavailable'}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: CATEGORY MANAGEMENT */}
        {/* ========================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            
            {/* Add Category Form */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <h2 className="text-lg font-extrabold text-gray-900">
                Add New Product Category
              </h2>
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <input
                  type="text"
                  required
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Category Name (e.g. Home Decor, Sports)"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors shrink-0"
                >
                  Add Category
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
                const isEditing = editingCatOldName === cat;

                return (
                  <div key={cat} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCatNewName}
                            onChange={(e) => setEditingCatNewName(e.target.value)}
                            className="w-full px-3 py-1.5 border border-brand-500 rounded-lg text-xs font-bold"
                          />
                          <button
                            onClick={() => handleRenameCategory(cat)}
                            className="px-2 py-1 bg-brand-600 text-white text-xs font-bold rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCatOldName(null)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-sm">{cat}</h4>
                          <p className="text-xs text-gray-500 font-semibold">{count} products assigned</p>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCatOldName(cat);
                              setEditingCatNewName(cat);
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            title="Rename Category"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Amazon Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mini Portable Bluetooth Speaker"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Deal Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formDealBadge}
                    onChange={(e) => setFormDealBadge(e.target.value)}
                    placeholder="e.g. LIGHTNING DEAL"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Current Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formCurrentPrice}
                    onChange={(e) => setFormCurrentPrice(e.target.value)}
                    placeholder="899"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Original Price (M.R.P. ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="2499"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Amazon Deal URL
                </label>
                <input
                  type="url"
                  value={formAmazonUrl}
                  onChange={(e) => setFormAmazonUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                    <img
                      src={formImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Or paste image URL"
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-500"
                  />
                  <span className="text-xs font-bold text-gray-800">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-gray-800">In Stock (Available)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
