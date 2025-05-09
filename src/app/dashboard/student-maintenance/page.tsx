"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { StudentPortalMaintenance } from '@/components/maintenance/StudentPortalMaintenance';

export default function StudentMaintenancePage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  // Log authentication state for debugging
  useEffect(() => {
    if (!isLoading) {
      console.log('StudentMaintenancePage: Auth State', {
        isAuthenticated,
        userRole: user?.role,
        userDetails: user
      });
    }
  }, [isLoading, isAuthenticated, user]);

  // This page is specifically for students - redirect others
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'student') {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Always show the maintenance page on this route
  return <StudentPortalMaintenance />;
}
