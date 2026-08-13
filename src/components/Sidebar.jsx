'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, X, LayoutGrid, WifiOff, Loader2 } from 'lucide-react';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/categories`;
const ITEMS_PER_PAGE = 12;

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hover state cho Mega Menu Flyout
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [flyoutTop, setFlyoutTop] = useState(0); 
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);

  const sidebarContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const fetchCategories = useCallback(async (pageNum) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE_URL}?page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) throw new Error('Không thể tải danh mục');

      const result = await response.json();
      const newCats = result.data?.categories || [];
      const pagination = result.data?.pagination || {};

      setCategories(prev => {
        const combined = [...prev, ...newCats];
        const uniqueMap = new Map(combined.map(item => [item._id || item.id, item]));
        const uniqueList = Array.from(uniqueMap.values());

        return uniqueList.sort((a, b) =>
          a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
        );
      });

      if (typeof pagination.hasMore !== 'undefined') {
        setHasMore(pagination.hasMore);
      } else {
        setHasMore(pageNum < (pagination.totalPages || 1));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    fetchCategories(1);

    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);

    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, [fetchCategories]);

  // Auto-Fill Trigger
  useEffect(() => {
    if (!isLoading && hasMore && scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      if (scrollHeight <= clientHeight && categories.length > 0) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCategories(nextPage);
      }
    }
  }, [categories, isLoading, hasMore, page, fetchCategories]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasMore && !isLoading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCategories(nextPage);
      }
    }
    setHoveredCategory(null);
  };

  // 🎯 TÍNH VỊ TRÍ TOP CHUẨN XÁC ĐỂ MENU CON THẲNG HÀNG VỚI DANH MỤC CHA
  const handleItemMouseEnter = (cat, e) => {
    setHoveredCategory(cat);
    
    if (sidebarContainerRef.current) {
      const sidebarRect = sidebarContainerRef.current.getBoundingClientRect();
      const itemRect = e.currentTarget.getBoundingClientRect();
      
      // Khoảng cách từ mép trên của Sidebar đến mép trên của danh mục đang hover
      const relativeTop = itemRect.top - sidebarRect.top;
      setFlyoutTop(relativeTop);
    }
  };

  if (!mounted) return null;

  const handleCloseMobile = () => {
    setIsOpen(false);
    setActiveMobileCategory(null);
  };

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={handleCloseMobile}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        ref={sidebarContainerRef}
        className={`
          fixed inset-y-0 left-0 z-[70] w-80 bg-white transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:w-72 lg:shrink-0 lg:z-10 lg:sticky lg:top-20 lg:relative
          h-screen lg:h-[calc(100vh-6rem)] flex flex-col min-h-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div className="h-full flex-1 flex flex-col bg-white border-r lg:border lg:rounded-3xl lg:shadow-sm border-gray-100 relative min-h-0">

          {/* HEADER MOBILE */}
          <div className="p-4 border-b flex items-center justify-between lg:hidden bg-gray-50/80 backdrop-blur shrink-0">
            {activeMobileCategory ? (
              <button
                onClick={() => setActiveMobileCategory(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-green-700 transition-colors"
              >
                <ChevronLeft size={18} />
                Quay lại
              </button>
            ) : (
              <h2 className="font-black text-green-700 uppercase tracking-tight text-sm">Danh mục sản phẩm</h2>
            )}

            <button onClick={handleCloseMobile} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* HEADER DESKTOP */}
          <div className="p-3 pb-0 hidden lg:block shrink-0">
            <h2 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2 px-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Danh mục
            </h2>
          </div>

          {/* DANH SÁCH DANH MỤC */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="p-3 overflow-y-auto no-scrollbar flex-1 min-h-0"
          >
            {isError && categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-5 text-center border border-dashed border-red-200 rounded-2xl bg-red-50/50">
                <WifiOff size={22} className="text-red-400 mb-1.5" />
                <p className="text-xs font-bold text-red-700">Lỗi kết nối dữ liệu</p>
              </div>
            ) : (
              <>
                {/* VIEW MOBILE */}
                <div className="lg:hidden">
                  {!activeMobileCategory ? (
                    <ul className="flex flex-col gap-1">
                      {categories.map((cat) => {
                        const hasChildren = cat.children?.length > 0;
                        return (
                          <li key={cat._id || cat.id}>
                            {hasChildren ? (
                              <button
                                onClick={() => setActiveMobileCategory(cat)}
                                className="w-full flex items-center justify-between p-3 rounded-xl font-bold text-gray-800 hover:bg-gray-50 text-left transition-colors text-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <LayoutGrid size={18} className="text-green-600 shrink-0" />
                                  <span>{cat.name}</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400" />
                              </button>
                            ) : (
                              <Link
                                href={`/category/${encodeURIComponent(cat.slug || cat._id)}`}
                                onClick={handleCloseMobile}
                                className="flex items-center gap-3 p-3 rounded-xl font-bold text-gray-800 hover:bg-gray-50 transition-colors text-sm"
                              >
                                <LayoutGrid size={18} className="text-green-600 shrink-0" />
                                <span>{cat.name}</span>
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div>
                      <div className="p-3 mb-2 bg-green-50 rounded-xl">
                        <p className="text-[10px] text-green-800 font-bold uppercase tracking-wider">Đang xem nhóm</p>
                        <h3 className="text-sm font-extrabold text-green-900">{activeMobileCategory.name}</h3>
                      </div>

                      <ul className="flex flex-col gap-1">
                        <li>
                          <Link
                            href={`/category/${encodeURIComponent(activeMobileCategory.slug || activeMobileCategory._id)}`}
                            onClick={handleCloseMobile}
                            className="block p-3 rounded-xl font-bold text-green-700 bg-green-50/50 hover:bg-green-100 transition-colors text-xs"
                          >
                            Xem tất cả {activeMobileCategory.name} →
                          </Link>
                        </li>

                        {activeMobileCategory.children?.map((child) => (
                          <li key={child._id || child.id}>
                            <Link
                              href={`/category/${encodeURIComponent(child.slug || child._id)}`}
                              onClick={handleCloseMobile}
                              className="block p-3 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-colors"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* VIEW DESKTOP */}
                <ul className="hidden lg:flex flex-col gap-1">
                  {categories.map((cat) => {
                    const hasChildren = cat.children?.length > 0;
                    const isHovered = hoveredCategory?._id === cat._id;

                    return (
                      <li
                        key={cat._id || cat.id}
                        onMouseEnter={(e) => handleItemMouseEnter(cat, e)}
                      >
                        <Link
                          href={`/category/${encodeURIComponent(cat.slug || cat._id)}`}
                          className={`
                            flex items-center justify-between p-3 rounded-2xl transition-all duration-200 text-sm font-bold
                            ${isHovered ? 'bg-green-50 text-green-800 shadow-sm' : 'text-gray-800 hover:bg-gray-50'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <LayoutGrid size={18} className={isHovered ? 'text-green-600' : 'text-gray-400'} />
                            <span>{cat.name}</span>
                          </div>

                          {hasChildren && (
                            <ChevronRight
                              size={16}
                              className={`transition-transform duration-200 ${
                                isHovered ? 'text-green-600 translate-x-0.5' : 'text-gray-300'
                              }`}
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {isLoading && (
                  <div className="flex items-center justify-center py-4 text-green-600 gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-xs font-medium text-gray-400">Đang tải thêm...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 🟢 MEGA MENU FLYOUT CHUẨN VỊ TRÍ VA CÓ CẦU NỐI HOÀN HẢO */}
        {hoveredCategory && hoveredCategory.children?.length > 0 && (
          <div
            className="hidden lg:block absolute left-full pl-4 w-[520px] z-50 transition-all duration-75"
            style={{ top: `${flyoutTop}px` }}
            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {/* 🔗 CẦU NỐI VÔ HÌNH: Đảm bảo rê chuột ngang không bị chập chờn hay mất menu */}
            <div className="absolute top-0 -left-6 bottom-0 w-8 bg-transparent" />

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 w-full relative">
              <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{hoveredCategory.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Danh mục chi tiết dụng cụ & thiết bị</p>
                </div>
                <Link
                  href={`/category/${encodeURIComponent(hoveredCategory.slug || hoveredCategory._id)}`}
                  className="text-xs font-bold text-green-600 hover:text-green-800 hover:underline"
                >
                  Xem tất cả →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto no-scrollbar pr-2">
                {hoveredCategory.children.map((child) => (
                  <Link
                    key={child._id || child.id}
                    href={`/category/${encodeURIComponent(child.slug || child._id)}`}
                    className="group p-2.5 rounded-xl hover:bg-green-50/70 transition-all flex items-center justify-between border border-transparent hover:border-green-100"
                  >
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-green-800">
                      {child.name}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-green-600 transition-all -translate-x-1 group-hover:translate-x-0"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}