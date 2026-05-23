'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import { fetchCategories as getCategoriesService, deleteCategory } from '@/services/categoryService';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // States phục vụ việc gợi ý (Suggestions)
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Fetch dữ liệu chính cho bảng dựa theo số trang và từ khóa chính thức
  useEffect(() => {
    loadCategoriesData(currentPage, search);
  }, [currentPage]);

  // Hàm load dữ liệu tường minh, truyền tham số trực tiếp để tránh bất đồng bộ State của React
  const loadCategoriesData = async (page = 1, searchKey = '') => {
    try {
      setLoading(true);
      setError('');

      const result = await getCategoriesService(page, 10, searchKey);
      
      setCategories(result.categories || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Xảy ra lỗi khi tải danh sách danh mục.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Ổn định tính năng gợi ý khi người dùng gõ phím (Debounce 300ms) bằng Service
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.trim().length > 1) {
        try {
          const result = await getCategoriesService(1, 5, search);
          setSuggestions(result.categories || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Lỗi tìm gợi ý:', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // 3. Đóng dropdown khi click ra ngoài vùng tìm kiếm
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xóa danh mục bằng Axios Service
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      setError('');
      await deleteCategory(id);
      // Nạp lại danh sách dữ liệu chính xác tại trang và từ khóa hiện tại
      loadCategoriesData(currentPage, search);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Xóa danh mục không thành công.');
    }
  };

  /**
   * 🟢 Sửa lỗi nghiêm trọng: Tránh vòng lặp vô hạn (Infinite Loop)
   * Kiểm tra thuộc tính id của đối tượng parent thay vì kiểm tra thực thể Object
   */
  const getCategoryLevel = (category) => {
    let level = 0;
    let current = category;
    
    // Nếu parent là một object chứa ID, duyệt sâu xuống để tính cấp bậc thụt lề
    while (current && current.parent && (current.parent._id || current.parent.id)) {
      level++;
      current = current.parent;
      // Giới hạn an toàn chống loop lỗi cấu trúc DB vòng lặp chéo
      if (level > 5) break; 
    }
    return level;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    if (currentPage !== 1) {
      setCurrentPage(1); // Chuyển trang về 1 sẽ tự kích hoạt useEffect đồng bộ lại dữ liệu
    } else {
      loadCategoriesData(1, search);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header điều khiển */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa và quản lý danh mục sản phẩm</p>
        </div>
        <Link
          href="/admin/categories/add"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Thêm danh mục
        </Link>
      </div>

      {/* Thanh tìm kiếm kèm ô gợi ý kết quả */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search.trim().length > 1 && setShowSuggestions(true)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      const targetName = item.name;
                      setSearch(targetName);
                      setShowSuggestions(false);
                      if (currentPage !== 1) {
                        setCurrentPage(1);
                      } else {
                        loadCategoriesData(1, targetName);
                      }
                    }}
                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 flex justify-between items-center transition-colors"
                  >
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-xs font-mono text-gray-400">{item.slug}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Bảng quản lý danh mục */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục cha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium">Đang tải dữ liệu danh mục...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium">Chưa có danh mục nào tương thích</td>
                </tr>
              ) : (
                categories.map((category) => {
                  const level = getCategoryLevel(category);
                  return (
                    <tr key={category._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {/* 🟢 Tối ưu hiển thị thụt lề cấp bậc danh mục bằng style padding an toàn */}
                        <div style={{ paddingLeft: `${level * 20}px` }} className="flex items-center gap-1.5">
                          {level > 0 && <span className="text-gray-300 font-mono">└──</span>}
                          <span>{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-[13px]">{category.slug}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{category.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {category.parent?.name || <span className="text-gray-400 italic text-xs">Gốc (Root)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/categories/edit/${category._id}`} className="text-blue-600 hover:text-blue-900 mr-4 transition-colors">Sửa</Link>
                        <button onClick={() => handleDelete(category._id)} className="text-red-600 hover:text-red-900 transition-colors">Xóa</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh điều hướng phân trang */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/30">
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