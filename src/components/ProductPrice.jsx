'use client';

import { NumericFormat } from 'react-number-format';

export default function ProductPrice({ price }) {
  // 1. Trường hợp sản phẩm không có giá (hoặc price <= 0)
  if (!price || price <= 0) {
    return (
      <button className="w-full rounded-2xl bg-blue-600 px-12 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 lg:w-max active:scale-[0.98]">
        Liên hệ báo giá
      </button>
    );
  }

  // 2. Trường hợp có giá: Bọc khối giá tiền đồng bộ với kiểu dáng nút báo giá
  return (
    <div className="w-full rounded-2xl bg-blue-600 px-12 py-3.5 shadow-xl shadow-blue-100 flex items-center justify-center lg:w-max">
      <span className="text-base lg:text-lg font-extrabold text-white tracking-wider flex items-center gap-2">
        <NumericFormat
          value={price}
          displayType="text"
          thousandSeparator="."
          decimalSeparator=","
          suffix="đ"
        />
      </span>
    </div>
  );
}