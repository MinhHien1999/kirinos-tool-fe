import axios from 'axios';

// 🟢 Bạn chỉ cần cấu hình IP hoặc URL một lần duy nhất tại đây
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.17:3000/api'; 

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor tự động bóc tách tầng dữ liệu của Axios khi phản hồi trả về thành công
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý tập trung lỗi hệ thống nếu cần thiết
    return Promise.reject(error);
  }
);

export default axiosClient;