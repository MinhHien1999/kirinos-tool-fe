'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NumericFormat } from 'react-number-format';

import { generateSlug } from '@/utils/slug.js';
import ProductEditor from '@/components/ProductEditor';
import OldImagesManager from '@/components/OldImagesManager';
import NewImagesManager from '@/components/NewImagesManager';
import NotFound from '@/components/NotFound'; // 🔥 Import component xử lý 404
import useProductImages from '@/hooks/useProductImages'; 
import { compressImages } from '@/utils/imageCompression';
import {
  fetchProductDetailById,
  updateProductService,
} from '@/services/productService';
import { fetchBrands } from '@/services/brandService';
import { fetchCategories } from '@/services/categoryService';

export default function AdminEditProduct({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState({
    name: '',
    price: 0,
    slug: '',
    brand: '',
    category: '',
    description: '',
    status: 'in_stock',
    specs: [],
    youtubeUrls: [],
  });

  const [oldImages, setOldImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false); // 🔥 State bẫy lỗi 404 sản phẩm

  const {
    imageFiles,
    newImagesPreview,
    mainImageId,
    setMainImageId,
    setNewImagesPreview,
    handleNewFilesChange,
    handleRemoveNewPreview,
    handleSetMainImage,
    clearImagesState,
  } = useProductImages();

  useEffect(() => {
    const fetchProductAndMeta = async () => {
      try {
        setFetching(true);
        setError('');
        setIsNotFound(false); // Reset trạng thái khi fetch mới

        const [resBrands, resCats, productData] = await Promise.all([
          fetchBrands(1, 100),
          fetchCategories(1, 100),
          fetchProductDetailById(id),
        ]);

        setBrands(resBrands?.brands || []);
        setCategories(resCats?.categories || []);

        if (productData && productData.name) {
          const cloudinaryImages = (productData.images || []).filter(
            (img) => img.type === 'image',
          );
          const youtubeLinks = (productData.images || [])
            .filter((img) => img.type === 'youtube')
            .map((img) => img.url);

          setOldImages(cloudinaryImages);
          setImagesToDelete([]);
          setNewImagesPreview([]); 

          const currentMainImg = cloudinaryImages.find((img) => img.isMain);
          if (currentMainImg) {
            setMainImageId(currentMainImg.public_id);
          } else if (cloudinaryImages.length > 0) {
            setMainImageId(cloudinaryImages[0].public_id);
          }

          setForm({
            name: productData.name || '',
            price: productData.price || 0,
            slug: productData.slug || '',
            brand: productData.brand?._id || productData.brand || '',
            category: productData.category?._id || productData.category || '',
            description: productData.description || '',
            status: productData.status || 'in_stock',
            specs:
              productData.specs && productData.specs.length
                ? productData.specs
                : [{ label: '', value: '' }],
            youtubeUrls: youtubeLinks.length ? youtubeLinks : [''],
          });
        } else {
          // Trường hợp API không lỗi nhưng trả về rỗng hoặc sai cấu trúc dữ liệu
          setIsNotFound(true);
        }
      } catch (err) {
        console.error('🔴 Lỗi nạp thông tin đồng bộ tại Admin Edit:', err);
        
        // 🔥 Bẫy lỗi: Nếu Backend phản hồi mã trạng thái HTTP là 404
        if (err.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu.');
        }
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchProductAndMeta();
  }, [id, setMainImageId, setNewImagesPreview]);

  const handleRemoveOldImage = (publicId) => {
    if (!publicId) return;
    
    setImagesToDelete((prev) => [...prev, publicId]);
    setOldImages((prev) => {
      const updatedImages = prev.filter((img) => img.public_id !== publicId);
      
      if (publicId === mainImageId) {
        if (updatedImages.length > 0) {
          setMainImageId(updatedImages[0].public_id);
        } else if (newImagesPreview.length > 0) {
          setMainImageId(newImagesPreview[0].id);
        } else {
          setMainImageId('');
        }
      }
      return updatedImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('slug', form.slug);
      formData.append('brand', form.brand);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('status', form.status);

      const cleanSpecs = form.specs.filter(
        (s) => s.label.trim() || s.value.trim(),
      );
      formData.append('specs', JSON.stringify(cleanSpecs));

      form.youtubeUrls
        .filter((u) => u.trim())
        .forEach((url) => {
          formData.append('youtubeUrls', url);
        });

      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      formData.append('mainImageId', mainImageId);

      const optimizedImages = await compressImages(imageFiles, 1.5);
      optimizedImages.forEach((file) => {
        formData.append('images', file);
      });

      await updateProductService(id, formData);

      setMessage('Cập nhật thông tin sản phẩm thành công!');
      setImagesToDelete([]);
      clearImagesState(); 
      router.refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Cập nhật dữ liệu thất bại.');
    } finally {
      setLoading(false);
    }
  };

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
      nodes
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .forEach((node) => {
          ordered.push({ ...node, level });
          if (node.children && node.children.length) traverse(node.children, level + 1);
        });
    };
    traverse(roots);
    return ordered;
  }, [categories]);

  // 🛠️ CHẶN GIAO DIỆN 1: Đang tải dữ liệu
  if (fetching) {
    return <div className="w-full p-6 text-sm text-gray-500 font-medium animate-pulse">Đang nạp dữ liệu từ hệ thống...</div>;
  }

  // 🛠️ CHẶN GIAO DIỆN 2: Hiển thị 404 nếu sản phẩm đã bị xóa hoặc không tìm thấy ID
  if (isNotFound) {
    return (
      <NotFound 
        title="Sản phẩm không tồn tại"
        message={`Mã ID sản phẩm [ ${id} ] không khớp với bất kỳ dữ liệu nào hiện có.\nSản phẩm có thể đã bị xóa trước đó.`}
        backLink="/admin/products"
        backText="Quay lại danh sách sản phẩm"
      />
    );
  }

  // 🛠️ GIAO DIỆN 3: Hiển thị form edit sản phẩm chuẩn khi dữ liệu hợp lệ
  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        </div>
        <Link href="/admin/products" className="w-full sm:w-auto text-center rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 shadow-sm">
          Quay lại danh sách
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="w-full bg-white p-4 sm:p-6 rounded-lg border border-gray-200 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">Tên sản phẩm</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none text-gray-900" />
          </div>
          <div className="w-full lg:w-5/12 space-y-1">
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <div className="flex gap-2">
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none text-gray-900" />
              <button type="button" onClick={() => setForm({ ...form, slug: generateSlug(form.name) })} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 shadow-sm">Random</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">Thương hiệu</label>
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none text-gray-900">
              <option value="">Chọn thương hiệu</option>
              {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">Danh mục</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none text-gray-900">
              <option value="">Chọn danh mục</option>
              {categoryTree.map((c) => <option key={c._id} value={c._id}>{'\u00A0\u00A0'.repeat(c.level)}{c.level > 0 ? '↳ ' : ''}{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 space-y-1">
            <label className="text-sm font-medium text-gray-700">Trạng thái kho hàng</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none text-gray-900">
              <option value="in_stock">Còn hàng (In Stock)</option>
              <option value="out_of_stock">Hết hàng (Out of Stock)</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/2 space-y-1">
            <label className="text-sm font-medium text-gray-700">Tải lên hình ảnh mới</label>
            <div className="relative border border-dashed border-gray-300 rounded bg-gray-50 p-2 text-center hover:border-blue-500 cursor-pointer">
              <input type="file" multiple accept="image/*" onChange={handleNewFilesChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <span className="text-xs text-gray-500 font-medium px-2 block truncate">Bấm hoặc kéo thả để thêm ảnh mới</span>
            </div>
          </div>
        </div>

        <NewImagesManager 
          previews={newImagesPreview} 
          mainImageId={mainImageId} 
          onSetMain={handleSetMainImage} 
          onRemove={handleRemoveNewPreview} 
        />

        <OldImagesManager 
          images={oldImages} 
          mainImageId={mainImageId} 
          onRemove={handleRemoveOldImage} 
          onSetMain={handleSetMainImage} 
        />

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Giá tiền sản phẩm <b>(đơn vị: VNĐ)</b> </label>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <NumericFormat
                value={form.price || 0}
                onValueChange={(values) => {
                  // values.floatValue tự động trả về giá trị kiểu Number (ví dụ: 1000000)
                  setForm({ ...form, price: values.floatValue || 0 });
                }}
                thousandSeparator="." // Phân cách 3 chữ số bằng 1 khoảng trắng
                decimalSeparator=","   // Đổi dấu thập phân sang dấu phẩy để tránh trùng với thousandSeparator
                allowNegative={false} // Chặn hoàn toàn số âm
                decimalScale={0}      // Chỉ nhận số nguyên (loại bỏ dấu thập phân)
                suffix=" đ"
                placeholder="Nhập giá tiền sản phẩm"
                required
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Mô tả chi tiết</label>
          <div className="border border-gray-300 rounded overflow-hidden">
            <ProductEditor value={form.description} onChange={(content) => setForm((p) => ({ ...p, description: content }))} />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Thông số kỹ thuật</label>
            <button type="button" onClick={() => setForm((p) => ({ ...p, specs: [...p.specs, { label: '', value: '' }] }))} className="text-xs text-blue-600 font-medium hover:underline">+ Thêm thông số</button>
          </div>
          <div className="space-y-2">
            {form.specs.map((spec, index) => (
              <div key={index} className="flex gap-2 items-center w-full">
                <input placeholder="Nhãn" value={spec.label} onChange={(e) => { const n = [...form.specs]; n[index].label = e.target.value; setForm({ ...form, specs: n }); }} className="w-1/2 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900" />
                <input placeholder="Giá trị" value={spec.value} onChange={(e) => { const n = [...form.specs]; n[index].value = e.target.value; setForm({ ...form, specs: n }); }} className="w-1/2 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900" />
                <button type="button" onClick={() => setForm((p) => ({ ...p, specs: p.specs.filter((_, i) => i !== index) }))} className="text-gray-400 hover:text-red-500 px-2 font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">YouTube URLs (tùy chọn)</label>
            <button type="button" onClick={() => setForm((p) => ({ ...p, youtubeUrls: [...p.youtubeUrls, ''] }))} className="text-xs text-red-600 font-medium hover:underline">+ Thêm video</button>
          </div>
          <div className="space-y-2">
            {form.youtubeUrls.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input type="url" placeholder="Nhập URL video..." value={url} onChange={(e) => { const n = [...form.youtubeUrls]; n[index] = e.target.value; setForm({ ...form, youtubeUrls: n }); }} className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900" />
                <button type="button" onClick={() => setForm((p) => ({ ...p, youtubeUrls: p.youtubeUrls.filter((_, i) => i !== index) }))} className="text-gray-400 hover:text-red-500 px-2 font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm border border-red-100 break-words">{error}</div>}
        {message && <div className="p-3 bg-green-50 text-green-700 rounded text-sm border border-green-100 break-words">{message}</div>}

        <div className="pt-2">
          <button type="submit" disabled={loading} className="w-full sm:w-auto rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400">
            {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}