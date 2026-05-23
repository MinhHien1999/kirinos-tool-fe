'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { generateSlug, generateRandomSlug } from '@/utils/slug.js';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/brands`;

export default function AdminEditBrand() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    logo: '',
    logoFile: null,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isNameChanged, setIsNameChanged] = useState(false);

  useEffect(() => {
    fetchBrand();
  }, [id]);

  // Auto-generate slug when name changes (but not on initial load)
  useEffect(() => {
    if (isNameChanged && form.name.trim()) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, isNameChanged]);

  const fetchBrand = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch brand');
      }

      const result = await response.json();
      const brand = result.data;
      setForm({
        name: brand.name || '',
        slug: brand.slug || '',
        logo: brand.logo || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setIsNameChanged(true);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, logoFile: file }));
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
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('slug', form.slug);
      if (form.logoFile) {
        formData.append('logo', form.logoFile);
      } else if (form.logo) {
        formData.append('logo', form.logo);
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Cập nhật thương hiệu thất bại');
      }

      setMessage(`Đã cập nhật thương hiệu: ${result.data.name}`);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chỉnh sửa thương hiệu
          </h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin thương hiệu.</p>
        </div>
        <Link
          href="/admin/brands"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Quay lại danh sách
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-sm"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Tên thương hiệu
            </span>
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
            <p className="mt-1 text-xs text-gray-500">Slug được tạo tự động từ tên thương hiệu khi chỉnh sửa tên. Nhấn Random để tạo slug ngẫu nhiên.</p>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Logo file
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-2 text-sm text-gray-500">Hoặc điền URL logo nếu không upload file.</p>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Logo URL (tùy chọn)
          </span>
          <input
            type="url"
            name="logo"
            value={form.logo}
            onChange={handleChange}
            placeholder="Nhập URL logo"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật thương hiệu'}
        </button>
      </form>
    </div>
  );
}
