import axiosClient from '@/config/axios';

/**
 * Lấy toàn bộ danh sách thương hiệu (Hỗ trợ phân trang, giới hạn, và tìm kiếm)
 */
export async function fetchBrands(page = 1, limit = 10, searchKey = '') {
  try {
    const response = await axiosClient.get('/brands', {
      params: {
        page: page,
        limit: limit,
        ...(searchKey.trim() && { search: searchKey.trim() }),
      },
    });

    const result = response.data;
    return {
      brands: result.data?.brands || result.brands || [],
      pagination: result.data?.pagination || result.pagination || { totalPages: 1, totalItems: 0 },
    };
  } catch (error) {
    console.error('Error fetching brands with Axios:', error.message);
    return { brands: [], pagination: { totalPages: 1, totalItems: 0 } };
  }
}

/**
 * Lấy chi tiết thông tin một thương hiệu bằng ID
 */
export async function fetchBrandById(id) {
  try {
    const response = await axiosClient.get(`/brands/${id}`);
    const result = response.data;
    return result.data || result || null;
  } catch (error) {
    console.error(`Error fetching brand details (${id}) with Axios:`, error.message);
    return null;
  }
}

/**
 * Thêm mới một thương hiệu (Tự động nhận diện Object thường hoặc FormData chứa File ảnh)
 */
export async function createBrand(data) {
  try {
    const isFormData = data instanceof FormData;
    const response = await axiosClient.post('/brands', data, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating brand with Axios:', error.message);
    throw error;
  }
}

/**
 * Cập nhật thông tin thương hiệu theo ID (Tự động nhận diện Object thường hoặc FormData chứa File ảnh)
 */
export async function updateBrand(id, data) {
  try {
    const isFormData = data instanceof FormData;
    const response = await axiosClient.put(`/brands/${id}`, data, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating brand (${id}) with Axios:`, error.message);
    throw error;
  }
}

/**
 * Xóa một thương hiệu khỏi hệ thống bằng ID
 */
export async function deleteBrand(id) {
  try {
    const response = await axiosClient.delete(`/brands/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting brand (${id}) with Axios:`, error.message);
    throw error;
  }
}