'use client';
import Image from 'next/image';

export default function ProductCard({ product }) {
  if (!product) return null;
  const imageUrl = product.image || '/no-image.png';
  return (
    <div className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col w-full">
      
      {/* Vùng chứa ảnh - Chuẩn tỉ lệ 1:1 */}
      <div className="relative w-full aspect-square mb-3 bg-[#f9f9f9] rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Nội dung thông tin */}
      <div className="flex flex-col flex-1">
        <h3 className="text-[16px] leading-tight font-bold text-gray-800 line-clamp-2 mb-3 min-h-[40px] group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Hàng thông tin dưới cùng */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
          
          {/* Trạng thái: Bên trái */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'in_stock' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-[11px] font-semibold ${
              product.status === 'in_stock' ? 'text-green-600' : 'text-red-500'
            }`}>
              {product.status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>

          {/* Giá hoặc Liên hệ: Bên phải */}
          <div className="text-right">
            {product.price ? (
              <span className="text-blue-600 font-bold text-[15px]">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            ) : (
              <span className="text-gray-500 font-bold text-[12px] uppercase tracking-tighter">
                Liên hệ
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}