'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function GuestGuard({
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
      isAuthenticated
    ) {
      router.replace('/admin');
    }
  }, [
    isAuthenticated,
    loading,
    router,
  ]);

  // Đang verify auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang kiểm tra...
      </div>
    );
  }

  // Đã login → không render login page
  if (isAuthenticated) {
    return null;
  }

  return children;
}