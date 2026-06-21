import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { 
  fetchProductsByCategorySlug, // 🟢 Đổi sang hàm Axios tối ưu mới gom cụm dữ liệu
  isValidProductImageUrl 
} from '@/services/productService';

// Đảm bảo Next.js luôn render động dựa theo tham số để cập nhật phân trang chính xác nhất
export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params, searchParams }) {
  // 1. Giải nén các param bất đồng bộ theo tiêu chuẩn Next.js 15+
  const { slug } = await params;
  const sParams = await searchParams;
  const currentPage = parseInt(sParams?.page, 10) || 1;

  // 2. Chỉ cần gọi duy nhất 1 hàm Axios mới để lấy toàn bộ cụm dữ liệu (Gom 2 request cũ thành 1)
  const { category, products, pagination } = await fetchProductsByCategorySlug(slug, currentPage);

  // 3. Nếu Backend không tìm thấy danh mục phù hợp với slug
  if (!category) {
    return (
      <div className="py-20 text-center text-gray-400 font-medium">
        Danh mục không tồn tại
      </div>
    );
  }
  
  const totalPages = pagination?.totalPages || 1;
  const totalProducts = pagination?.totalItems || 0;

  /**
   * Thuật toán thu gọn số trang thông minh
   * Ngăn chặn hoàn toàn lỗi tràn dòng, nát khung trên màn hình Mobile
   */
  const getPaginationRange = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
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
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4">
      {/* Breadcrumb thương mại trang nhã */}
      <nav className="flex items-center gap-2 text-[13px] text-gray-500 pt-4 tracking-wide select-none">
        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      {/* Header thông số số lượng sản phẩm */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
        <p className="text-[14px] text-gray-500">
          {products.length > 0 ? (
            <>
              Hiển thị{' '}
              <span className="font-bold text-gray-900">{products.length}</span>{' '}
              trên{' '}
              <span className="font-bold text-gray-900">{totalProducts}</span>{' '}
              sản phẩm
            </>
          ) : (
            'Danh mục hiện tại đang được cập nhật sản phẩm'
          )}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-gray-200 bg-gray-50 rounded-xl">
          <p className="text-gray-400 font-medium">Hiện chưa có sản phẩm nào trong danh mục này</p>
        </div>
      ) : (
        <>
          {/* Lưới sản phẩm danh mục - Tối ưu Grid Responsive đồng nhất với trang chủ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => {
              
              // Tìm ảnh chính hoặc ảnh hợp lệ đầu tiên của sản phẩm
              let img = product.images?.find(i => i.type === 'image' && i.isMain && isValidProductImageUrl(i.url));
              if (!img) {
                img = product.images?.find(i => i.type === 'image' && isValidProductImageUrl(i.url));
              }

              return (
                <Link key={product._id} href={`/product/${product.slug}`} className="group block w-full h-full">
                  <ProductCard product={{ ...product, image: img?.url || product.image || '/no-image.png' }} />
                </Link>
              );
            })}
          </div>

          {/* Thanh phân trang Server-side */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-100 select-none">
              
              {/* Nút Trước (Prev) */}
              {currentPage > 1 ? (
                <Link
                  href={`/category/${slug}?page=${currentPage - 1}`}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm"
                >
                  <ChevronLeft size={20} />
                </Link>
              ) : (
                <div className="p-2 rounded-lg border border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed text-gray-400">
                  <ChevronLeft size={20} />
                </div>
              )}

              {/* Các số trang hiển thị thông minh */}
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
                      href={`/category/${slug}?page=${item}`}
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

              {/* Nút Sau (Next) */}
              {currentPage < totalPages ? (
                <Link
                  href={`/category/${slug}?page=${currentPage + 1}`}
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