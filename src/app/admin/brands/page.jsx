'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Pagination from '@/components/Pagination';
import { fetchBrands as getBrandsService, deleteBrand } from '@/services/brandService';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  
  // State quản lý việc Mount để format ngày tháng an toàn trên Client, tránh lỗi lệch múi giờ với Server Vercel
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Gọi nạp dữ liệu mỗi khi thay đổi số trang kích hoạt
  useEffect(() => {
    loadBrandsData(currentPage, search);
  }, [currentPage]);

  // Hàm load dữ liệu tường minh, nhận tham số trực tiếp để tránh bẫy state bất đồng bộ
  const loadBrandsData = async (page = 1, searchKey = '') => {
    try {
      setLoading(true);
      setError('');

      const result = await getBrandsService(page, 10, searchKey);
      
      setBrands(result.brands || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Xảy ra lỗi khi tải danh sách thương hiệu.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý debounce hiển thị gợi ý ô tìm kiếm nhanh bằng service
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.trim().length > 1) {
        try {
          const result = await getBrandsService(1, 5, search);
          setSuggestions(result.brands || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Lỗi lấy gợi ý tìm kiếm:', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Click bên ngoài đóng danh sách gợi ý
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xóa bản ghi và đồng bộ lại danh sách
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa brand này?')) return;
    try {
      setError('');
      await deleteBrand(id);
      // Gọi lại trang hiện tại với từ khóa tìm kiếm hiện tại
      loadBrandsData(currentPage, search);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Xóa thương hiệu không thành công.');
    }
  };

  // Submit form tìm kiếm chính thức
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    if (currentPage !== 1) {
      setCurrentPage(1); // Thay đổi này sẽ kích hoạt useEffect [currentPage] chạy lại với trang 1
    } else {
      loadBrandsData(1, search);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thương hiệu</h1>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa và quản lý thương hiệu trong hệ thống</p>
        </div>
        <Link
          href="/admin/brands/add"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Thêm thương hiệu
        </Link>
      </div>

      {/* Thanh công cụ tìm kiếm */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm thương hiệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search.trim().length > 1 && setShowSuggestions(true)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />

            {/* Khung gợi ý thông minh */}
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
                        loadBrandsData(1, targetName);
                      }
                    }}
                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 flex justify-between items-center transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {item.name}
                    </span>

                    {item.logo && typeof item.logo === 'string' && item.logo.trim() !== '' ? (
                      <Image 
                        src={item.logo} 
                        alt={item.name || "brand logo"} 
                        width={24}  
                        height={24} 
                        className="object-cover rounded flex-shrink-0 border border-gray-100"
                        unoptimized 
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            Tìm kiếm
          </button>
        </form>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">{error}</div>}

      {/* Bảng hiển thị dữ liệu tập trung */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-medium">Đang tải dữ liệu hệ thống...</td></tr>
              ) : brands.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium">Không tìm thấy thương hiệu phù hợp.</td></tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-semibold text-gray-900">{brand.name}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-[13px]">{brand.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {brand.logo ? (
                        <Image 
                          src={brand.logo} 
                          alt={brand.name} 
                          width={32} // 🟢 Fix: Thêm kích thước bắt buộc cho Next.js Image
                          height={32} // 🟢 Fix: Ngăn chặn lỗi vỡ layout crash runtime
                          className="h-8 w-8 rounded object-cover border border-gray-100" 
                          unoptimized
                        />
                      ) : (
                        <span className="text-gray-400 italic text-xs">Không có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {isMounted && brand.createdAt ? new Date(brand.createdAt).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/brands/edit/${brand._id}`} className="text-blue-600 hover:text-blue-900 mr-4 transition-colors">Sửa</Link>
                      <button onClick={() => handleDelete(brand._id)} className="text-red-600 hover:text-red-900 transition-colors">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Thanh chuyển trang phân trang */}
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