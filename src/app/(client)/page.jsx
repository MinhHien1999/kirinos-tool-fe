import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  fetchHomeProducts,
  isValidProductImageUrl,
} from '@/services/productService';

// Ép buộc Next.js luôn render động ở trang chủ để tránh việc lưu cache phân trang sai lệch
export const dynamic = 'force-dynamic';

export default async function Page(props) {
  // Giải nén searchParams một cách an toàn
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams?.page, 10) || 1;

  // Gọi tầng Service lấy danh sách sản phẩm
  const res = await fetchHomeProducts(currentPage);
  
  // 🟢 Kiểm tra Res hợp lệ và trích xuất dữ liệu, fallback về giá trị mặc định
  const products = res?.products || [];
  const pagination = res?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalProducts = pagination?.totalItems || 0;

  // 🔴 Logic kiểm tra dữ liệu để hiển thị Breadcrumb và Tiêu đề
  const isDataUpdating = products.length === 0;

  const getPaginationRange = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="space-y-8 pb-12 px-4 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-gray-500 pt-4 tracking-wide">
        <span className="text-gray-400 select-none">Trang chủ</span>
      </nav>

      {/* Khối Tiêu đề Giao diện */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Sản phẩm mới
        </h1>
        <p className="text-[14px] text-gray-500">
          {!isDataUpdating ? (
            <>
              Hiển thị{' '}
              <span className="font-bold text-gray-900">{products.length}</span>{' '}
              trên{' '}
              <span className="font-bold text-gray-900">{totalProducts}</span>{' '}
              sản phẩm
            </>
          ) : (
            'Hệ thống đang cập nhật sản phẩm'
          )}
        </p>
      </div>

      {isDataUpdating ? (
        <div className="py-20 text-center border border-dashed border-gray-200 bg-gray-50 rounded-xl">
          <p className="text-gray-400 font-medium">Hiện chưa có sản phẩm nào được đăng tải</p>
        </div>
      ) : (
        <>
          {/* Grid danh sách sản phẩm - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => {
              
              // 🟢 Tìm ảnh chính isMain, backup lấy ảnh đầu tiên
              let img = product.images?.find(
                (i) => i.type === 'image' && i.isMain && isValidProductImageUrl(i.url)
              );

              if (!img) {
                img = product.images?.find(
                  (i) => i.type === 'image' && isValidProductImageUrl(i.url)
                );
              }
              
              return (
                <Link
                  key={product._id}
                  href={`/product/${product.slug}`}
                  className="group block w-full h-full"
                >
                  <ProductCard
                    product={{
                      ...product,
                      image: img?.url || product.image || '/no-image.png',
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {/* Thanh điều hướng phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-100 select-none">
              {currentPage > 1 ? (
                <Link
                  href={`/?page=${currentPage - 1}`}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm"
                >
                  <ChevronLeft size={20} />
                </Link>
              ) : (
                <div className="p-2 rounded-lg border border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed text-gray-400">
                  <ChevronLeft size={20} />
                </div>
              )}

              <div className="flex items-center gap-1">
                {getPaginationRange().map((item, index) => {
                  if (item === '...') {
                    return (
                      <div
                        key={`dots-${index}`}
                        className="min-w-[40px] h-10 flex items-center justify-center text-gray-400"
                      >
                        <MoreHorizontal size={16} />
                      </div>
                    );
                  }

                  const isActive = currentPage === item;
                  return (
                    <Link
                      key={`page-${item}`}
                      href={`/?page=${item}`}
                      className={`min-w-[40px] h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all shadow-sm ${
                        isActive
                          ? 'bg-blue-600 text-white border border-blue-600'
                          : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      {item}
                    </Link>
                  );
                })}
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={`/?page=${currentPage + 1}`}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm"
                >
                  <ChevronRight size={20} />
                </Link>
              ) : (
                <div className="p-2 rounded-lg border border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed text-gray-400">
                  <ChevronRight size={20} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}