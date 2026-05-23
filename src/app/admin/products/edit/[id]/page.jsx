'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateSlug } from '@/utils/slug.js';
import ProductEditor from '@/components/ProductEditor';

// Import tách biệt đúng trách nhiệm từng file Service của bạn
import { fetchProductDetailById, updateProductService } from '@/services/productService';
import { fetchBrands } from '@/services/brandService';
import { fetchCategories } from '@/services/categoryService';

export default function AdminEditProduct({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState({
    name: '',
    slug: '',
    brand: '',
    category: '',
    description: '', 
    status: 'in_stock',
    specs: [],
    youtubeUrls: [],
    imageFiles: [],
  });

  const [oldImages, setOldImages] = useState([]); 
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProductAndMeta = async () => {
      try {
        setFetching(true);
        setError('');

        // Gọi đồng thời 3 API qua Axios Service, truyền limit lớn (100) để lấy toàn bộ dữ liệu cho ô Select
        const [resBrands, resCats, productData] = await Promise.all([
          fetchBrands(1, 100),       // Lấy trang 1, tối đa 100 thương hiệu
          fetchCategories(1, 100),   // Lấy trang 1, tối đa 100 danh mục
          fetchProductDetailById(id) // Lấy chi tiết sản phẩm theo ID hệ thống
        ]);

        // Bóc tách dữ liệu từ cấu trúc Object { brands, pagination } của các Service tương ứng
        setBrands(resBrands?.brands || []);
        setCategories(resCats?.categories || []);

        // Khớp dữ liệu sản phẩm đổ vào Form State
        if (productData && productData.name) {
          const cloudinaryImages = (productData.images || []).filter(img => img.type === 'image');
          const youtubeLinks = (productData.images || []).filter(img => img.type === 'youtube').map(img => img.url);
          
          setOldImages(cloudinaryImages);

          setForm({
            name: productData.name || '',
            slug: productData.slug || '',
            brand: productData.brand?._id || productData.brand || '', 
            category: productData.category?._id || productData.category || '', 
            description: productData.description || '', 
            status: productData.status || 'in_stock',
            specs: productData.specs && productData.specs.length ? productData.specs : [{ label: '', value: '' }],
            youtubeUrls: youtubeLinks.length ? youtubeLinks : [''],
            imageFiles: [] // Reset mảng file upload mới
          });
        } else {
          setError('Không thể bóc tách hoặc định dạng sai cấu trúc dữ liệu sản phẩm từ máy chủ.');
        }
      } catch (err) {
        console.error("🔴 Lỗi nạp thông tin đồng bộ tại Admin Edit:", err);
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu cấu hình sản phẩm.');
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchProductAndMeta();
  }, [id]);

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

      const cleanSpecs = form.specs.filter(s => s.label.trim() || s.value.trim());
      formData.append('specs', JSON.stringify(cleanSpecs));

      form.youtubeUrls.filter(u => u.trim()).forEach(url => {
        formData.append('youtubeUrls', url);
      });

      form.imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Gửi dữ liệu cập nhật qua hàm update chuyên biệt của productService bằng Axios
      await updateProductService(id, formData);

      setMessage('Cập nhật thông tin sản phẩm thành công!');
      router.refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Cập nhật dữ liệu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán cây danh mục lồng nhau (Mục cha > Mục con) dựa trên mảng phẳng Categories nhận về
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
      nodes.sort((a, b) => (a.name || '').localeCompare(b.name || '')).forEach((node) => {
        ordered.push({ ...node, level });
        if (node.children && node.children.length) traverse(node.children, level + 1);
      });
    };
    traverse(roots);
    return ordered;
  }, [categories]);

  if (fetching) {
    return <div className="w-full p-6 text-sm text-gray-500 font-medium animate-pulse">Đang nạp dữ liệu cấu hình bằng Axios...</div>;
  }

  return (
    <div className="w-full space-y-4 p-4">
      {/* Khối tiêu đề trang */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin chi tiết sản phẩm.</p>
        </div>
        <Link href="/admin/products" className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
          Quay lại danh sách
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-lg border border-gray-200 space-y-4 shadow-sm">
        
        {/* Hàng Tên sản phẩm & Slug + Nút tạo chuỗi ngẫu nhiên */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label htmlFor="product-name" className="text-sm font-medium text-gray-700">Tên sản phẩm</label>
            <input id="product-name" name="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
          </div>
          <div className="w-full md:w-5/12 space-y-1">
            <label htmlFor="product-slug" className="text-sm font-medium text-gray-700">Slug</label>
            <div className="flex gap-2">
              <input id="product-slug" name="slug" type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
              <button type="button" onClick={() => setForm({ ...form, slug: generateSlug(form.name) })} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 shadow-sm transition-all active:scale-98">Random</button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">Slug được tạo tự động từ tên sản phẩm. Nhấn Random để tạo slug ngẫu nhiên.</p>

        {/* Hàng Chọn lựa Thương hiệu & Danh mục hệ thống */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label htmlFor="product-brand" className="text-sm font-medium text-gray-700">Thương hiệu</label>
            <select id="product-brand" name="brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-blue-500 text-gray-900">
              <option value="">Chọn thương hiệu</option>
              {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label htmlFor="product-category" className="text-sm font-medium text-gray-700">Danh mục</label>
            <select id="product-category" name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-blue-500 text-gray-900">
              <option value="">Chọn danh mục</option>
              {categoryTree.map(c => (
                <option key={c._id} value={c._id}>
                  {'\u00A0\u00A0'.repeat(c.level)}{c.level > 0 ? '↳ ' : ''}{c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hàng Trạng thái tồn kho & Thêm file hình ảnh mới */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label htmlFor="product-status" className="text-sm font-medium text-gray-700">Trạng thái kho hàng</label>
            <select id="product-status" name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-blue-500 text-gray-900">
              <option value="in_stock">Còn hàng (In Stock)</option>
              <option value="out_of_stock">Hết hàng (Out of Stock)</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label htmlFor="product-images" className="text-sm font-medium text-gray-700">Tải lên hình ảnh mới (nếu có)</label>
            <input id="product-images" name="images" type="file" multiple onChange={(e) => setForm({ ...form, imageFiles: Array.from(e.target.files) })} className="w-full rounded border border-gray-300 px-3 py-[5px] bg-white text-sm text-gray-500 cursor-pointer file:mr-3 file:py-0.5 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:text-xs file:text-gray-700 hover:file:bg-gray-100" />
          </div>
        </div>

        {/* Khối hiển thị Preview danh sách ảnh cũ đã có từ trước */}
        {oldImages.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hình ảnh hiện có:</label>
            <div className="flex gap-2 flex-wrap">
              {oldImages.map((img, i) => (
                <div key={i} className="relative w-16 h-16 border border-gray-200 rounded overflow-hidden bg-gray-50 shadow-sm">
                  <img src={img.url} alt="product asset" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Khối Editor soạn thảo mô tả Markdown / HTML RichText */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Mô tả chi tiết sản phẩm</label>
          <div className="border border-gray-300 rounded overflow-hidden">
            <ProductEditor value={form.description} onChange={(content) => setForm(p => ({ ...p, description: content }))} />
          </div>
        </div>

        {/* Khối cấu hình thông số kỹ thuật (Specs) linh hoạt */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Thông số kỹ thuật</label>
            <button type="button" onClick={() => setForm(p => ({ ...p, specs: [...p.specs, { label: '', value: '' }] }))} className="text-xs text-blue-600 font-medium hover:underline">+ Thêm thông số</button>
          </div>
          <div className="space-y-2">
            {form.specs.map((spec, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input placeholder="Nhãn (Ví dụ: CPU)" value={spec.label} onChange={(e) => {
                  const n = [...form.specs]; n[index].label = e.target.value; setForm({ ...form, specs: n });
                }} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
                <input placeholder="Giá trị (Ví dụ: M3 Max)" value={spec.value} onChange={(e) => {
                  const n = [...form.specs]; n[index].value = e.target.value; setForm({ ...form, specs: n });
                }} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
                <button type="button" onClick={() => setForm(p => ({ ...p, specs: p.specs.filter((_, i) => i !== index) }))} className="text-gray-400 hover:text-red-500 px-1 font-bold transition-colors">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Khối liên kết video YouTube review sản phẩm */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">YouTube URLs (tùy chọn)</label>
            <button type="button" onClick={() => setForm(p => ({ ...p, youtubeUrls: [...p.youtubeUrls, ''] }))} className="text-xs text-red-600 font-medium hover:underline">+ Thêm liên kết video</button>
          </div>
          <div className="space-y-2">
            {form.youtubeUrls.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input type="url" placeholder="Nhập URL video dạng https://youtube.com/watch?v=..." value={url} onChange={(e) => {
                  const n = [...form.youtubeUrls]; n[index] = e.target.value; setForm({ ...form, youtubeUrls: n });
                }} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900" />
                <button type="button" onClick={() => setForm(p => ({ ...p, youtubeUrls: p.youtubeUrls.filter((_, i) => i !== index) }))} className="text-gray-400 hover:text-red-500 px-1 font-bold transition-colors">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Khối hiển thị thông điệp phản hồi từ máy chủ */}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm border border-red-100">{error}</div>}
        {message && <div className="p-3 bg-green-50 text-green-700 rounded text-sm border border-green-100">{message}</div>}

        {/* Nút bấm Lưu thay đổi */}
        <div className="pt-2">
          <button type="submit" disabled={loading} className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition-colors active:scale-98">
            {loading ? 'Đang cập nhật lên hệ thống...' : 'Cập nhật sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}