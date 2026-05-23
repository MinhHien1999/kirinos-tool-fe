import axiosClient from '@/config/axios';

/**
 * Lấy toàn bộ danh sách danh mục (Hỗ trợ phân trang, giới hạn, và tìm kiếm)
 */
export async function fetchCategories(page = 1, limit = 10, searchKey = '') {
  try {
    const response = await axiosClient.get('/categories', {
      params: {
        page: page,
        limit: limit,
        ...(searchKey.trim() && { search: searchKey.trim() }),
      },
    });

    const result = response.data;
    return {
      categories: result.data?.categories || result.categories || [],
      pagination: result.data?.pagination || result.pagination || { totalPages: 1, totalItems: 0 },
    };
  } catch (error) {
    console.error('Error fetching categories with Axios:', error.message);
    return { categories: [], pagination: { totalPages: 1, totalItems: 0 } };
  }
}

/**
 * Lấy chi tiết thông tin một danh mục bằng ID
 */
export async function fetchCategoryById(id) {
  try {
    const response = await axiosClient.get(`/categories/${id}`);
    const result = response.data;
    return result.data || result || null;
  } catch (error) {
    console.error(`Error fetching category details (${id}) with Axios:`, error.message);
    return null;
  }
}

/**
 * Thêm mới một danh mục (Tự động nhận diện Object thường hoặc FormData chứa File ảnh)
 */
export async function createCategory(data) {
  try {
    const isFormData = data instanceof FormData;
    const response = await axiosClient.post('/categories', data, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category with Axios:', error.message);
    throw error;
  }
}

/**
 * Cập nhật thông tin danh mục theo ID (Tự động nhận diện Object thường hoặc FormData chứa File ảnh)
 */
export async function updateCategory(id, data) {
  try {
    const isFormData = data instanceof FormData;
    const response = await axiosClient.put(`/categories/${id}`, data, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating category (${id}) with Axios:`, error.message);
    throw error;
  }
}

/**
 * Xóa một danh mục khỏi hệ thống bằng ID
 */
export async function deleteCategory(id) {
  try {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category (${id}) with Axios:`, error.message);
    throw error;
  }
}