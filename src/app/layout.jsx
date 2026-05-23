import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Kirinos Tools',
  description: 'Chuyên cung cấp thiết bị kỹ thuật',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-100 min-h-screen text-gray-900 antialiased">
        <Providers>
          {/* 🟢 Để trống hoàn toàn, không gọi Header hay Sidebar thường ở đây nữa */}
          {children}
        </Providers>
      </body>
    </html>
  );
}