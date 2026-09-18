import fs from 'fs';
import path from 'path';
import { Product } from '@/types/product';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import { SITE_CONFIG } from '@/config/site';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

// In-memory fallback cache for read-only serverless environments if disk/blob isn't available
let MEMORY_PRODUCTS_CACHE: Product[] | null = null;
let MEMORY_CATEGORIES_CACHE: string[] | null = null;

const DEFAULT_CATEGORIES: string[] = [...SITE_CONFIG.categories];

function ensureDataDirExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Read-only filesystem in serverless functions (e.g. Netlify/Vercel lambda)
  }
}

async function getNetlifyBlobStore() {
  if (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY_SITE_ID) {
    try {
      const { getStore } = await import('@netlify/blobs');
      return getStore({
        name: 'amazon-seller-catalogue',
        consistency: 'strong'
      });
    } catch (err) {
      console.warn('Netlify Blobs init notice:', err);
    }
  }
  return null;
}

// ==========================================
// PRODUCTS PERSISTENCE
// ==========================================

export async function getProducts(): Promise<Product[]> {
  try {
    // 1. Try Netlify Blob Store if deployed
    const blobStore = await getNetlifyBlobStore();
    if (blobStore) {
      try {
        const rawData = await blobStore.get('products', { type: 'json' });
        if (rawData && Array.isArray(rawData) && rawData.length > 0) {
          return rawData as Product[];
        }
        await blobStore.setJSON('products', INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      } catch (blobErr) {
        console.warn('Netlify Blob read error, using fallback:', blobErr);
      }
    }

    // 2. Try Local File System
    ensureDataDirExists();
    if (fs.existsSync(PRODUCTS_FILE)) {
      const fileContent = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        MEMORY_PRODUCTS_CACHE = parsed;
        return parsed;
      }
    }

    // 3. Try writing initial products to disk if possible
    try {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
    } catch (writeErr) {
      // Ignored if read-only filesystem
    }

    // 4. Memory cache fallback
    if (!MEMORY_PRODUCTS_CACHE) {
      MEMORY_PRODUCTS_CACHE = [...INITIAL_PRODUCTS];
    }
    return MEMORY_PRODUCTS_CACHE;
  } catch (error: any) {
    console.error('CRITICAL: Failed to load products from persistent storage:', error);
    // Return memory fallback instead of unhandled crash
    return MEMORY_PRODUCTS_CACHE || INITIAL_PRODUCTS;
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (!Array.isArray(products)) {
    throw new Error('Cannot save invalid products payload');
  }

  MEMORY_PRODUCTS_CACHE = products;

  try {
    const blobStore = await getNetlifyBlobStore();
    if (blobStore) {
      try {
        await blobStore.setJSON('products', products);
        return;
      } catch (blobErr) {
        console.warn('Netlify Blob write error:', blobErr);
      }
    }

    ensureDataDirExists();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (error: any) {
    console.warn('Notice: Local disk save failed (read-only filesystem):', error);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const products = await getProducts();
  const now = new Date().toISOString();
  
  const discount = productData.originalPrice > productData.currentPrice
    ? Math.round(((productData.originalPrice - productData.currentPrice) / productData.originalPrice) * 100)
    : productData.discountPercent || 0;

  const newProduct: Product = {
    ...productData,
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    discountPercent: discount,
    createdAt: now,
    updatedAt: now,
  };

  products.unshift(newProduct);
  await saveProducts(products);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error(`Product with ID ${id} not found`);
  }

  const existing = products[index];
  const updatedCurrentPrice = updates.currentPrice ?? existing.currentPrice;
  const updatedOriginalPrice = updates.originalPrice ?? existing.originalPrice;
  
  const updatedDiscount = updatedOriginalPrice > updatedCurrentPrice
    ? Math.round(((updatedOriginalPrice - updatedCurrentPrice) / updatedOriginalPrice) * 100)
    : updates.discountPercent ?? existing.discountPercent;

  const updatedProduct: Product = {
    ...existing,
    ...updates,
    currentPrice: updatedCurrentPrice,
    originalPrice: updatedOriginalPrice,
    discountPercent: updatedDiscount,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;
  await saveProducts(products);
  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) {
    return false;
  }
  await saveProducts(filtered);
  return true;
}

// ==========================================
// CATEGORIES PERSISTENCE
// ==========================================

export async function getCategories(): Promise<string[]> {
  try {
    const blobStore = await getNetlifyBlobStore();
    if (blobStore) {
      try {
        const raw = await blobStore.get('categories', { type: 'json' });
        if (raw && Array.isArray(raw) && raw.length > 0) {
          return raw as string[];
        }
        await blobStore.setJSON('categories', DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      } catch (e) {
        console.warn('Netlify Blob categories read error:', e);
      }
    }

    ensureDataDirExists();
    if (fs.existsSync(CATEGORIES_FILE)) {
      const content = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        MEMORY_CATEGORIES_CACHE = parsed;
        return parsed;
      }
    }

    if (!MEMORY_CATEGORIES_CACHE) {
      MEMORY_CATEGORIES_CACHE = [...DEFAULT_CATEGORIES];
    }
    return MEMORY_CATEGORIES_CACHE;
  } catch (error) {
    return MEMORY_CATEGORIES_CACHE || DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: string[]): Promise<void> {
  MEMORY_CATEGORIES_CACHE = categories;

  try {
    const blobStore = await getNetlifyBlobStore();
    if (blobStore) {
      try {
        await blobStore.setJSON('categories', categories);
        return;
      } catch (e) {
        console.warn('Netlify Blob categories write error:', e);
      }
    }

    ensureDataDirExists();
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (error: any) {
    console.warn('Notice: Local categories disk save failed:', error);
  }
}

export async function addCategory(categoryName: string): Promise<string[]> {
  const trimmed = categoryName.trim();
  if (!trimmed) throw new Error('Category name cannot be empty');

  const categories = await getCategories();
  if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error(`Category "${trimmed}" already exists`);
  }

  categories.push(trimmed);
  await saveCategories(categories);
  return categories;
}

export async function renameCategory(oldName: string, newName: string): Promise<string[]> {
  const trimmedNew = newName.trim();
  if (!trimmedNew) throw new Error('New category name cannot be empty');

  const categories = await getCategories();
  const index = categories.findIndex(c => c.toLowerCase() === oldName.toLowerCase());
  if (index === -1) {
    throw new Error(`Category "${oldName}" not found`);
  }

  categories[index] = trimmedNew;
  await saveCategories(categories);

  const products = await getProducts();
  let updatedCount = 0;
  const updatedProducts = products.map(p => {
    if (p.category.toLowerCase() === oldName.toLowerCase()) {
      updatedCount++;
      return { ...p, category: trimmedNew, updatedAt: new Date().toISOString() };
    }
    return p;
  });

  if (updatedCount > 0) {
    await saveProducts(updatedProducts);
  }

  return categories;
}

export async function deleteCategory(categoryName: string): Promise<string[]> {
  const categories = await getCategories();
  const filtered = categories.filter(c => c.toLowerCase() !== categoryName.toLowerCase());
  
  if (filtered.length === categories.length) {
    throw new Error(`Category "${categoryName}" not found`);
  }

  await saveCategories(filtered);
  return filtered;
}
