"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { ButtonWithLoading } from "@/components/ui/button-with-loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { authApi } from "@/lib/auth-api";
import { handleAuthError } from "@/lib/auth-helpers";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

// Wrap the component that uses useSearchParams in Suspense
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  // Get token from URL
  const token = searchParams?.get("token");

  // Redirect if no token is present
  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormData) {
    if (!token) return;

    setIsLoading(true);

    try {
      const response = await authApi.post<{ message: string }>(
        "/api/auth/reset-password",
        {
          token,
          newPassword: values.password,
        }
      );

      setResetComplete(true);
      toast({
        title: "Success",
        description:
          response.message || "Your password has been reset successfully.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: handleAuthError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (resetComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:p-4 bg-gradient-to-br from-brand-darkblue to-brand-midblue">
        <Card className="w-full max-w-md border-none shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 p-6">
            <CardTitle className="text-xl font-bold text-center">
              Password Reset Complete
            </CardTitle>
            <CardDescription className="text-center">
              Your password has been reset successfully. You can now log in with
              your new password.
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-6">
            <Button className="w-full" asChild>
              <Link href="/login">Return to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:p-4 bg-gradient-to-br from-brand-darkblue to-brand-midblue">
      <Card className="w-full max-w-md border-none shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-2 p-6">
          <CardTitle className="text-xl font-bold text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="New password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ButtonWithLoading
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                Reset Password
              </ButtonWithLoading>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Export the main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
