'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Loader2 } from 'lucide-react';
import axiosClient from '@/config/axios';
import { isValidProductImageUrl } from '@/services/productService';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const searchRef = useRef(null);

  // Xử lý tìm kiếm gợi ý
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(
          `/products/search?keyword=${encodeURIComponent(query)}`,
        );
        setResults(res.data?.data?.slice(0, 6) || []);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  // Đóng gợi ý khi click ra ngoài
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
    setShowSuggest(false);
  };

  // Thành phần Form tìm kiếm dùng chung cho cả PC và Mobile nhằm tránh lặp logic thừa
  const SearchForm = () => (
    <form onSubmit={handleSearchSubmit} className="relative w-full">
      <input
        type="text"
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

  // Thành phần Dropdown gợi ý kết quả tìm kiếm dùng chung
  const SuggestionBox = () =>
    showSuggest &&
    query.trim() && (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 text-gray-900 overflow-hidden z-[110]">
        {results.length > 0 ? (
          results.map((product) => {
            const firstValidImg = product.images?.find(
              (i) => i.type === 'image' && isValidProductImageUrl(i.url),
            );
            const displayImg = firstValidImg?.url || '/no-image.png';

            return (
              <Link
                key={product._id}
                href={`/product/${product.slug}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                onClick={() => setShowSuggest(false)}
              >
                <img
                  src={displayImg}
                  alt=""
                  className="w-8 h-8 object-cover rounded border"
                />
                <span className="text-sm font-medium text-gray-700 line-clamp-1">
                  {product.name}
                </span>
              </Link>
            );
          })
        ) : (
          !loading && (
            <div className="p-3 text-center text-xs text-gray-400 italic">
              Không tìm thấy sản phẩm
            </div>
          )
        )}
      </div>
    );

  return (
    <header className="sticky top-0 z-[20] w-full bg-[#41995b] shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3.5" ref={searchRef}>
        
        {/* HÀNG CHÍNH */}
        <div className="flex items-center justify-between lg:gap-8 mb-3 lg:mb-0">
          
          {/* KHỐI LOGO */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded"
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
                className="h-24 lg:h-24 w-auto object-contain transition-all duration-200"
                priority
              />
            </Link>
          </div>

          {/* 🟢 THANH TÌM KIẾM TRÊN PC: Ẩn trên mobile, hiện và căn giữa ở PC */}
          <div className="hidden lg:block flex-1 max-w-xl relative">
            <SearchForm />
            <SuggestionBox />
          </div>

          {/* KHỐI HOTLINE */}
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

        {/* 🟢 THANH TÌM KIẾM TRÊN MOBILE: Hiện trên mobile (`block`), ẩn hoàn toàn trên PC (`lg:hidden`) */}
        <div className="block lg:hidden relative">
          <SearchForm />
          <SuggestionBox />
        </div>
        
      </div>
    </header>
  );
}