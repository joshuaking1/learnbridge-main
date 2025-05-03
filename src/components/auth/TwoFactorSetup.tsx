import { useState } from 'react';
import Image from 'next/image';
import { ButtonWithLoading } from '@/components/ui/button-with-loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/auth-api';
import { APIError, APIResponseError, TwoFactorInitResponse } from '@/types/api';

interface TwoFactorSetupProps {
    onSetupComplete: () => void;
    onCancel: () => void;
}

export function TwoFactorSetup({ onSetupComplete, onCancel }: TwoFactorSetupProps) {
    const [step, setStep] = useState<'intro' | 'qr' | 'verify'>('intro');
    const [setupData, setSetupData] = useState<TwoFactorInitResponse | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleInitialize = async () => {
        try {
            console.log('[TwoFactorSetup] Starting 2FA initialization');
            setIsLoading(true);
            
            // Log the token being used
            const token = localStorage.getItem('auth_token');
            console.log('[TwoFactorSetup] Auth token present:', !!token);
            
            console.log('[TwoFactorSetup] Making API request to /api/auth/2fa/initialize');
            const data = await authApi.post<TwoFactorInitResponse>('/api/auth/2fa/initialize');
            console.log('[TwoFactorSetup] API request successful, received data:', data);
            
            setSetupData(data);
            setStep('qr');
        } catch (error) {
            console.error('[TwoFactorSetup] Error initializing 2FA:', error);
            const apiError = error as APIResponseError | APIError;
            toast({
                title: "Error",
                description: apiError.message || "Failed to initialize two-factor authentication",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast({
                title: "Invalid Code",
                description: "Please enter a valid 6-digit verification code",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsLoading(true);
            await authApi.post<{ message: string }>('/api/auth/2fa/enable', {
                token: verificationCode
            });
            
            toast({
                title: "Success",
                description: "Two-factor authentication has been enabled"
            });
            onSetupComplete();
        } catch (error) {
            const apiError = error as APIResponseError | APIError;
            toast({
                title: "Error",
                description: apiError.message || "Invalid verification code. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
            {step === 'intro' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Set Up Two-Factor Authentication</h2>
                    <p className="text-gray-600">
                        Two-factor authentication adds an extra layer of security to your account.
                        You&apos;ll need an authenticator app like Google Authenticator or Authy.
                    </p>
                    <div className="flex gap-4">
                        <ButtonWithLoading onClick={handleInitialize} loading={isLoading}>
                            Get Started
                        </ButtonWithLoading>
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {step === 'qr' && setupData?.qrCodeUrl && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Scan QR Code</h2>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <Image
                                src={setupData.qrCodeUrl}
                                alt="2FA QR Code"
                                width={200}
                                height={200}
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>Can&apos;t scan the QR code? Enter this code manually:</p>
                            <code className="block bg-gray-100 p-2 rounded mt-2 text-center">
                                {setupData.secret}
                            </code>
                        </div>
                        <div className="w-full max-w-xs space-y-4">
                            <div>
                                <div id="verificationCode-label" className="mb-2 text-sm font-medium leading-none">
                                    Verification Code
                                </div>
                                <Input
                                    id="verificationCode"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    aria-labelledby="verificationCode-label"
                                    placeholder="Enter 6-digit code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                />
                            </div>
                            <ButtonWithLoading 
                                className="w-full" 
                                onClick={() => setStep('verify')}
                                disabled={verificationCode.length !== 6}
                                loading={false}
                            >
                                Next
                            </ButtonWithLoading>
                        </div>
                    </div>
                </div>
            )}

            {step === 'verify' && setupData?.backupCodes && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Save Backup Codes</h2>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Save these backup codes in a secure place. You can use them to access your
                            account if you lose access to your authenticator app.
                        </p>
                        <div className="bg-gray-100 p-4 rounded">
                            <div className="grid grid-cols-2 gap-2">
                                {setupData.backupCodes.map((code, index) => (
                                    <code key={index} className="font-mono">
                                        {code}
                                    </code>
                                ))}
                            </div>
                        </div>
                        <ButtonWithLoading 
                            className="w-full" 
                            onClick={handleVerify}
                            loading={isLoading}
                        >
                            Enable Two-Factor Authentication
                        </ButtonWithLoading>
                    </div>
                </div>
            )}
        </div>
    );
}