"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);
    const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();

    // --- Effect to set hasMounted on client ---
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // --- Effect to handle authentication ---
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            router.push('/login');
        }
    }, [hasMounted, isAuthenticated, isLoadingAuth, router]);

    // --- Loading state ---
    if (!hasMounted || isLoadingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    // --- Not authenticated state ---
    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-6 min-h-screen">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-white hover:bg-brand-orange/20 hover:text-brand-orange">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-arvo font-bold text-white">
                        Your Profile
                    </h1>
                    <p className="text-white/70 mt-2">
                        View and manage your profile information
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <ProfileSection />
                </div>
            </div>
        </div>
    );
}
