'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function AdminGuard({
  children,
}) {
  const router = useRouter();

  const {
    isAuthenticated,
    loading,
  } = useAuth();

  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated
    ) {
      router.replace('/auth/login');
    }
  }, [
    isAuthenticated,
    loading,
    router,
  ]);

  // Đợi verify token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Chưa login
  if (!isAuthenticated) {
    return null;
  }

  return children;
}