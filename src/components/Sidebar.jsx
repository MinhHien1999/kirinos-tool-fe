'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, X, LayoutGrid, WifiOff } from 'lucide-react';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/categories?limit=100`;

// 🟢 Định nghĩa hàm xây dựng cây danh mục ở ngoài để tránh lỗi hoisting và tăng tốc re-render
function buildCategoryTree(cats) {
  if (!Array.isArray(cats)) return [];
  const nodes = new Map(cats.map(c => [c._id || c.id || c.slug, { ...c, children: [] }]));
  const roots = [];
  nodes.forEach(c => {
    const pId = c.parent?._id || c.parent;
    if (pId && nodes.has(pId)) nodes.get(pId).children.push(c);
    else roots.push(c);
  });
  return roots;
}

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isError, setIsError] = useState(false); // Quản lý trạng thái lỗi kết nối mạng

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setIsError(false);
        const response = await fetch(API_URL, { signal: controller.signal });
        
        if (!response.ok) {
          throw new Error('Mạng phản hồi không ổn định');
        }

        const result = await response.json();
        const rawCats = result.data?.categories || result.categories || [];
        setCategories(buildCategoryTree(rawCats));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load categories:', error);
          setIsError(true);
        }
      } finally {
        // 🟢 Cập nhật mounted đồng bộ ở cuối để tối ưu hóa thứ tự render của React
        setMounted(true);
      }
    };

    loadData();

    // Lắng nghe sự kiện từ Hamburger ẩn/hiện menu di động
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('toggle-sidebar', handleToggle);
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      controller.abort(); // Hủy request đang chạy nếu component bị unmount
    };
  }, []);

  // Chặn hiện tượng bất đồng bộ cấu trúc HTML ban đầu giữa server và client
  if (!mounted) return null;

  // Hàm render đệ quy cấu trúc danh mục con
  const renderCategory = (category, level = 0) => {
    const slug = category.slug || category._id;
    const href = `/category/${encodeURIComponent(slug)}`;
    
    return (
      <li key={category._id || category.id} className="w-full">
        <Link
          href={href}
          onClick={() => setIsOpen(false)}
          className={`group relative flex items-center gap-3 transition-all duration-200
            ${level === 0 
              ? 'font-bold text-gray-800 hover:bg-gray-50 p-3 rounded-2xl mb-1' 
              : 'ml-9 py-2.5 text-gray-500 hover:text-green-700 text-[14px]'}`}
        >
          {/* Icon ô vuông cho danh mục gốc */}
          {level === 0 && (
            <div className="text-green-600 shrink-0">
              <LayoutGrid size={20} strokeWidth={2.5} />
            </div>
          )}

          {/* Đường kẻ cong tinh tế cho danh mục con */}
          {level > 0 && (
            <div className="absolute left-[-20px] top-0 bottom-1/2 w-5 border-l-2 border-b-2 border-gray-200 rounded-bl-xl group-hover:border-green-300 transition-colors" />
          )}

          <span className="relative z-10">{category.name}</span>
          
          {category.children?.length > 0 && level === 0 && (
            <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-green-600 transition-colors" />
          )}
        </Link>

        {category.children?.length > 0 && (
          <ul className="flex flex-col">
            {category.children.map(child => renderCategory(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* LỚP PHỦ OVERLAY KHI MENU DI ĐỘNG ĐƯỢC MỞ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] lg:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* THANH SIDEBAR CHỨA DANH MỤC */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-white transition-transform duration-300 lg:static lg:translate-x-0 lg:w-72 lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full lg:h-fit flex flex-col bg-white border-r lg:border lg:rounded-[32px] lg:shadow-sm overflow-hidden border-gray-100">
          
          {/* Tiêu đề hiển thị trên phiên bản di động */}
          <div className="p-5 border-b flex items-center justify-between lg:hidden bg-gray-50">
            <h2 className="font-black text-green-700 uppercase tracking-tighter">Danh mục sản phẩm</h2>
            <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-red-500">
              <X size={24} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto lg:overflow-visible">
            {/* Tiêu đề hiển thị trên máy tính để bàn */}
            <h2 className="hidden lg:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-6 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Danh mục
            </h2>

            <ul className="flex flex-col gap-1">
              {isError ? (
                // Hiển thị trực quan khi kết nối backend thất bại
                <div className="flex flex-col items-center justify-center p-5 text-center border border-dashed border-red-200 rounded-2xl bg-red-50/50">
                  <WifiOff size={22} className="text-red-400 mb-1.5" />
                  <p className="text-xs font-bold text-red-700">Lỗi kết nối dữ liệu</p>
                  <p className="text-[10px] text-red-500 mt-0.5">Vui lòng khởi động Server API (Port 3001)</p>
                </div>
              ) : categories.length > 0 ? (
                categories.map(cat => renderCategory(cat))
              ) : (
                // Hiển thị khung tải giả lập (Skeleton)
                <div className="space-y-4 px-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}