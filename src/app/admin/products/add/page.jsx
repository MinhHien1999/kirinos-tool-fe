'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateSlug } from '@/utils/slug.js';
import ProductEditor from '@/components/ProductEditor';

// Import tách biệt theo đúng trách nhiệm từng file Service của bạn
import { createProductService } from '@/services/productService';
import { fetchBrands } from '@/services/brandService';
import { fetchCategories } from '@/services/categoryService';

export default function AdminAddProduct() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    brand: '',
    category: '',
    description: '',
    status: 'in_stock',
    specs: [{ label: '', value: '' }],
    youtubeUrls: [''],
    imageFiles: [],
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        // Đồng bộ hóa: Gọi qua Axios Service, nâng limit lên 100 để lấy trọn bộ dữ liệu ô Select
        const [resBrands, resCats] = await Promise.all([
          fetchBrands(1, 100),
          fetchCategories(1, 100),
        ]);

        setBrands(resBrands?.brands || []);
        setCategories(resCats?.categories || []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu dữ liệu cấu hình bằng Axios:', err);
        setError('Không thể kết nối dữ liệu cấu hình danh mục/thương hiệu.');
      }
    };
    fetchMetaData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('slug', form.slug);
      formData.append('brand', form.brand);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('status', form.status);

      // Chỉ lọc và đóng gói các thông số thực sự có dữ liệu
      const cleanSpecs = form.specs.filter((s) => s.label.trim() || s.value.trim());
      formData.append('specs', JSON.stringify(cleanSpecs));

      // Chỉ gửi các link video Youtube hợp lệ
      form.youtubeUrls.filter((u) => u.trim()).forEach((url) => {
        formData.append('youtubeUrls', url);
      });

      // Đẩy mảng file ảnh đính kèm vào mã hóa đa phần
      form.imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Gọi qua tầng Axios Service tập trung
      await createProductService(formData);

      setMessage('Thêm mới sản phẩm thành công!');
      
      // Chờ nhẹ để người dùng kịp nhìn thông báo thành công trước khi chuyển hướng
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Thêm sản phẩm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán cây phân cấp danh mục (An toàn, tránh lỗi crash localeCompare)
  const categoryTree = useMemo(() => {
    if (!categories || !categories.length) return [];
    const map = new Map(categories.map((cat) => [cat._id, { ...cat, children: [] }]));
    const roots = [];
    map.forEach((category) => {
      const parentId = category.parent?._id || category.parent;
      if (parentId && map.has(parentId)) map.get(parentId).children.push(category);
      else roots.push(category);
    });
    const ordered = [];
    const traverse = (nodes, level = 0) => {
      // Thêm chuỗi rỗng thay thế dự phòng (node.name || '') để không bị crash ứng dụng
      nodes.sort((a, b) => (a.name || '').localeCompare(b.name || '')).forEach((node) => {
        ordered.push({ ...node, level });
        if (node.children && node.children.length) traverse(node.children, level + 1);
      });
    };
    traverse(roots);
    return ordered;
  }, [categories]);

  return (
    <div className="w-full space-y-4 p-4">
      {/* Khối tiêu đề chuẩn */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
          <p className="text-sm text-gray-500 mt-1">Đăng sản phẩm mới vào hệ thống.</p>
        </div>
        <Link href="/admin/products" className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
          Quay lại danh sách
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-lg border border-gray-200 space-y-4 shadow-sm">
        
        {/* Hàng Tên & Slug */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">Tên sản phẩm</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
          </div>
          <div className="w-full md:w-5/12 space-y-1">
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <div className="flex gap-2">
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
              <button type="button" onClick={() => setForm({ ...form, slug: generateSlug(form.name) })} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 shadow-sm transition-all active:scale-98">Random</button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">Slug được tạo tự động từ tên sản phẩm. Nhấn Random để tạo slug ngẫu nhiên.</p>

        {/* Hàng Thương hiệu & Danh mục */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">Thương hiệu</label>
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-blue-500 text-gray-900">
              <option value="">Chọn thương hiệu</option>
              {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">Danh mục</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-blue-500 text-gray-900">
              <option value="">Chọn danh mục</option>
              {categoryTree.map(c => (
                <option key={c._id} value={c._id}>
                  {'\u00A0\u00A0'.repeat(c.level)}{c.level > 0 ? '↳ ' : ''}{c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hàng Trạng thái kho & File ảnh đính kèm */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">Trạng thái kho hàng</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-blue-500 text-gray-900">
              <option value="in_stock">Còn hàng (In Stock)</option>
              <option value="out_of_stock">Hết hàng (Out of Stock)</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">Hình ảnh đính kèm (Bắt buộc khi tạo mới)</label>
            <input type="file" multiple required onChange={(e) => setForm({ ...form, imageFiles: Array.from(e.target.files) })} className="w-full rounded border border-gray-300 px-3 py-[5px] bg-white text-sm text-gray-500 cursor-pointer file:mr-3 file:py-0.5 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:text-xs file:text-gray-700 hover:file:bg-gray-100" />
          </div>
        </div>

        {/* Khối soạn thảo mô tả chi tiết sản phẩm */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Mô tả chi tiết sản phẩm</label>
          <div className="border border-gray-300 rounded overflow-hidden">
            <ProductEditor value={form.description} onChange={(content) => setForm(p => ({ ...p, description: content }))} />
          </div>
        </div>

        {/* Khối Thông số kỹ thuật */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Thông số kỹ thuật</label>
            <button type="button" onClick={() => setForm(p => ({ ...p, specs: [...p.specs, { label: '', value: '' }] }))} className="text-xs text-blue-600 font-medium hover:underline">+ Thêm thông số</button>
          </div>
          <div className="space-y-2">
            {form.specs.map((spec, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input placeholder="Nhãn (Ví dụ: Công suất)" value={spec.label} onChange={(e) => {
                  const n = [...form.specs]; n[index].label = e.target.value; setForm({ ...form, specs: n });
                }} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
                <input placeholder="Giá trị (Ví dụ: 200W)" value={spec.value} onChange={(e) => {
                  const n = [...form.specs]; n[index].value = e.target.value; setForm({ ...form, specs: n });
                }} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
                <button type="button" onClick={() => setForm(p => ({ ...p, specs: p.specs.filter((_, i) => i !== index) }))} className="text-gray-400 hover:text-red-500 px-1 font-bold transition-colors">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Khối liên kết video Youtube */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">YouTube URLs (tùy chọn)</label>
            <button type="button" onClick={() => setForm(p => ({ ...p, youtubeUrls: [...p.youtubeUrls, ''] }))} className="text-xs text-red-600 font-medium hover:underline">+ Thêm liên kết video</button>
          </div>
          <div className="space-y-2">
            {form.youtubeUrls.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input type="url" placeholder="Nhập URL video dạng https://youtube.com/..." value={url} onChange={(e) => {
                  const n = [...form.youtubeUrls]; n[index] = e.target.value; setForm({ ...form, youtubeUrls: n });
                }} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
                <button type="button" onClick={() => setForm(p => ({ ...p, youtubeUrls: p.youtubeUrls.filter((_, i) => i !== index) }))} className="text-gray-400 hover:text-red-500 px-1 font-bold transition-colors">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm border border-red-100">{error}</div>}
        {message && <div className="p-3 bg-green-50 text-green-700 rounded text-sm border border-green-100">{message}</div>}

        {/* Nút hành động */}
        <div className="pt-2">
          <button type="submit" disabled={loading} className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition-colors active:scale-98">
            {loading ? 'Đang tạo sản phẩm...' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}