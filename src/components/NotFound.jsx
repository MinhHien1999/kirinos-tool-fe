'use client';

import React from 'react';
// ❌ Xóa dòng cũ này: import { Link } from 'react-router-dom';
//  Thay bằng dòng chuẩn của Next.js:
import Link from 'next/link';

const NotFound = ({ 
  title = "Không tìm thấy nội dung", 
  message = "Dữ liệu bạn yêu cầu không tồn tại hoặc đã bị xóa khỏi hệ thống.", 
  backLink = "/admin/products", 
  backText = "Quay lại danh sách" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-white rounded-lg border border-gray-200 text-center m-4 shadow-sm">
      <div className="text-6xl text-gray-300 mb-4 animate-pulse">🔍</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6 max-w-md whitespace-pre-line text-sm leading-relaxed">
        {message}
      </p>
      <Link 
        href={backLink} //  Next.js dùng `href` thay vì `to` của React Router
        className="rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        {backText}
      </Link>
    </div>
  );
};

export default NotFound;