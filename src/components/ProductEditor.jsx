'use client';

import { Editor } from '@tinymce/tinymce-react';
import { compressImages } from '@/utils/imageCompression';

export default function ProductEditor({ value, onChange }) {
  return (
    <Editor
      // Load file từ public folder
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      value={value}
      onEditorChange={(content) => {
        onChange(content);
      }}
      init={{
        height: 500,
        menubar: false,
        base_url: '/tinymce',
        suffix: '.min',

        // 🟢 MẶC ĐỊNH CHO BẢNG (Giúp hiển thị viền rõ nét)
        table_default_attributes: {
          border: '1',
        },
        table_default_styles: {
          'border-collapse': 'collapse',
          'width': '100%',
        },

        // 🟢 CÁC PLUGIN CHUẨN (Đã bỏ 'advlist' vì đã có sẵn trong 'lists')
        plugins: [
          'autolink', 'lists', 'link', 'image', 'media', 
          'table', 'code', 'fullscreen',
        ],

        // 🟢 THANH CÔNG CỤ (Toolbar)
        toolbar:
          'undo redo | blocks | bold italic forecolor | ' +
          'alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist | table image media link | code fullscreen',

        // 🟢 NÉN & CHUYỂN ẢNH SANG BASE64
        images_upload_handler: async (blobInfo) => {
          return new Promise(async (resolve, reject) => {
            try {
              const rawBlob = blobInfo.blob();
              const rawFile = new File([rawBlob], blobInfo.filename(), { type: rawBlob.type });
              const [compressedFile] = await compressImages([rawFile], 0.8);

              const reader = new FileReader();
              reader.readAsDataURL(compressedFile);
              reader.onloadend = () => {
                resolve(reader.result);
              };
            } catch (error) {
              console.error('🔴 Lỗi xử lý nén ảnh trong TinyMCE:', error);
              reject('Không thể tối ưu dung lượng hình ảnh: ' + error.message);
            }
          });
        },

        // 🟢 STYLE HIỂN THỊ TRONG EDITOR
        content_style: `
          body {
            font-family: Arial, sans-serif;
            font-size: 15px;
            color: #111827;
            line-height: 1.6;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          iframe {
            width: 100%;
            min-height: 400px;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 12px;
            margin-bottom: 12px;
          }
          table, th, td {
            border: 1px solid #111827 !important;
          }
          th, td {
            padding: 10px 12px !important;
            vertical-align: top;
          }
          th {
            background-color: #f9fafb;
            font-weight: bold;
          }
        `,
      }}
    />
  );
}