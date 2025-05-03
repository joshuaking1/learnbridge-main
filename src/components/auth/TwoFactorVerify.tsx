import { useState } from 'react';
import { ButtonWithLoading } from '@/components/ui/button-with-loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/auth-api';
import { TwoFactorVerifyResponse } from '@/types/shared';
import { handleAuthError } from '@/lib/auth-helpers';

interface TwoFactorVerifyProps {
    tempToken: string;
    email: string;
    onSuccess: (response: TwoFactorVerifyResponse) => void;
    onCancel: () => void;
}

export function TwoFactorVerify({ tempToken, email, onSuccess, onCancel }: TwoFactorVerifyProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
    const { toast } = useToast();

    const handleVerify = async () => {
        if (!verificationCode || 
            (!isUsingBackupCode && verificationCode.length !== 6) || 
            (isUsingBackupCode && verificationCode.length !== 10)) {
            toast({
                title: "Invalid Code",
                description: isUsingBackupCode 
                    ? "Please enter a valid backup code"
                    : "Please enter a valid 6-digit verification code",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsLoading(true);
            const endpoint = isUsingBackupCode 
                ? '/api/auth/2fa/backup-code/verify'
                : '/api/auth/2fa/verify';

            const response = await authApi.post<TwoFactorVerifyResponse>(endpoint, {
                tempToken,
                ...(isUsingBackupCode ? { backupCode: verificationCode } : { token: verificationCode })
            });

            toast({
                title: "Success",
                description: response.message || "Verification successful"
            });

            onSuccess(response);
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: handleAuthError(error),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setVerificationCode('');
        setIsUsingBackupCode(!isUsingBackupCode);
    };

    return (
        <div className="space-y-6 p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
                <p className="text-gray-600">
                    {isUsingBackupCode 
                        ? "Enter one of your backup codes to verify your identity."
                        : `Enter the verification code from your authenticator app for ${email}.`
                    }
                </p>

                <div className="space-y-4">
                    <div>
                        <div id="verification-input-label" className="mb-2 text-sm font-medium leading-none">
                            {isUsingBackupCode ? 'Backup Code' : 'Verification Code'}
                        </div>
                        <Input
                            id="verification-input"
                            type="text"
                            inputMode={isUsingBackupCode ? "text" : "numeric"}
                            pattern={isUsingBackupCode ? undefined : "\\d{6}"}
                            maxLength={isUsingBackupCode ? 10 : 6}
                            aria-labelledby="verification-input-label"
                            placeholder={isUsingBackupCode ? "Enter backup code" : "Enter 6-digit code"}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                            className="uppercase"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <ButtonWithLoading
                            className="w-full"
                            onClick={handleVerify}
                            loading={isLoading}
                        >
                            Verify
                        </ButtonWithLoading>

                        <Button
                            variant="link"
                            onClick={toggleMode}
                            disabled={isLoading}
                        >
                            {isUsingBackupCode 
                                ? "Use authenticator app instead"
                                : "Use a backup code instead"
                            }
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}