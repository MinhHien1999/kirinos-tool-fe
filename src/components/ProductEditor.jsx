'use client';

import { Editor } from '@tinymce/tinymce-react';
import { compressImages } from '@/utils/imageCompression'; // 🟢 1. Import hàm nén dùng chung của bạn

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

        // 🟢 2. CẤU HÌNH BỘ CHẶN VÀ NÊN ẢNH TỰ ĐỘNG KHI CHÈN VÀO TINYMCE
        images_upload_handler: async (blobInfo) => {
          return new Promise(async (resolve, reject) => {
            try {
              // Lấy file blob thô từ TinyMCE khi user chèn ảnh
              const rawBlob = blobInfo.blob();
              
              // Tạo đối tượng File hoàn chỉnh từ Blob để đưa vào hàm tiện ích
              const rawFile = new File([rawBlob], blobInfo.filename(), { type: rawBlob.type });
              
              // Tiến hành nén qua hàm dùng chung (ép dung lượng tối đa về hẳn 0.8MB cho văn bản nhẹ)
              const [compressedFile] = await compressImages([rawFile], 0.8);

              // Đọc file đã nén và chuyển đổi sang dạng chuỗi Base64 siêu nhẹ
              const reader = new FileReader();
              reader.readAsDataURL(compressedFile);
              reader.onloadend = () => {
                const base64String = reader.result;
                resolve(base64String); // Trả kết quả base64 đã tối ưu dung lượng cho TinyMCE nhúng vào editor
              };
              
            } catch (error) {
              console.error('🔴 Lỗi xử lý nén ảnh trong TinyMCE:', error);
              reject('Không thể tối ưu dung lượng hình ảnh: ' + error.message);
            }
          });
        },

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