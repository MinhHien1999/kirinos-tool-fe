'use client';

export default function NewImagesManager({ 
  previews, 
  mainImageId, 
  onSetMain, 
  onRemove 
}) {
  if (!previews || previews.length === 0) return null;

  return (
    <div className="space-y-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
      <span className="text-xs font-bold text-blue-700 block">
        Hình ảnh sản phẩm xem trước (Tích dấu ngôi sao ★ để chọn ảnh hiển thị chính):
      </span>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
        {previews.map((img) => {
          const isCurrentMain = mainImageId === img.id;
          return (
            <div
              key={img.id}
              className="relative group aspect-square bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm transition-all"
            >
              {/* Thẻ img thường chống lỗi layout với blob URL */}
              <img
                src={img.url}
                alt="Preview"
                className="w-full h-full object-contain p-1"
              />
              
              <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 flex justify-between items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onSetMain(img.id)}
                  className={`p-1 rounded text-sm transition-transform active:scale-125 ${
                    isCurrentMain ? 'text-yellow-400 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Đặt làm ảnh chính"
                >
                  ★
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(img.id, img.url, img.fileRef)}
                  className="text-red-400 hover:text-red-300 text-[11px] font-bold px-1"
                >
                  Xóa
                </button>
              </div>

              {isCurrentMain && (
                <span className="absolute top-0.5 left-0.5 bg-yellow-500 text-white text-[8px] sm:text-[9px] px-1 font-bold rounded shadow-sm">
                  Ảnh chính
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}