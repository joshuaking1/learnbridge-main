"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from '@/stores/useAuthStore';
import { ButtonWithLoading } from "@/components/ui/button-with-loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { TwoFactorVerify } from '@/components/auth/TwoFactorVerify';
import { authApi } from '@/lib/auth-api';
import { LoginResponse, TwoFactorVerifyResponse } from '@/types/shared';
import { normalizeUser, handleAuthError } from '@/lib/auth-helpers';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { setUserAndToken } = useAuthStore();
  const [twoFactorData, setTwoFactorData] = useState<{
    tempToken: string;
    email: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await authApi.post<LoginResponse>('/api/auth/login', values);

      if (response.requires2FA && response.tempToken) {
        setTwoFactorData({
          tempToken: response.tempToken,
          email: response.user?.email || values.email,
        });
      } else if (response.token && response.user) {
        const normalizedUser = normalizeUser(response.user);
        setUserAndToken(normalizedUser, response.token);
        toast({ 
          title: "Login Successful!", 
          description: "Welcome back!" 
        });
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: handleAuthError(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleTwoFactorSuccess = (verifyResponse: TwoFactorVerifyResponse) => {
    const normalizedUser = normalizeUser(verifyResponse.user);
    setUserAndToken(normalizedUser, verifyResponse.token);
    toast({ 
      title: "Success", 
      description: "Successfully verified and logged in" 
    });
    router.push('/dashboard');
  };

  if (twoFactorData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:p-4 bg-gradient-to-br from-brand-darkblue to-brand-midblue">
        <TwoFactorVerify
          tempToken={twoFactorData.tempToken}
          email={twoFactorData.email}
          onSuccess={handleTwoFactorSuccess}
          onCancel={() => setTwoFactorData(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:p-4 bg-gradient-to-br from-brand-darkblue to-brand-midblue">
      <div className="w-full max-w-md mx-auto">
        <Card className="border-none shadow-lg bg-white/95 backdrop-blur-sm w-full">
          <CardHeader className="space-y-2 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-arvo font-bold text-center text-gray-800">Welcome back</CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm sm:text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Enter your password" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <ButtonWithLoading
                    type="submit"
                    className="w-full"
                    loading={isLoading}
                  >
                    Log In
                  </ButtonWithLoading>
                  
                  <div className="text-center">
                    <Button variant="link" asChild className="text-sm text-gray-600 hover:text-gray-900">
                      <Link href="/forgot-password">
                        Forgot your password?
                      </Link>
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}