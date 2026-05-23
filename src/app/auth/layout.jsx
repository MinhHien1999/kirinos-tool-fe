'use client';

import GuestGuard from '@/components/GuestGuard';

export default function AuthLayout({
  children,
}) {
  return (
    <GuestGuard>
      {children}
    </GuestGuard>
  );
}