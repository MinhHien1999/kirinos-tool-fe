import imageCompression from 'browser-image-compression';

/**
 * Hàm tiện ích hỗ trợ nén mảng file ảnh tự động trước khi upload
 * @param {File[]} fileArray - Mảng các đối tượng File gốc được lấy từ input/state
 * @param {number} maxSizeMB - Dung lượng tối đa mong muốn sau khi nén (Mặc định: 1.5MB)
 * @returns {Promise<File[]>} - Trả về một mảng chứa các File đã được tối ưu hóa dung lượng
 */
export const compressImages = async (fileArray, maxSizeMB = 1.5) => {
  if (!fileArray || fileArray.length === 0) return [];

  const compressionOptions = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1920, // Độ phân giải tối đa cho Web (Full HD)
    useWebWorker: true,
  };

  const processedFiles = [];

  for (const file of fileArray) {
    // Chỉ kích hoạt nén nếu file lớn hơn 2MB để tiết kiệm hiệu năng cho thiết bị
    if (file.size > 2 * 1024 * 1024) {
      console.log(`⏳ [Image Utilization] Đang nén ảnh: ${file.name}`);
      try {
        const compressedBlob = await imageCompression(file, compressionOptions);
        
        // Chuyển đổi ngược từ Blob về định dạng File để giữ nguyên tên file
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
        });
        processedFiles.push(compressedFile);
      } catch (error) {
        console.error(`🔴 Lỗi khi nén file ${file.name}, giữ lại file gốc:`, error);
        processedFiles.push(file); // Nếu lỗi hiếm hoi xảy ra, vẫn dùng file gốc để không lỗi luồng submit
      }
    } else {
      // File nhẹ sẵn thì giữ nguyên
      processedFiles.push(file);
    }
  }

  return processedFiles;
};