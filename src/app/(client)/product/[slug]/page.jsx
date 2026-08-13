import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import ProductPrice from '@/components/ProductPrice'; // 👈 Import component mới
import { fetchProductDetailBySlug } from '@/services/productService';

function buildGalleryItems(images = []) {
  if (!images || images.length === 0) {
    return [{ type: 'image', src: '/no-image.png', isMain: true }];
  }

  return images
    .map((item) => ({
      type: item.type || 'image',
      src: item.url,
      isMain: !!item.isMain,
    }))
    .sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
}

export default async function ProductDetail({ params }) {
  const { slug } = await params;
  const product = await fetchProductDetailBySlug(slug);

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-black uppercase text-gray-400 tracking-wider">
          Sản phẩm không tồn tại
        </h2>
        <Link
          href="/"
          className="mt-4 inline-block text-blue-600 font-bold underline hover:text-blue-700 transition-colors"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const galleryItems = buildGalleryItems(product.images || []);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-[13px] text-gray-500 font-medium px-2 tracking-wide">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Trang chủ
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-400">Sản phẩm</span>
        <span className="text-gray-300">/</span>
        <span className="truncate font-bold text-gray-900 max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      <div className="space-y-8">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="w-full">
              <ProductGallery items={galleryItems} />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold tracking-wider ${
                      product.status === 'in_stock'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {product.status === 'in_stock'
                      ? '● Còn hàng'
                      : '● Hết hàng'}
                  </span>
                </div>

                <h1 className="mb-6 text-2xl md:text-3xl font-bold leading-tight text-gray-900">
                  {product.name}
                </h1>

                <div className="mb-6 space-y-4 border-t border-gray-100 py-6 text-sm">
                  <div className="flex items-center">
                    <span className="w-32 font-bold uppercase tracking-wider text-gray-400 text-[12px]">
                      Thương hiệu:
                    </span>
                    <span className="font-bold uppercase text-blue-600">
                      {product.brand?.name || 'Kirinos'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 font-bold uppercase tracking-wider text-gray-400 text-[12px]">
                      Danh mục:
                    </span>
                    <span className="font-bold text-gray-800">
                      {product.category?.name || 'Thiết bị'}
                    </span>
                  </div>
                </div>

                {product.specs && product.specs.length > 0 && (
                  <div className="mb-8 grid grid-cols-1 gap-2">
                    {product.specs.slice(0, 5).map((spec, index) => (
                      <div
                        key={index}
                        className="flex rounded-xl border border-gray-100/50 bg-gray-50/50 p-2.5 text-[13px]"
                      >
                        <span className="w-32 font-medium text-gray-400">
                          {spec.label}:
                        </span>
                        <span className="font-bold text-gray-800">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 🟢 Render Client Component hiển thị giá tiền */}
              <div className="mt-6 lg:mt-0">
                <ProductPrice price={product.price} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="relative inline-block text-2xl font-bold text-gray-900 pb-2">
              Chi tiết sản phẩm
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full"></span>
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm">
            <article
              className="prose prose-blue prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed 
                prose-headings:font-bold prose-headings:text-gray-900 
                prose-p:mb-4 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{
                __html:
                  product.description ||
                  '<p class="text-center text-gray-400 py-10">Thông tin sản phẩm đang được cập nhật...</p>',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}