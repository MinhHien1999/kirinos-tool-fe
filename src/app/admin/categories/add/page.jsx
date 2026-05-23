'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateSlug, generateRandomSlug } from '@/utils/slug.js';
import { fetchCategories, createCategory } from '@/services/categoryService';

export default function AdminAddCategory() {
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

  // Auto-generate slug when name changes
  useEffect(() => {
    if (form.name.trim()) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name]);

  // Fetch categories for parent selection
  useEffect(() => {
    loadParentCategories();
  }, []);

  const loadParentCategories = async () => {
    try {
      // Lấy danh sách lớn (ví dụ tối đa 100) để người dùng chọn danh mục cha
      const result = await fetchCategories(1, 100);
      setCategories(result.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories for select parent:', err);
    }
  };

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

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        parent: form.parent || undefined,
      };

      // 🟢 Sử dụng Axios Service tạo danh mục
      const result = await createCategory(payload);
      
      const categoryName = result?.data?.name || result?.name || form.name;
      setMessage(`Đã tạo danh mục: ${categoryName}`);
      
      setForm({
        name: '',
        slug: '',
        description: '',
        parent: '',
      });
      
      // Refresh list danh mục cha cập nhật cấu trúc mới
      loadParentCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thêm danh mục mới</h1>
          <p className="text-gray-600 mt-1">Đăng danh mục mới vào hệ thống.</p>
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
            <p className="mt-1 text-xs text-gray-500">Slug được tạo tự động từ tên danh mục. Nhấn Random để tạo slug ngẫu nhiên.</p>
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
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {'\u00A0\u00A0'.repeat(getCategoryLevel(category))}{category.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Chọn danh mục cha nếu đây là danh mục con.</p>
        </label>

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Tạo danh mục'}
        </button>
      </form>
    </div>
  );
}