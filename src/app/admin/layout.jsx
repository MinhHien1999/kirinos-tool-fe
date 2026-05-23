'use client';

import AdminGuard from '@/components/AdminGuard';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      {/* 1. Header quản trị độc quyền nền tối */}
      <AdminHeader />

      {/* 2. Khung bố cục Flex ép rộng tràn viền sát đáy Header */}
      <div 
        className="flex flex-col lg:flex-row bg-gray-100 min-h-[calc(100vh-4rem)] relative"
        style={{
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
        }}
      >
        {/* 3. Gọi Sidebar Admin chuyên dụng */}
        <AdminSidebar />

        {/* 4. Ruột nội dung hiển thị bảng biểu Admin */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden bg-slate-50/50">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}