'use client';

import { useState, useEffect } from 'react';

/**
 * Hook quản lý trạng thái hình ảnh (file gốc, ảnh preview, ảnh chính)
 * Dùng chung cho cả màn hình Thêm mới (Add) và Chỉnh sửa (Edit) sản phẩm.
 * * @param {string} initialMainImageId - ID ảnh chính khởi tạo (nếu có, thường dùng ở trang Edit)
 */
export default function useProductImages(initialMainImageId = '') {
  const [imageFiles, setImageFiles] = useState([]); // Quản lý danh sách file ảnh gốc từ <input type="file" />
  const [newImagesPreview, setNewImagesPreview] = useState([]); // Quản lý danh sách các object blob URL phục vụ hiển thị preview
  const [mainImageId, setMainImageId] = useState(initialMainImageId); // Quản lý ID của hình ảnh được chọn làm ảnh chính

  // 🟢 Đồng bộ hóa trạng thái trực tiếp trong quá trình render (Adjusting state during rendering)
  // Giải quyết triệt để lỗi "Calling setState synchronously within an effect can trigger cascading renders"
  const [prevInitialId, setPrevInitialId] = useState(initialMainImageId);
  
  if (initialMainImageId !== prevInitialId) {
    setMainImageId(initialMainImageId);
    setPrevInitialId(initialMainImageId);
  }

  // 🟢 Effect dọn dẹp bộ nhớ (Tương tác với Web API bên ngoài hệ thống React)
  // Tự động giải phóng các Blob URL khi component chứa hook này bị hủy (unmount) tránh rò rỉ bộ nhớ của trình duyệt
  useEffect(() => {
    return () => {
      newImagesPreview.forEach((img) => {
        if (img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [newImagesPreview]);

  /**
   * Xử lý sự kiện khi người dùng chọn thêm file từ thiết bị cục bộ
   */
  const handleNewFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Cập nhật danh sách các file gốc để chuẩn bị gửi lên server
    setImageFiles((prev) => [...prev, ...files]);

    // Tạo mảng preview mới, lấy thuộc tính file.name làm ID định danh tạm thời
    const previews = files.map((file) => ({
      id: file.name,
      url: URL.createObjectURL(file),
      fileRef: file,
    }));

    setNewImagesPreview((prev) => {
      const updatedPreviews = [...prev, ...previews];
      
      // Nếu hiện tại hệ thống chưa có ảnh nào được chọn làm ảnh chính,
      // thì tự động đặt file đầu tiên trong danh sách vừa chọn này làm ảnh chính luôn.
      if (!mainImageId && updatedPreviews.length > 0) {
        setMainImageId(updatedPreviews[0].id);
      }
      
      return updatedPreviews;
    });
  };

  /**
   * Xử lý xóa một hình ảnh mới khỏi danh sách xem trước (Preview)
   */
  const handleRemoveNewPreview = (idToRemove, blobUrl, fileRef) => {
    // Lọc bỏ ảnh preview khỏi danh sách hiển thị dữ liệu
    setNewImagesPreview((prev) => prev.filter((img) => img.id !== idToRemove));
    
    // Lọc bỏ file gốc tương ứng ra khỏi danh sách file gửi đi
    setImageFiles((prev) => prev.filter((file) => file !== fileRef));

    // Thu hồi vùng nhớ blob URL ngay lập tức sau khi bấm xóa
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }

    // Xử lý logic hoán đổi ảnh chính nếu ảnh bị xóa trùng khớp với ảnh đang làm ảnh chính
    if (mainImageId === idToRemove) {
      // Tìm các ảnh preview còn lại (đã loại trừ ảnh vừa xóa)
      setNewImagesPreview((currentPreviews) => {
        const remainingPreviews = currentPreviews.filter((img) => img.id !== idToRemove);
        if (remainingPreviews.length > 0) {
          setMainImageId(remainingPreviews[0].id);
        } else {
          setMainImageId('');
        }
        return currentPreviews; // Trả về để không thay đổi state ngoài ý muốn tại bước này
      });
    }
  };

  /**
   * Thay đổi ngôi sao - Chỉ định hình ảnh được chọn làm ảnh chính
   */
  const handleSetMainImage = (id) => {
    setMainImageId(id);
  };

  /**
   * Dọn dẹp sạch sẽ toàn bộ trạng thái hình ảnh (Thường gọi sau khi submit form thành công)
   */
  const clearImagesState = () => {
    newImagesPreview.forEach((img) => {
      if (img.url && img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
    setImageFiles([]);
    setNewImagesPreview([]);
    setMainImageId('');
  };

  return {
    imageFiles,
    newImagesPreview,
    mainImageId,
    setMainImageId,
    setNewImagesPreview,
    handleNewFilesChange,
    handleRemoveNewPreview,
    handleSetMainImage,
    clearImagesState,
  };
}