'use client';

import { Editor } from '@tinymce/tinymce-react';

export default function ProductEditor({
  value,
  onChange,
}) {
  return (
    <Editor
      // 1. Tự load file từ thư mục public của Next.js
      tinymceScriptSrc="/tinymce/tinymce.min.js" 
      
      // 2. Giữ licenseKey là gpl
      licenseKey="gpl" 
      
      value={value}
      onEditorChange={(content) => {
        onChange(content);
      }}
      init={{
        height: 500,
        menubar: false,
        
        // 3. Khai báo base_url để TinyMCE tìm thấy các plugin/skin trong thư mục public
        base_url: '/tinymce',
        suffix: '.min',

        // 🔥 FIX LỖI MOBILE TRÊN ĐIỆN THOẠI:
        // Định nghĩa các thuộc tính cốt lõi này cho mobile để tránh lỗi đọc thuộc tính '.length' của undefined
        mobile: {
          menubar: false,
          plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'media', 'table', 'code', 'fullscreen'],
          toolbar: 'undo redo | blocks | bold italic forecolor | table image | code fullscreen'
        },

        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'media', 
          'table', 'code', 'fullscreen',
        ],

        toolbar:
          'undo redo | blocks | bold italic forecolor | ' +
          'alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist | table image media link | code fullscreen',

        // Tối ưu hiển thị bảng bên trong khung soạn thảo
        content_style: `
          body {
            font-family: Arial, sans-serif;
            font-size: 16px;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          iframe {
            width: 100%;
            min-height: 400px;
          }
          /* Style cho Table hiển thị rõ ràng */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          table, th, td {
            border: 1px solid #e2e8f0;
            padding: 8px;
          }
          th {
            background-color: #f8fafc;
            font-weight: bold;
          }
        `,
      }}
    />
  );
}