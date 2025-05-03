"use client";

import { useState } from "react";
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
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { authApi } from '@/lib/auth-api';
import { handleAuthError } from '@/lib/auth-helpers';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);

    try {
      const response = await authApi.post<{ message: string }>('/api/auth/forgot-password', values);
      
      setRequestSent(true);
      toast({
        title: "Email Sent",
        description: response.message || "If an account exists for this email, you will receive a password reset link.",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: handleAuthError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (requestSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:p-4 bg-gradient-to-br from-brand-darkblue to-brand-midblue">
        <Card className="w-full max-w-md border-none shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 p-6">
            <CardTitle className="text-xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We&apos;ve sent you instructions on how to reset your password. The link will expire in 1 hour.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <Button variant="outline" onClick={() => setRequestSent(false)}>
                Try another email
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/login">
                  Return to login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:p-4 bg-gradient-to-br from-brand-darkblue to-brand-midblue">
      <Card className="w-full max-w-md border-none shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-2 p-6">
          <CardTitle className="text-xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex flex-col gap-4">
                <ButtonWithLoading
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                >
                  Send Reset Link
                </ButtonWithLoading>
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    Back to login
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}