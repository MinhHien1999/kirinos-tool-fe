import axiosClient from '@/config/axios';

export const PAGINATION_LIMIT = 4;

export function isValidProductImageUrl(url) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('http');
}

/**
 * Lấy danh sách sản phẩm trang chủ có phân trang bằng Axios
 */
export async function fetchHomeProducts(page) {
  try {
    // Luồng dữ liệu: API -> Axios Interceptor (loại bỏ tầng axios wrapper) -> Trả về JSON gốc từ backend
    const result = await axiosClient.get('/products', {
      params: {
        page: page,
        limit: 12,
      },
    });

    // Kiểm tra cấu trúc dữ liệu thực tế dựa trên tab Network
    // Trường hợp 1: Backend trả về dữ liệu nằm trong mảng phẳng hoặc object bọc
    const productsData = result?.data?.products || result?.products || result?.data || [];
    const paginationData = result?.data?.pagination || result?.pagination || { totalPages: 1, totalItems: 0 };

    return {
      products: Array.isArray(productsData) ? productsData : [productsData],
      pagination: paginationData,
    };
  } catch (error) {
    console.error('🔴 Lỗi fetch danh sách sản phẩm tại Service:', error.message);
    return { products: [], pagination: { totalPages: 1, totalItems: 0 } };
  }
}

/**
 * Lấy chi tiết sản phẩm trực tiếp từ Backend thông qua Slug
 */
export async function fetchProductDetailBySlug(slug) {
  try {
    const result = await axiosClient.get(`/products/slug/${slug}`);
    return result?.data || result || null;
  } catch (error) {
    try {
      const result = await axiosClient.get('/products', { params: { limit: 1000 } });
      const products = result?.data?.products || result?.products || [];
      const productFound = products.find((item) => item.slug === slug);
      
      if (productFound) {
        const detailRes = await axiosClient.get(`/products/${productFound._id}`);
        return detailRes?.data || detailRes || null;
      }
      return null;
    } catch (fallbackError) {
      console.error('Lỗi khi tải chi tiết sản phẩm:', fallbackError.message);
      return null;
    }
  }
}
/**
 * Lấy chi tiết một sản phẩm theo ID (Phục vụ trang Edit Admin)
 */
export async function fetchProductDetailById(id) {
  try {
    const result = await axiosClient.get(`/products/${id}`);
    // Trả về data gốc tùy theo cấu trúc interceptor của bạn
    return result?.data || result || null;
  } catch (error) {
    console.error(`🔴 Lỗi khi lấy chi tiết sản phẩm ID ${id}:`, error.message);
    throw error;
  }
}

// Lấy thông tin danh mục theo Slug
export async function fetchCategoryBySlug(slug) {
  try {
    const result = await axiosClient.get('/categories');
    const categories = result?.data?.categories || result?.categories || [];
    return categories.find((c) => c.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching category with Axios:', error.message);
    return null;
  }
}

// Lấy danh sách sản phẩm phân trang theo ID danh mục
export async function fetchProductsByCategoryId(categoryId, page) {
  try {
    const result = await axiosClient.get('/products', {
      params: {
        category: categoryId,
        page: page,
        limit: PAGINATION_LIMIT,
      },
    });

    return {
      products: result?.data?.products || result?.products || [],
      pagination: result?.data?.pagination || result?.pagination || { totalPages: 1, totalItems: 0 }
    };
  } catch (error) {
    console.error('Error fetching products with Axios:', error.message);
    return { products: [], pagination: { totalPages: 1, totalItems: 0 } };
  }
}

/**
 * Lấy thông tin thương hiệu theo Slug
 */
export async function fetchBrandBySlug(slug) {
  try {
    const result = await axiosClient.get('/brands');
    const brands = result?.data?.brands || result?.brands || [];
    
    if (!slug) return null;
    
    return (
      brands.find((b) => b.slug === slug) ||
      brands.find((b) => b.slug?.toLowerCase() === slug.toLowerCase()) ||
      brands.find((b) => b.name?.toLowerCase() === slug.toLowerCase()) ||
      null
    );
  } catch (error) {
    console.error('Lỗi khi fetch thông tin thương hiệu:', error.message);
    return null;
  }
}

/**
 * Tải danh sách sản phẩm phân trang theo Brand ID sử dụng Axios
 */
export async function fetchProductsByBrandId(brandId, page) {
  try {
    const result = await axiosClient.get('/products', {
      params: {
        brand: brandId,
        page: page,
        limit: 4,
      }
    });

    return {
      products: result?.data?.products || result?.products || [],
      pagination: result?.data?.pagination || result?.pagination || { totalPages: 1, totalItems: 0 }
    };
  } catch (error) {
    console.error('Lỗi khi fetch sản phẩm theo thương hiệu:', error.message);
    return { products: [], pagination: { totalPages: 1, totalItems: 0 } };
  }
}

/**
 * Lấy danh sách sản phẩm phục vụ Admin (Hỗ trợ phân trang và tìm kiếm từ khóa)
 */
export async function fetchAdminProducts(page = 1, limit = 10, searchKey = '') {
  try {
    const result = await axiosClient.get('/products', {
      params: {
        page,
        limit,
        ...(searchKey.trim() && { search: searchKey.trim() }),
      },
    });

    return {
      products: result?.data?.products || result?.products || [],
      pagination: result?.data?.pagination || result?.pagination || { totalPages: 1, totalItems: 0 },
    };
  } catch (error) {
    console.error('🔴 Lỗi fetch danh sách Admin Products:', error.message);
    throw error; // Throw ra để phía UI catch và hiển thị thông báo lỗi lên màn hình
  }
}

/**
 * Xóa sản phẩm theo ID hệ thống
 */
export async function deleteProductService(id) {
  try {
    const result = await axiosClient.delete(`/products/${id}`);
    return result?.data || result;
  } catch (error) {
    console.error(`🔴 Lỗi khi xóa sản phẩm ${id}:`, error.message);
    throw error;
  }
}
/**
 * Cập nhật thông tin sản phẩm bằng Axios
 * @param {string} id - ID của sản phẩm cần sửa
 * @param {Object} productData - Dữ liệu mới của sản phẩm (FormData hoặc Object JSON)
 */
export async function updateProductService(id, productData) {
  try {
    const result = await axiosClient.put(`/products/${id}`, productData, {
      // Nếu bạn gửi ảnh (file), hãy để hoặc cấu hình interceptor tự nhận multipart/form-data
      headers: {
        'Content-Type': productData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return result?.data || result;
  } catch (error) {
    console.error(`🔴 Lỗi khi cập nhật sản phẩm ID ${id}:`, error.message);
    throw error;
  }
}

/**
 * Tạo sản phẩm mới (Sử dụng FormData gửi kèm hình ảnh)
 */
export async function createProductService(formData) {
  try {
    const result = await axiosClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return result?.data || result;
  } catch (error) {
    console.error('🔴 Lỗi khi tạo sản phẩm mới:', error.message);
    throw error;
  }
}