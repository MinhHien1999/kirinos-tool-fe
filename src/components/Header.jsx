'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Loader2, SearchCode } from 'lucide-react';
import { fetchSearchSuggestions, isValidProductImageUrl } from '@/services/productService';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalItems, setTotalItems] = useState(0); // 🟢 Lưu trữ tổng số lượng tìm thấy trong DB
  const [loading, setLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const searchRef = useRef(null);

  // Xử lý lấy gợi ý tìm kiếm nhanh (Debounce 300ms chuẩn UI/UX, gõ đến đâu mượt đến đấy)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalItems(0);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const delay = setTimeout(async () => {
      try {
        // API mới trả về cấu trúc phẳng: { data: [...5 cái], totalItems: X }
        const res = await fetchSearchSuggestions(query);
        setResults(res.data || []);
        setTotalItems(res.totalItems || 0);
      } catch (error) {
        console.error('🔴 Lỗi gọi gợi ý tìm kiếm nhanh tại Header:', error);
        setResults([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    }, 300); // 🟢 Chỉnh lại 300ms gõ chữ cho nhạy, 2000ms quá chậm

    return () => clearTimeout(delay);
  }, [query]);

  // Đóng hộp gợi ý khi click ra ngoài vùng tìm kiếm
  useEffect(() => {
    const close = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggleSidebar = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('toggle-sidebar'));
  };

  // Điều hướng khi bấm Enter hoặc click icon Tìm kiếm -> Chuyển sang trang search tổng
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
    setShowSuggest(false);
  };

  // Hàm render Form tìm kiếm dùng chung
  const renderSearchForm = () => (
    <form onSubmit={handleSearchSubmit} className="relative w-full">
      <input
        type="text"
        autoComplete="off"
        placeholder="Nhập từ khóa để tìm kiếm sản phẩm"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggest(true);
        }}
        onFocus={() => setShowSuggest(true)}
        className="w-full bg-gray-50 text-gray-900 rounded-lg py-2.5 px-4 pr-12 focus:outline-none focus:ring-1 focus:ring-gray-300 border border-gray-300 text-sm placeholder-gray-500 transition-all"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {loading && (
          <Loader2 size={16} className="animate-spin text-gray-400" />
        )}
        <button type="submit" className="text-gray-400 hover:text-gray-600">
          <Search size={20} />
        </button>
      </div>
    </form>
  );

  // Hàm render Hộp gợi ý kết quả tìm kiếm thông minh (Dropdown)
  const renderSuggestionBox = () => {
    if (!showSuggest || !query.trim()) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 text-gray-900 overflow-hidden z-[110]">
        
        {/* 1. Trạng thái đang tải dữ liệu lần đầu */}
        {loading && results.length === 0 && (
          <div className="p-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin text-[#41995b]" />
            <span>Đang tìm kiếm sản phẩm...</span>
          </div>
        )}

        {/* 2. Trạng thái đã có dữ liệu sản phẩm phù hợp */}
        {results.length > 0 && (
          <>
            <div className="max-h-[350px] overflow-y-auto">
              {results.map((product) => {
                const firstValidImg = product.images?.find(
                  (i) => i.type === 'image' && isValidProductImageUrl(i.url),
                );
                const displayImg = firstValidImg?.url || product.image || '/no-image.png';

                return (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                    onClick={() => setShowSuggest(false)}
                  >
                    {/* Khung bọc ảnh vuông vắn cố định kích thước */}
                    <div className="w-9 h-9 relative rounded border border-gray-100 flex-shrink-0 overflow-hidden bg-gray-50">
                      <Image
                        src={displayImg}
                        alt={product.name || 'Product Image'}
                        fill
                        sizes="36px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 line-clamp-1 hover:text-blue-600">
                      {product.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* 🟢 KHỐI NÚT XEM TẤT CẢ: Hiện nút nếu tổng số item trong DB lớn hơn số lượng hiển thị (5 cái) */}
            {totalItems > results.length && (
              <Link
                href={`/search?keyword=${encodeURIComponent(query.trim())}`}
                className="block text-center py-2.5 bg-gray-50 border-t border-gray-100 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                onClick={() => setShowSuggest(false)}
              >
                {"Xem tất cả "}{totalItems}{" kết quả tìm kiếm cho \""}{query.trim()}{"\""}
              </Link>
            )}
          </>
        )}

        {/* 3. Trạng thái tải xong nhưng hoàn toàn trống */}
        {!loading && results.length === 0 && (
          <div className="p-4 text-center text-xs text-gray-400 italic flex items-center justify-center gap-1.5">
            <span>Không tìm thấy sản phẩm phù hợp</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-[20] w-full bg-[#41995b] shadow-sm border-b border-b-black/5">
      <div className="max-w-7xl mx-auto px-4 py-3.5" ref={searchRef}>
        
        {/* HÀNG CHÍNH (Giao diện PC) */}
        <div className="flex items-center justify-between lg:gap-8 mb-3 lg:mb-0">
          
          {/* KHỐI LOGO & MENU MOBILE */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 text-white hover:bg-[#347a49] rounded transition-colors"
              aria-label="Mở menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="shrink-0">
              <Image
                src="/logo.png"
                alt="Logo Kirinos"
                width={200}
                height={70}
                className="h-16 lg:h-20 w-auto object-contain transition-all duration-200"
                priority
              />
            </Link>
          </div>

          {/* THANH TÌM KIẾM TRÊN PC */}
          <div className="hidden lg:block flex-1 max-w-xl relative">
            {renderSearchForm()}
            {renderSuggestionBox()}
          </div>

          {/* HOTLINE LIÊN HỆ */}
          <div className="text-left flex flex-col justify-center gap-0.5 shrink-0">
            <div className="bg-red-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-red-100 shadow-sm">
              <div className="bg-red-200/60 p-1.5 rounded-lg text-red-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-phone"
                  aria-hidden="true"
                >
                  <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-gray-500 mb-0.5">
                  Liên hệ
                </p>
                <p className="font-bold text-[15px] tracking-wide text-red-600">
                  0784 688 993
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* THANH TÌM KIẾM TRÊN MOBILE */}
        <div className="block lg:hidden relative mt-1">
          {renderSearchForm()}
          {renderSuggestionBox()}
        </div>
        
      </div>
    </header>
  );
}