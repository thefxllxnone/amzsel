export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  amazonUrl: string;
  isFeatured: boolean;
  isAvailable: boolean;
  dealBadge?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalProducts: number;
  featuredProducts: number;
  unavailableProducts: number;
  totalCategories: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
