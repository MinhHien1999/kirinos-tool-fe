import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }) {
  return (
    <>
      {/* Giao diện Header của trang thường */}
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Giao diện Sidebar danh mục thiết bị của khách hàng */}
          <Sidebar />
          
          <div className="w-full flex-1">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}