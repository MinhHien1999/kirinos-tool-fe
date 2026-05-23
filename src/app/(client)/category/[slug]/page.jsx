import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { 
  fetchCategoryBySlug, 
  fetchProductsByCategoryId, 
  isValidProductImageUrl 
} from '@/services/productService';

export default async function CategoryPage({ params, searchParams }) {
  // Giải nén các param bất đồng bộ theo tiêu chuẩn Next.js 15+
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="py-20 text-center text-gray-400 font-medium">
        Danh mục không tồn tại
      </div>
    );
  }

  // Đọc số trang hiện tại từ URL query (?page=X)
  const sParams = await searchParams;
  const currentPage = parseInt(sParams?.page) || 1;
  const categoryId = category._id || category.id;
  
  // Gọi dữ liệu phân trang từ lớp Service chạy Axios tập trung
  const { products, pagination } = await fetchProductsByCategoryId(categoryId, currentPage);
  
  const totalPages = pagination.totalPages || 1;
  const totalProducts = pagination.totalItems || 0;

  /**
   * Thuật toán thu gọn số trang thông minh (Ví dụ: 1 2 ... 5 6)
   * Ngăn chặn hoàn toàn lỗi tràn dòng, nát khung trên màn hình Mobile
   */
  const getPaginationRange = () => {
    const delta = 1; // Số trang hiển thị quanh trang hiện tại
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
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
    <div className="space-y-8 pb-12">
      {/* Breadcrumb thương mại trang nhã */}
      <nav className="flex items-center gap-2 text-[13px] text-gray-500 px-2 tracking-wide">
        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      {/* Header thông số số lượng (Đã mở khóa comment và làm sạch UI) */}
      <div className="px-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {/* <p className="text-[14px] text-gray-500">
          {products.length > 0 ? (
            <>
              Hiển thị{' '}
              <span className="font-bold text-gray-900">{products.length}</span>{' '}
              trên{' '}
              <span className="font-bold text-gray-900">{totalProducts}</span>{' '}
              sản phẩm
            </>
          ) : (
            'Đang cập nhật'
          )}
        </p> */}
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center border-t border-gray-100">
          <p className="text-gray-400 font-medium">Hiện chưa có sản phẩm nào trong danh mục này</p>
        </div>
      ) : (
        <>
          {/* Lưới sản phẩm danh mục - Tối ưu Grid Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 justify-items-center">
            {products.map((product) => {
              const img = product.images?.find(i => i.type === 'image' && isValidProductImageUrl(i.url));
              return (
                <Link key={product._id} href={`/product/${product.slug}`} className="block w-full h-full">
                  <ProductCard product={{ ...product, image: img?.url || product.image || '/no-image.png' }} />
                </Link>
              );
            })}
          </div>

          {/* Thanh phân trang Server-side - Khắc phục hoàn toàn lỗi định tuyến Vercel */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-100 select-none">
              
              {/* Nút Trước (Prev) */}
              {currentPage > 1 ? (
                <Link
                  href={`/category/${slug}?page=${currentPage - 1}`} // 🟢 Fix: Chỉ định rõ đường dẫn tuyệt đối kèm slug
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-gray-600"
                >
                  <ChevronLeft size={20} />
                </Link>
              ) : (
                <div className="p-2 rounded-lg border border-gray-100 opacity-30 cursor-not-allowed text-gray-400">
                  <ChevronLeft size={20} />
                </div>
              )}

              {/* Các số trang hiển thị thông minh dạng co giãn */}
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
                      href={`/category/${slug}?page=${item}`} // 🟢 Fix: Giữ vững cấu trúc đường dẫn cha
                      className={`min-w-[40px] h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-transparent'
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
                  href={`/category/${slug}?page=${currentPage + 1}`} // 🟢 Fix: Đảm bảo giữ slug khi nhảy trang kế
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-gray-600"
                >
                  <ChevronRight size={20} />
                </Link>
              ) : (
                <div className="p-2 rounded-lg border border-gray-100 opacity-30 cursor-not-allowed text-gray-400">
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