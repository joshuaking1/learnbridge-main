import { useState } from 'react';
import { ButtonWithLoading } from '@/components/ui/button-with-loading';
import { TwoFactorSetup } from './TwoFactorSetup';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/auth-api';
import { formatDistanceToNow } from 'date-fns';
import { FingerprintIcon, ShieldCheckIcon, ShieldXIcon } from 'lucide-react';

interface LoginHistoryEntry {
    id: string;
    timestamp: string;
    successful: boolean;
    ipAddress: string;
    device: string;
    failureReason: string | null;
}

interface SecuritySettingsProps {
    is2FAEnabled: boolean;
}

export function SecuritySettings({ is2FAEnabled }: SecuritySettingsProps) {
    const [showSetup, setShowSetup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
    const { toast } = useToast();

    const loadLoginHistory = async () => {
        try {
            setIsLoadingHistory(true);
            const data = await authApi.get<{ loginHistory: LoginHistoryEntry[] }>('/api/auth/login-history');
            setLoginHistory(data.loginHistory);
        } catch (error) {
            const apiError = error as Error;
            toast({
                title: "Error",
                description: apiError.message || "Failed to load login history",
                variant: "destructive"
            });
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleDisable2FA = async () => {
        try {
            setIsLoading(true);
            await authApi.post<{ message: string }>('/api/auth/2fa/disable');
            toast({
                title: "Success",
                description: "Two-factor authentication has been disabled"
            });
            window.location.reload(); // Refresh to update security status
        } catch (error) {
            const apiError = error as Error;
            toast({
                title: "Error",
                description: apiError.message || "Failed to disable two-factor authentication",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Security Settings</h2>
                
                {/* 2FA Section */}
                <div className="p-6 bg-white rounded-lg shadow-lg">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600">
                                Add an extra layer of security to your account by requiring a verification
                                code in addition to your password.
                            </p>
                        </div>
                        {is2FAEnabled ? (
                            <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                        ) : (
                            <ShieldXIcon className="w-6 h-6 text-gray-400" />
                        )}
                    </div>

                    <div className="mt-4">
                        {is2FAEnabled ? (
                            <ButtonWithLoading
                                variant="destructive"
                                onClick={handleDisable2FA}
                                loading={isLoading}
                            >
                                Disable Two-Factor Authentication
                            </ButtonWithLoading>
                        ) : (
                            <ButtonWithLoading
                                onClick={() => setShowSetup(true)}
                                loading={isLoading}
                            >
                                Enable Two-Factor Authentication
                            </ButtonWithLoading>
                        )}
                    </div>

                    {showSetup && !is2FAEnabled && (
                        <div className="mt-6">
                            <TwoFactorSetup
                                onSetupComplete={() => window.location.reload()}
                                onCancel={() => setShowSetup(false)}
                            />
                        </div>
                    )}
                </div>

                {/* Login History Section */}
                <div className="p-6 bg-white rounded-lg shadow-lg">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">Login History</h3>
                            <p className="text-sm text-gray-600">
                                Review recent login attempts to your account.
                            </p>
                        </div>
                        <FingerprintIcon className="w-6 h-6 text-blue-500" />
                    </div>

                    <div className="mt-4">
                        <ButtonWithLoading
                            variant="outline"
                            onClick={loadLoginHistory}
                            loading={isLoadingHistory}
                        >
                            {loginHistory.length > 0 ? 'Refresh History' : 'Load History'}
                        </ButtonWithLoading>

                        {loginHistory.length > 0 && (
                            <div className="mt-4 space-y-4">
                                {loginHistory.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={`p-4 rounded-lg border ${
                                            entry.successful
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                        }`}
                                    >
                                        <div className="flex justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    {entry.successful ? 'Successful Login' : 'Failed Attempt'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm text-gray-600">
                                                <p>{entry.ipAddress}</p>
                                                <p className="text-xs">{entry.device}</p>
                                            </div>
                                        </div>
                                        {!entry.successful && entry.failureReason && (
                                            <p className="mt-2 text-sm text-red-600">
                                                Reason: {entry.failureReason}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}