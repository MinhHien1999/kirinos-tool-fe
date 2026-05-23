'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
// Import trực tiếp các hàm xử lý dữ liệu từ tầng service của bạn
import { fetchAdminProducts, deleteProductService } from '@/services/productService';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Kích hoạt đồng bộ hóa danh sách mỗi khi số trang thay đổi
  useEffect(() => {
    loadProductsData(currentPage, search);
  }, [currentPage]);

  // Hàm load dữ liệu tập trung, nhận tham số trực tiếp để loại bỏ lỗi bất đồng bộ state React
  const loadProductsData = async (page = 1, searchKey = '') => {
    try {
      setLoading(true);
      setError('');

      const result = await fetchAdminProducts(page, 10, searchKey);
      
      setProducts(result.products || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Xảy ra lỗi khi kết nối dữ liệu sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce xử lý tìm kiếm nhanh gợi ý (Suggestions Dropdown) bằng Axios Service
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.trim().length > 1) {
        try {
          // Lấy nhanh tối đa 5 kết quả cho khung gợi ý
          const result = await fetchAdminProducts(1, 5, search);
          setSuggestions(result.products || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Lỗi lấy gợi ý tìm kiếm sản phẩm:', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Đóng bảng gợi ý khi người dùng click ra ngoài vùng dropdown ô input
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Thực thi xóa sản phẩm qua Axios Service
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      setError('');
      await deleteProductService(id);
      
      // Đồng bộ lại danh sách hiện tại sau khi xóa thành công
      loadProductsData(currentPage, search);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Xóa sản phẩm không thành công.');
    }
  };

  // Đóng gói chuỗi đường dẫn cây danh mục (Mục cha > Mục con)
  const buildCategoryPath = (category) => {
    if (!category) return '';
    const path = [];
    let current = category;
    let depth = 0; // Chốt chặn phòng vệ chống lặp dữ liệu vô hạn nếu DB bị liên kết chéo tuần hoàn

    while (current && depth < 5) {
      path.unshift(current.name);
      
      // Sửa lỗi loop vô hạn: Kiểm tra điều kiện tồn tại ID đối tượng của phần tử cha
      if (current.parent && (current.parent._id || current.parent.id)) {
        current = current.parent;
      } else {
        current = null;
      }
      depth++;
    }
    return path.join(' > ');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    if (currentPage !== 1) {
      setCurrentPage(1); // Set trang về 1 sẽ tự động kích hoạt useEffect chạy lại với trang 1
    } else {
      loadProductsData(1, search);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Khối tiêu đề trang */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Thêm, sửa, xóa và cấu hình sản phẩm trong hệ thống</p>
        </div>
        <Link
          href="/admin/products/add"
          className="w-full sm:w-auto text-center inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow transition-all active:scale-98"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {/* Thanh tìm kiếm kèm ô gợi ý kết quả tự động */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="flex flex-row gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm tên sản phẩm cần quản lý..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search.trim().length > 1 && setShowSuggestions(true)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />

            {/* Khung hiển thị Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-100">
                {suggestions.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSearch(item.name);
                      setShowSuggestions(false);
                      if (currentPage !== 1) {
                        setCurrentPage(1);
                      } else {
                        loadProductsData(1, item.name);
                      }
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 flex justify-between items-center transition-colors"
                  >
                    <span className="font-medium text-gray-900 line-clamp-1 pr-2">{item.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded shrink-0 font-mono">
                      {item.brand?.name || '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm rounded-lg font-medium transition-colors shrink-0"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mx-1">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Bảng quản lý tập trung */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 sm:w-28">Trạng thái</th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 sm:w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-900">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium animate-pulse">
                    Đang nạp dữ liệu sản phẩm bằng Axios...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5">
                      <p className="font-semibold text-gray-900 line-clamp-2 leading-snug">{product.name}</p>
                      
                      {/* Hiển thị gộp cho Mobile layout */}
                      <div className="sm:hidden mt-1.5 space-y-0.5 text-[11px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100">
                        {product.brand?.name && (
                          <p><span className="font-medium text-gray-700">Hãng:</span> {product.brand.name}</p>
                        )}
                        {product.category && (
                          <p className="line-clamp-1">
                            <span className="font-medium text-gray-700">Mục:</span> {buildCategoryPath(product.category)}
                          </p>
                        )}
                      </div>
                    </td>
                    
                    {/* Cột Desktop */}
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                      {product.brand?.name || '-'}
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-gray-500 max-w-xs truncate">
                      {buildCategoryPath(product.category) || '-'}
                    </td>

                    {/* Trạng thái kho */}
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] sm:text-xs font-semibold ${
                        product.status === 'in_stock' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {product.status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    
                    {/* Điều khiển tác vụ */}
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap font-medium text-center">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <Link 
                          href={`/admin/products/edit/${product._id}`} 
                          className="text-blue-600 hover:text-blue-900 py-1 px-2 hover:bg-blue-50 rounded transition-colors text-xs sm:text-sm"
                        >
                          Sửa
                        </Link>
                        <button 
                          onClick={() => handleDelete(product._id)} 
                          className="text-red-600 hover:text-red-900 py-1 px-2 hover:bg-red-50 rounded transition-colors text-xs sm:text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Phân trang */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={(page) => setCurrentPage(page)} 
          />
        </div>
      </div>
    </div>
  );
}