"use client";

import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useState } from 'react';

export function UserDataDebug() {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted || isLoading) {
        return <div className="p-4 bg-gray-100 rounded-md">Loading auth state...</div>;
    }

    if (!isAuthenticated || !user) {
        return <div className="p-4 bg-red-100 rounded-md">Not authenticated or no user data</div>;
    }

    return (
        <div className="p-4 bg-green-100 rounded-md">
            <h3 className="font-bold mb-2">User Data Debug</h3>
            <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
                {JSON.stringify(user, null, 2)}
            </pre>
        </div>
    );
}
