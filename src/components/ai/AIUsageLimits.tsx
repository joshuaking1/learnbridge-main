"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UsageLimit {
    service: string;
    currentUsage: number;
    limit: number;
    remaining: number;
}

interface UsageLimitsData {
    isAdmin: boolean;
    services: UsageLimit[];
    error?: string;
}

interface AIUsageLimitsProps {
    darkMode?: boolean;
    compact?: boolean;
}

export function AIUsageLimits({ darkMode = false, compact = false }: AIUsageLimitsProps = {}) {
    const { token, user } = useAuthStore();
    const { toast } = useToast();

    const [limits, setLimits] = useState<UsageLimitsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsageLimits = async () => {
            if (!token) return;

            setIsLoading(true);
            setError(null);

            try {
                // Use relative URL in production, which will be handled by Vercel rewrites
                const apiUrl = process.env.NODE_ENV === 'production'
                    ? '/api/ai/limits'
                    : 'http://localhost:3004/api/ai/limits';

                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch usage limits');
                }

                const data = await response.json();
                setLimits(data);
            } catch (error) {
                console.error('Error fetching usage limits:', error);
                setError('Failed to load usage limits. Please try again later.');
                toast({
                    title: 'Error',
                    description: 'Failed to load usage limits',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsageLimits();
    }, [token, toast]);

    // Helper function to format service name for display
    const formatServiceName = (serviceName: string): string => {
        return serviceName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-24">
                <Loader2 className="h-5 w-5 animate-spin text-brand-orange" />
                <span className="ml-2 text-gray-600">Loading usage limits...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!limits) {
        return null;
    }

    // If user is admin, don't show limits
    if (limits.isAdmin || user?.role === 'admin') {
        return (
            <Card className={`${compact ? 'mb-2' : 'mb-4'} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-200'}`}>
                <CardHeader className={compact ? "py-2 px-3" : "pb-2"}>
                    <CardTitle className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-blue-800'}`}>Admin Access</CardTitle>
                </CardHeader>
                <CardContent className={compact ? "px-3 py-2" : ""}>
                    <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-blue-700'}`}>
                        As an admin, you have unlimited access to all features.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${compact ? 'mb-2' : 'mb-4'} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
            <CardHeader className={compact ? "py-2 px-3" : "pb-2"}>
                <CardTitle className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>Daily Usage Limits</CardTitle>
                <CardDescription className={darkMode ? 'text-slate-400' : ''}>
                    Your remaining usage for today
                </CardDescription>
            </CardHeader>
            <CardContent className={compact ? "px-3 py-2" : ""}>
                <div className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
                    {limits.services.map((service) => (
                        <div key={service.service} className={`${compact ? 'space-y-0.5' : 'space-y-1'}`}>
                            <div className="flex justify-between text-sm">
                                <span className={darkMode ? 'text-slate-300' : ''}>{formatServiceName(service.service)}</span>
                                <span className={service.remaining === 0
                                    ? `font-medium ${darkMode ? 'text-red-400' : 'text-red-500'}`
                                    : darkMode ? 'text-slate-300' : ''}>
                                    {service.remaining} / {service.limit} remaining
                                </span>
                            </div>
                            <Progress
                                value={(service.currentUsage / service.limit) * 100}
                                className={service.remaining === 0
                                    ? (darkMode ? 'bg-red-900/30' : 'bg-red-100')
                                    : (darkMode ? 'bg-slate-700' : 'bg-gray-100')}
                                indicatorClassName={service.remaining === 0
                                    ? 'bg-red-500'
                                    : 'bg-brand-orange'}
                            />
                        </div>
                    ))}

                    <p className={`text-xs ${compact ? 'mt-1' : 'mt-2'} ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        Limits reset at midnight in your local timezone.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
