'use client';

/**
 * Component quản lý ảnh cũ tích hợp nút Xóa và Chọn ảnh chính (Ngôi sao)
 * @param {Array} images - Mảng ảnh sản phẩm hiện tại
 * @param {string} mainImageId - public_id của ảnh đang được chọn làm ảnh chính
 * @param {Function} onRemove - Hàm xử lý khi bấm nút X
 * @param {Function} onSetMain - Hàm xử lý khi bấm nút Ngôi sao
 */
export default function OldImagesManager({ images = [], mainImageId, onRemove, onSetMain }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Hình ảnh hiện có (⭐: Ảnh chính, ✕: Xóa ảnh):
      </label>
      <div className="flex gap-3 flex-wrap">
        {images.map((img, i) => {
          // Kiểm tra xem tấm ảnh này có phải là ảnh chính không
          // Nếu trùng public_id HOẶC (chưa có mainImageId nào được set và đây là ảnh đầu tiên)
          const isCurrentMain = mainImageId 
            ? img.public_id === mainImageId 
            : (img.isMain || i === 0);

          return (
            <div 
              key={img.public_id || i} 
              className={`relative w-20 h-20 border rounded overflow-hidden bg-gray-50 shadow-sm group transition-all ${
                isCurrentMain ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-gray-200'
              }`}
            >
              {/* Ảnh sản phẩm */}
              <img 
                src={img.url} 
                alt="Product asset" 
                className="w-full h-full object-cover" 
              />
              
              {/* Nút Ngôi sao chọn ảnh chính (Nằm ở góc TRÊN BÊN TRÁI) */}
              <button
                type="button"
                onClick={() => onSetMain(img.public_id)}
                className={`absolute top-1 stroke-1 left-1 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow transition-colors z-10 ${
                  isCurrentMain 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white/80 text-gray-400 hover:text-amber-500 hover:bg-white'
                }`}
                title={isCurrentMain ? "Đây là ảnh chính" : "Đặt làm ảnh chính"}
              >
                ★
              </button>

              {/* Nút dấu Xóa ảnh (Nằm ở góc TRÊN BÊN PHẢI) */}
              <button
                type="button"
                onClick={() => onRemove(img.public_id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold hover:bg-red-600 transition-colors shadow z-10 opacity-0 group-hover:opacity-100 duration-200"
                title="Xóa ảnh này"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}