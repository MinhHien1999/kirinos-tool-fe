'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { generateSlug, generateRandomSlug } from '@/utils/slug.js';
import { fetchCategories, fetchCategoryById, updateCategory } from '@/services/categoryService';

export default function AdminEditCategory() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isNameChanged, setIsNameChanged] = useState(false);

  // Khởi chạy nạp đồng thời danh sách options cha và thông tin danh mục hiện tại
  useEffect(() => {
    const initializeData = async () => {
      try {
        setFetchLoading(true);
        setError('');
        
        // 1. Lấy danh sách danh mục làm cha
        const listResult = await fetchCategories(1, 100);
        setCategories(listResult.categories || []);

        // 2. Lấy thông tin hiện tại của danh mục cần sửa
        const currentCategory = await fetchCategoryById(id);
        if (!currentCategory) {
          throw new Error('Không tìm thấy thông tin danh mục cần chỉnh sửa.');
        }

        setForm({
          name: currentCategory.name || '',
          slug: currentCategory.slug || '',
          description: currentCategory.description || '',
          parent: currentCategory.parent?._id || currentCategory.parent || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setFetchLoading(false);
      }
    };

    initializeData();
  }, [id]);

  // Auto-generate slug when name changes (nhưng chỉ khi người dùng đã chủ động gõ)
  useEffect(() => {
    if (isNameChanged && form.name.trim()) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, isNameChanged]);

  const getCategoryLevel = (category) => {
    let level = 0;
    let current = category;
    while (current.parent) {
      level++;
      current = current.parent;
    }
    return level;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setIsNameChanged(true);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateRandomSlug = () => {
    setForm((prev) => ({ ...prev, slug: generateRandomSlug() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // Chống lỗi logic dữ liệu: không cho phép chọn chính mình làm danh mục cha
    if (form.parent === id) {
      setError('Một danh mục không thể chọn chính nó làm danh mục cha!');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        parent: form.parent || null, // Nếu rỗng gửi null để xoá parent cũ
      };

      // 🟢 Gọi Axios service update danh mục
      const result = await updateCategory(id, payload);
      const updatedName = result?.data?.name || result?.name || form.name;

      setMessage(`Đã cập nhật danh mục: ${updatedName}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 font-medium">Đang tải thông tin danh mục...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin danh mục trong hệ thống.</p>
        </div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Quay lại danh sách
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Tên danh mục</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Slug</span>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                name="slug"
                value={form.slug}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={handleGenerateRandomSlug}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Random
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Slug tự động đổi khi bạn sửa tên danh mục. Nhấn Random để tạo chuỗi ngẫu nhiên.</p>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Mô tả</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Mô tả về danh mục này..."
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Danh mục cha (tùy chọn)</span>
          <select
            name="parent"
            value={form.parent}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Không có danh mục cha</option>
            {categories
              // Lọc bỏ chính danh mục hiện tại ra khỏi danh sách để tránh lặp vòng tròn
              .filter((cat) => cat._id !== id)
              .map((category) => (
                <option key={category._id} value={category._id}>
                  {'\u00A0\u00A0'.repeat(getCategoryLevel(category))}{category.name}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Chọn danh mục quản lý cấp cao hơn của danh mục này nếu cần.</p>
        </label>

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật danh mục'}
        </button>
      </form>
    </div>
  );
}