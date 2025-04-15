'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface TableOfSpecification {
    id: string;
    title: string;
    created_at: string;
}

export default function MyTosPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAuthenticated, user, token, isLoadingAuth } = useAuth();
    const [hasMounted, setHasMounted] = useState(false);
    const [tosList, setTosList] = useState<TableOfSpecification[]>([]);
    const [isLoadingTos, setIsLoadingTos] = useState(false);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Auth check effect
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            router.push('/login');
        }
    }, [hasMounted, isLoadingAuth, isAuthenticated, router]);

    if (!hasMounted || isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                Loading...
            </div>
        );
    }

    if (!isAuthenticated || !user || user.role !== 'teacher') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                Redirecting to login...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-darkblue">
                        My Saved Tables of Specification
                    </h1>
                    <p className="text-gray-600 mt-2">
                        View and manage your saved tables of specification
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/tos-builder">Create New ToS</Link>
                </Button>
            </header>

            {isLoadingTos ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : errorLoading ? (
                <div className="text-center text-red-500 p-8">
                    {errorLoading}
                </div>
            ) : tosList.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                    No tables of specification found. Create your first ToS!
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tosList.map((tos) => (
                        <div key={tos.id} className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-semibold">{tos.title}</h3>
                            <p className="text-sm text-gray-500">
                                Created: {new Date(tos.created_at).toLocaleDateString()}
                            </p>
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/my-tos/${tos.id}`)}
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
