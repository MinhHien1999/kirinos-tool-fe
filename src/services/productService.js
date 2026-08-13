import axiosClient from '@/config/axios';

export const ITEMS_LIMIT = 12;

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
    const result = await axiosClient.get('/products/client', {
      params: {
        page: page,
        limit: ITEMS_LIMIT,
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
// Lấy danh sách sản phẩm phân trang theo ID danh mục
export async function fetchProductsByCategorySlug(categorySlug, page = 1) {
  try {
    // 1. Thay đổi endpoint thành `/products/${categorySlug}` để khớp với `router.get('/:slug', getProductBySlug)`
    // Chỉ truyền `page` và `limit` qua params, không cần truyền trường `category` rời rạc nữa
    const response = await axiosClient.get(`/categories/${categorySlug}/products`, {
      params: {
        page: page,
        limit: ITEMS_LIMIT, // Dùng hằng số của bạn hoặc fallback về 12
      },
    });
    // 2. Trích xuất dữ liệu từ lớp bọc `response.data.data` của Axios + cấu trúc Controller mới
    const apiData = response?.data;
    return {
      category: apiData?.category || null, // Trả thêm thông tin danh mục về cho Client làm UI Title
      products: apiData?.products || [],
      pagination: apiData?.pagination || { totalPages: 1, totalItems: 0, currentPage: page }
    };
  } catch (error) {
    console.error(`🔴 Error fetching products for category [${categorySlug}] with Axios:`, error.message);
    return { 
      category: null,
      products: [], 
      pagination: { totalPages: 1, totalItems: 0, currentPage: page } 
    };
  }
}

/**
 * Frontend Service: Lấy danh sách sản phẩm theo Brand Slug (Có phân trang)
 * @param {string} brandSlug - Slug của thương hiệu cần lấy sản phẩm (Ví dụ: 'kapusi')
 * @param {number} page - Trang hiện tại cần tải (Mặc định là 1)
 * @returns {Promise<{brand: Object|null, products: Array, pagination: Object}>}
 */
export async function fetchProductsByBrandSlug(brandSlug, page = 1) {
  try {
    // 1. Kiểm tra nhanh ở FE để chặn request thừa nếu thiếu slug
    if (!brandSlug) {
      return { brand: null, products: [], pagination: { totalPages: 1, totalItems: 0, currentPage: page } };
    }

    // 2. Gửi request GET tới Endpoint của Backend
    // Giả sử tiền tố route bạn cấu hình trong server.js/app.js là /brands hoặc /api/brands
    const response = await axiosClient.get(`/brands/${brandSlug}/products`, {
      params: {
        page: page,
        limit: ITEMS_LIMIT,
      },
    });

    // 3. Bóc tách dữ liệu sạch trả về từ cấu trúc mã JSON của Controller Backend
    const apiData = response?.data;
    console.log('🔵 [Service] Dữ liệu API trả về từ Backend:', apiData);
    // 4. Trả về Object chuẩn hóa để các Component React/Next.js sử dụng trực tiếp luôn
    return {
      brand: apiData?.brand || null,
      products: apiData?.products || [],
      pagination: apiData?.pagination || {
        totalPages: 1,
        totalItems: 0,
        currentPage: page,
        limit: limit
      }
    };

  } catch (error) {
    // Log lỗi chi tiết ở môi trường Development để bạn dễ trace khi debug
    console.error(`🔴 [Frontend Service Error] Lỗi khi fetch sản phẩm theo brand [${brandSlug}]:`, error.message);
    
    // Trả về dữ liệu dự phòng (Fallback) an toàn để giao diện không bị crash/vỡ khung
    return {
      brand: null,
      products: [],
      pagination: { totalPages: 1, totalItems: 0, currentPage: page, limit: limit }
    };
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
        limit: ITEMS_LIMIT,
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
export async function fetchAdminProducts(page = 1, limit = 6, searchKey = '') {
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

/**
 * 🟢 API SERVICE FRONTEND: Lấy danh sách sản phẩm gợi ý nhanh cho thanh Header
 * - Đã loại bỏ hoàn toàn param page, limit (vì Backend đã ép cứng xử lý lấy 5 sản phẩm).
 * - Trả về một Object gồm { data: [...], totalItems: X } thay vì chỉ trả về mảng đơn thuần.
 */
export async function fetchSearchSuggestions(keyword) {
  try {
    if (!keyword || !keyword.trim()) {
      return { data: [], totalItems: 0 };
    }

    // Gọi đúng endpoint tìm kiếm mới đã bóc tách cho Client
    const response = await axiosClient.get('/products/client/search-suggestions', {
      params: {
        keyword: keyword.trim(),
      },
    });

    // Vì Interceptor của bạn đã bỏ qua 1 lớp .data, nên 'response' lúc này 
    // chính là Object { success: true, data: [...], totalItems: X } do Backend trả về.
    return {
      data: response?.data || [],         // Mảng 5 sản phẩm để map lên UI dropdown
      totalItems: response?.totalItems || 0 // Tổng số lượng trong DB để quyết định ẩn/hiện nút "Xem tất cả"
    };

  } catch (error) {
    console.error(`🔴 [Service Frontend Error] Lỗi fetch gợi ý tìm kiếm:`, error.message);
    // Trả về cấu trúc mặc định an toàn khi gặp lỗi để Header không bị crash giao diện
    return { data: [], totalItems: 0 };
  }
}

/**
 * Lấy danh sách sản phẩm tìm kiếm phân trang dành riêng cho Client
 */
export async function fetchProductsBySearchForClient(keyword, page = 1, limit = ITEMS_LIMIT) {
  try {
    if (!keyword || !keyword.trim()) {
      return { products: [], pagination: { totalPages: 1, totalItems: 0, currentPage: page, limit } };
    }

    const response = await axiosClient.get('/products/client/search-full', {
      params: {
        keyword: keyword.trim(),
        page,
        limit,
      },
    });

    // Theo cấu trúc Backend trả về phẳng bằng toán tử spread (...result):
    // response.data chứa mảng sản phẩm, response.pagination chứa dữ liệu phân trang
    return {
      data: response?.data || [],
      pagination: response?.pagination || {
        totalPages: 1,
        totalItems: 0,
        currentPage: page,
        limit: limit
      }
    };
  } catch (error) {
    console.error(`🔴 [Service Error] Lỗi khi tìm kiếm sản phẩm phía Client với từ khóa [${keyword}]:`, error.message);
    return { 
      data: [], 
      pagination: { totalPages: 1, totalItems: 0, currentPage: page, limit } 
    };
  }
}