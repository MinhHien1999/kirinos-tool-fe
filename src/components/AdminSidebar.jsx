'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/products', label: 'Sản phẩm', icon: '📦' },
    { href: '/admin/brands', label: 'Thương hiệu', icon: '🏢' },
    { href: '/admin/categories', label: 'Danh mục', icon: '🏷️' },
  ];

  // Lắng nghe tín hiệu nhấn nút Hamburger từ AdminHeader
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-admin-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-admin-sidebar', handleToggle);
  }, []);

  return (
    <>
      {/* Lớp nền mờ Overlay khi mở menu trên điện thoại */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Thanh Điều Hướng Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200/50 shadow-xl lg:shadow-none
          transition-transform duration-300 lg:static lg:translate-x-0 lg:z-0
          lg:min-h-[calc(100vh-4rem)] min-h-screen pt-16 lg:pt-0 shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-4 sticky top-16">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)} // Tự động đóng sidebar sau khi bấm link trên mobile
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}