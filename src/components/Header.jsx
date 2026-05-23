'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Phone, Loader2 } from 'lucide-react';
import axiosClient from '@/config/axios';
import { isValidProductImageUrl } from '@/services/productService';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const searchRef = useRef(null);

  // Xử lý tìm kiếm gợi ý qua Axios (Debounce 300ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        // 🟢 Sử dụng axiosClient để đồng bộ IP/Domain API tự động
        const res = await axiosClient.get(`/products/search?keyword=${encodeURIComponent(query)}`);
        setResults(res.data?.data?.slice(0, 6) || []);
      } catch (e) { 
        console.error('Lỗi tìm kiếm gợi ý:', e.message); 
        setResults([]);
      } finally { 
        setLoading(false); 
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // Đóng dropdown gợi ý khi click ra ngoài vùng tìm kiếm
  useEffect(() => {
    const close = (e) => { 
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggest(false); 
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Sự kiện mở Sidebar trên thiết bị di động
  const toggleSidebar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new Event('toggle-sidebar'));
  };

  // Điều hướng khi nhấn Enter hoặc bấm nút tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
    setShowSuggest(false);
  };

  return (
    <header className="sticky top-0 z-[20] w-full bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 lg:h-24 flex items-center justify-between gap-4">
        
        {/* KHỐI LOGO & NÚT HAMBURGER DI ĐỘNG */}
        <div className="flex items-center gap-2 lg:w-1/4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-green-800 rounded-lg active:scale-90 transition-all text-white focus:outline-none"
            aria-label="Mở menu"
          >
            <Menu size={26} />
          </button>
          <Link href="/" className="shrink-0">
            <Image 
              src="/logo.png" 
              alt="Logo Kirinos" 
              width={160} 
              height={50} 
              className="h-10 lg:h-14 w-auto object-contain" 
              priority 
            />
          </Link>
        </div>

        {/* KHỐI THANH TÌM KIẾM TRUNG TÂM */}
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Bạn tìm thiết bị gì?..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
              className="w-full bg-white text-gray-900 rounded-full py-2.5 px-5 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-inner placeholder-gray-400 border border-transparent transition-all"
            />
            
            {/* Cụm icon trạng thái nằm gọn bên phải */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-1">
              {loading && (
                <Loader2 size={16} className="animate-spin text-gray-400 mr-1" />
              )}
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 transition-colors p-2 rounded-full text-white shadow-md active:scale-95"
                aria-label="Tìm kiếm"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Ô gợi ý kết quả thông minh dưới thanh tìm kiếm */}
          {showSuggest && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 text-gray-900 overflow-hidden z-[110] transition-all animate-in fade-in slide-in-from-top-1 duration-200">
              {results.length > 0 ? (
                results.map((product) => {
                  // Lọc ảnh hợp lệ từ mảng images cũ giống cấu trúc trang chủ
                  const firstValidImg = product.images?.find(i => i.type === 'image' && isValidProductImageUrl(i.url));
                  const displayImg = firstValidImg?.url || product.image || '/no-image.png';

                  return (
                    <Link 
                      key={product._id} 
                      href={`/product/${product.slug}`} 
                      className="flex items-center gap-3.5 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors group"
                      onClick={() => setShowSuggest(false)}
                    >
                      <div className="relative w-9 h-9 border border-gray-100 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                        <img 
                          src={displayImg} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </span>
                    </Link>
                  );
                })
              ) : (
                !loading && (
                  <div className="p-4 text-center text-sm text-gray-400 italic">
                    Không tìm thấy thiết bị phù hợp
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* KHỐI ĐIỆN THOẠI HOTLINE */}
        <div className="hidden lg:flex lg:w-1/4 justify-end">
          <div className="bg-green-800/80 px-4 py-2 rounded-xl flex items-center gap-3 border border-green-600/30 shadow-inner">
            <div className="bg-green-700 p-1.5 rounded-lg text-green-300">
              <Phone size={16} />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-green-200 mb-0.5">Liên hệ</p>
              <p className="font-bold text-[15px] tracking-wide text-white">0784 688 993</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}