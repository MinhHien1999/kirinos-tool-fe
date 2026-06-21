import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { 
  fetchProductsByBrandSlug, 
  isValidProductImageUrl 
} from '@/services/productService';

export default async function BrandPage({ params, searchParams }) {
  // 1. Giải nén các parameters bất đồng bộ (Bắt buộc từ Next.js 15+)
  const { slug } = await params;
  const sParams = await searchParams;
  const currentPage = parseInt(sParams?.page) || 1;

  // 2. Gọi hàm Service (Service bên trong sẽ fetch request tới route Backend: /brands/${slug}/products)
  const { brand, products, pagination } = await fetchProductsByBrandSlug(slug, currentPage, 12);

  // 3. Nếu không tồn tại thương hiệu, render thông báo lỗi
  if (!brand) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center p-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Thương hiệu không tồn tại</h2>
          <p className="text-gray-500">Vui lòng kiểm tra lại đường dẫn hoặc chọn thương hiệu khác.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 font-bold underline hover:text-blue-700 transition-colors"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = pagination.totalPages || 1;
  const totalProducts = pagination.totalItems || 0;

  /**
   * Thuật toán thu gọn số trang thông minh (Ví dụ: 1 2 ... 7 8)
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-gray-500 px-2 tracking-wide">
        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-400">Thương hiệu</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{brand.name}</span>
      </nav>

      {/* Header thương hiệu */}
      <div className="px-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{brand.name}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-50 pb-4">
          <p className="text-[14px] text-gray-500">
            {products.length > 0 ? (
              <>
                Hiển thị{' '}
                <span className="font-bold text-gray-900">{products.length}</span>{' '}
                trên{' '}
                <span className="font-bold text-gray-900">{totalProducts}</span>{' '}
                sản phẩm hiện có
              </>
            ) : (
              'Đang cập nhật'
            )}
          </p>
          {brand.description && (
            <p className="text-sm text-gray-500 max-w-xl italic bg-gray-50/60 px-4 py-2 rounded-xl border border-gray-100/50">
              {brand.description}
            </p>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center border-t border-gray-100">
          <p className="text-gray-400 font-medium">Không có sản phẩm nào thuộc thương hiệu này.</p>
        </div>
      ) : (
        <>
          {/* Grid hiển thị sản phẩm */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 justify-items-center">
            {products.map((product) => {
              const imageItem = product.images?.find(
                (item) => item.type === 'image' && isValidProductImageUrl(item.url),
              );
              const imageUrl = imageItem?.url || product.image || '/no-image.png';

              return (
                <Link
                  key={product._id}
                  href={`/product/${product.slug}`}
                  className="block w-full h-full"
                >
                  <ProductCard
                    product={{
                      ...product,
                      image: imageUrl,
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {/* 🟢 Thanh phân trang: Giữ cố định route hiển thị của Frontend là /brand/[slug] */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-100 select-none">
              
              {/* Nút lùi (Prev) */}
              {currentPage > 1 ? (
                <Link
                  href={`/brand/${slug}?page=${currentPage - 1}`}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-gray-600"
                >
                  <ChevronLeft size={20} />
                </Link>
              ) : (
                <div className="p-2 rounded-lg border border-gray-100 opacity-30 cursor-not-allowed text-gray-400">
                  <ChevronLeft size={20} />
                </div>
              )}

              {/* Số trang */}
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
                      href={`/brand/${slug}?page=${item}`}
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

              {/* Nút tiến (Next) */}
              {currentPage < totalPages ? (
                <Link
                  href={`/brand/${slug}?page=${currentPage + 1}`}
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