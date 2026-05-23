'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { LogOut, User, ChevronDown, ShieldAlert, Menu } from 'lucide-react';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  // Phát sự kiện mở/đóng Sidebar Admin toàn cục
  const toggleAdminSidebar = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('toggle-admin-sidebar'));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="w-full px-6 md:px-8 h-16 flex items-center justify-between">
        
        {/* Khối bên trái: Nút Hamburger Mobile & Logo */}
        <div className="flex items-center gap-3">
          {/* Nút Hamburger chỉ hiển thị trên Mobile và Tablet */}
          <button
            onClick={toggleAdminSidebar}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg active:scale-90 transition-all text-slate-300"
          >
            <Menu size={24} />
          </button>

          <Link href="/admin" className="shrink-0 flex items-center">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={120} 
              height={35} 
              className="h-8 w-auto object-contain brightness-0 invert" 
              priority 
            />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert size={12} />
            Hệ thống Quản trị
          </span>
        </div>

        {/* Khối bên phải: Tài khoản Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-all active:scale-95 text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-xs text-slate-400">Xin chào,</p>
              <p className="text-sm font-semibold text-slate-200 max-w-[120px] truncate">
                {user?.name || 'Quản trị viên'}
              </p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
              <Link
                href="/"
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} className="text-gray-400" />
                Xem trang chủ
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors text-left"
              >
                <LogOut size={16} className="text-red-500" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}