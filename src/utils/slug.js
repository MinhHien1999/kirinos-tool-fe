import slugify from 'slugify';

export const generateSlug = (text) => {
  if (!text) return '';
  
  return slugify(text, {
    replacement: '-',  // Thay khoảng trắng bằng dấu -
    remove: /[*+~.()'"!:@]/g, // Loại bỏ các ký tự dấu câu thô
    lower: true,       // Chuyển về chữ thường
    strict: true,      // Xóa bỏ hoàn toàn các ký tự đặc biệt ẩn khác
    locale: 'vi'       // 🟢 BẢO ĐẢM: Ép chữ tiếng Việt và chữ Đ chuẩn tuyệt đối
  });
};

// Generate random slug with timestamp
export const generateRandomSlug = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix ? prefix + '-' : ''}${timestamp}-${random}`;
};
