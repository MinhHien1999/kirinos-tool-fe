const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.17:3000/api';

export const API_ENDPOINTS = {
  PRODUCTS: `${BASE_URL}/products`,
  CATEGORIES: `${BASE_URL}/categories`,
  BRANDS: `${BASE_URL}/brands`,
};

export const PAGINATION_LIMITS = {
  CATEGORY_PRODUCTS: 4, // Số lượng sản phẩm trên trang danh mục
};