import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ChevronLeft, ChevronRight, MoreHorizontal, SearchX } from 'lucide-react';
import { 
  fetchProductsBySearchForClient, // Hàm gọi API tổng có phân trang
  isValidProductImageUrl 
} from '@/services/productService';

// Đảm bảo Next.js luôn render động dựa theo tham số tìm kiếm để không bị cache kết quả cũ
export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  // 1. Giải nén các param bất đồng bộ theo tiêu chuẩn Next.js 15+
  const sParams = await searchParams;
  const keyword = sParams?.keyword || '';
  const currentPage = parseInt(sParams?.page, 10) || 1;
  const limit = 12;

  // 2. Gọi hàm Axios xử lý tìm kiếm phía Server
  let products = [];
  let pagination = null;
  let totalPages = 1;
  let totalProducts = 0;

  if (keyword.trim()) {
    try {
      const result = await fetchProductsBySearchForClient(keyword, currentPage, limit);
      products = result?.data || [];
      pagination = result?.pagination || null;
      totalPages = pagination?.totalPages || 1;
      totalProducts = pagination?.totalItems || 0;
    } catch (error) {
      console.error('🔴 Lỗi hệ thống khi tải danh sách sản phẩm tìm kiếm phía Server:', error);
    }
  }

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
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 text-gray-900">
        
        {/* Breadcrumb thương mại trang nhã */}
        <nav className="flex items-center gap-2 text-[13px] text-gray-500 pt-4 tracking-wide select-none">
          <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Tìm kiếm</span>
        </nav>

        {/* Header thông báo từ khóa và số lượng kết quả (in đậm số lượng) */}
        <div className="border-b border-gray-100 pb-5">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            Kết quả tìm kiếm cho: <span className="text-[#41995b]">{"\""}{keyword}{"\""}</span>
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            {products.length > 0 ? (
              <>
                Tìm thấy <span className="font-bold text-gray-900">{totalProducts}</span> sản phẩm phù hợp
              </>
            ) : (
              'Không tìm thấy kết quả phù hợp với từ khóa của bạn'
            )}
          </p>
        </div>

        {products.length === 0 ? (
          /* KHỐI TRẠNG THÁI TRỐNG (KHÔNG TÌM THẤY SẢN PHẨM) */
          <div className="py-20 text-center border border-dashed border-gray-200 bg-gray-50/50 rounded-xl flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <SearchX size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-700">Không tìm thấy sản phẩm nào</h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1">
              Hãy thử kiểm tra lại lỗi chính tả hoặc tìm kiếm bằng các từ khóa chung hơn (ví dụ: Thang, Kìm, WIHA)
            </p>
            <Link 
              href="/" 
              className="mt-5 bg-[#41995b] hover:bg-[#347a49] text-white text-xs font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors"
            >
              Quay lại trang chủ
            </Link>
          </div>
        ) : (
          <>
            {/* LƯỚI SẢN PHẨM TÌM KIẾM - Đồng bộ hoàn toàn UI với ProductCard */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => {
                // Xử lý bóc tách hình ảnh chuẩn giống trang category
                let img = product.images?.find(i => i.type === 'image' && i.isMain && isValidProductImageUrl(i.url));
                if (!img) {
                  img = product.images?.find(i => i.type === 'image' && isValidProductImageUrl(i.url));
                }

                // Chuẩn hóa object dữ liệu trước khi nạp vào thẻ dùng chung
                const normalizedProduct = {
                  ...product,
                  image: img?.url || product.image || '/no-image.png',
                  price: product.price || product.specs?.find(spec => spec.label === "" || spec.label?.toLowerCase().includes("giá"))?.value
                };

                return (
                  <Link key={product._id} href={`/product/${product.slug}`} className="group block w-full h-full">
                    <ProductCard product={normalizedProduct} />
                  </Link>
                );
              })}
            </div>

            {/* THANH ĐIỀU HƯỚNG PHÂN TRANG SERVER-SIDE */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-100 select-none">
                
                {/* Nút Trước (Prev) */}
                {currentPage > 1 ? (
                  <Link
                    href={`/search?keyword=${encodeURIComponent(keyword)}&page=${currentPage - 1}`}
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
                        href={`/search?keyword=${encodeURIComponent(keyword)}&page=${item}`}
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
                    href={`/search?keyword=${encodeURIComponent(keyword)}&page=${currentPage + 1}`}
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
    </main>
  );
}