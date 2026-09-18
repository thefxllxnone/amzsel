import fs from 'fs';
import path from 'path';
import { Product } from '@/types/product';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'products.json');

// Ensure data directory exists locally
function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Netlify Blob helper (lazy loaded if in Netlify env)
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

export async function getProducts(): Promise<Product[]> {
  try {
    const blobStore = await getNetlifyBlobStore();
    if (blobStore) {
      const rawData = await blobStore.get('products', { type: 'json' });
      if (rawData && Array.isArray(rawData) && rawData.length > 0) {
        return rawData as Product[];
      }
      // Seed blob store with initial products
      await blobStore.setJSON('products', INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }

    // Local file fallback
    ensureDataDirExists();
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
      return INITIAL_PRODUCTS;
    }

    const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid products JSON structure in storage file');
    }
    return parsed;
  } catch (error: any) {
    console.error('CRITICAL: Failed to load products from persistent storage:', error);
    throw new Error(`Catalogue Storage Read Failure: ${error?.message || 'Unknown error'}`);
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

    // Local file save
    ensureDataDirExists();
    fs.writeFileSync(FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
  } catch (error: any) {
    console.error('CRITICAL: Failed to save products to persistent storage:', error);
    throw new Error(`Catalogue Storage Write Failure: ${error?.message || 'Unknown error'}`);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const products = await getProducts();
  const now = new Date().toISOString();
  
  // Calculate discount percentage if original price > current price
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
