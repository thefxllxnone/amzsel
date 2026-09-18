import fs from 'fs';
import path from 'path';
import { Product } from '@/types/product';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import { SITE_CONFIG } from '@/config/site';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

const DEFAULT_CATEGORIES: string[] = [...SITE_CONFIG.categories];

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function getNetlifyBlobStore() {
  if (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT) {
    try {
      const { getStore } = await import('@netlify/blobs');
      return getStore({
        name: 'amazon-seller-catalogue',
        consistency: 'strong'
      });
    } catch (err) {
      console.warn('Netlify Blobs import warning:', err);
    }
  }
  return null;
}

// ==========================================
// PRODUCTS PERSISTENCE
// ==========================================

export async function getProducts(): Promise<Product[]> {
  try {
    const blobStore = await getNetlifyBlobStore();
    if (blobStore) {
      const rawData = await blobStore.get('products', { type: 'json' });
      if (rawData && Array.isArray(rawData) && rawData.length > 0) {
        return rawData as Product[];
      }
      await blobStore.setJSON('products', INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }

    ensureDataDirExists();
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
      return INITIAL_PRODUCTS;
    }

    const fileContent = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(fileContent);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid products JSON structure in storage file');
    }
    return parsed;
  } catch (error: any) {
    console.error('CRITICAL: Failed to load products from persistent storage:', error);
    throw new Error(`Catalogue Read Failure: ${error?.message || 'Unknown error'}`);
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (!Array.isArray(products)) {
    throw new Error('Cannot save invalid products payload');
  }

  try {
    const blobStore = await getNetlifyBlobStore();
    if (blobStore) {
      await blobStore.setJSON('products', products);
      return;
    }

    ensureDataDirExists();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (error: any) {
    console.error('CRITICAL: Failed to save products to persistent storage:', error);
    throw new Error(`Catalogue Write Failure: ${error?.message || 'Unknown error'}`);
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
      const raw = await blobStore.get('categories', { type: 'json' });
      if (raw && Array.isArray(raw) && raw.length > 0) {
        return raw as string[];
      }
      await blobStore.setJSON('categories', DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }

    ensureDataDirExists();
    if (!fs.existsSync(CATEGORIES_FILE)) {
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf-8');
      return DEFAULT_CATEGORIES;
    }

    const content = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      return DEFAULT_CATEGORIES;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to read categories from storage:', error);
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: string[]): Promise<void> {
  try {
    const blobStore = await getNetlifyBlobStore();
    if (blobStore) {
      await blobStore.setJSON('categories', categories);
      return;
    }

    ensureDataDirExists();
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (error: any) {
    console.error('Failed to save categories:', error);
    throw new Error(`Category Write Failure: ${error?.message || 'Unknown error'}`);
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

  // Update all products in this category to use new category name!
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
