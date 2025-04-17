// frontend/src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address. check email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Basic check
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { setUserAndToken } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log("Login Attempt:", values);

    try {
         const response = await fetch('http://localhost:3002/api/auth/login', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify(values),
         });
         
         const data = await response.json();

         if (!response.ok) {
           console.error("Login failed:", data);
           toast({ 
             title: "Login Failed", 
             description: data.error || "Invalid credentials. Please try again.", 
             variant: "destructive" 
           });
         } else {
             console.log("Login successful:", data);
             toast({ title: "Login Successful!", description: "Welcome back!" });

             // --- Use the store action ---
             if (data.user && data.token) {
                setUserAndToken(data.user, data.token); // <-- Update global state
                console.log("Auth state updated, redirecting to dashboard");
                router.push('/dashboard');
             } else {
                 console.error("Login response missing user or token:", data);
                 // Handle this potential error case
                 toast({ title: "Login Error", description: "Received invalid data from server.", variant: "destructive" });
                 setIsLoading(false);
                 return;
             }
         }
    } catch (error) {
      console.error("Network or unexpected error:", error);
      toast({ 
        title: "Error", 
        description: "Could not connect to the server. Please check your connection.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
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
                      <div className="mb-1.5 text-sm font-medium text-gray-700">Email</div>
                      <FormControl>
                        <Input 
                          placeholder="name@example.com" 
                          {...field} 
                          className="bg-white border-gray-300 focus:border-brand-orange focus:ring-brand-orange/20 h-10 sm:h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs sm:text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-1.5 text-sm font-medium text-gray-700">Password</div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field}
                          className="bg-white border-gray-300 focus:border-brand-orange focus:ring-brand-orange/20 h-10 sm:h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs sm:text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium h-10 sm:h-11 text-base mt-2" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-orange hover:underline font-medium">
                Sign up
              </Link>
            </div>
            <Link href="/" className="text-xs sm:text-sm text-center text-gray-500 hover:text-gray-700 hover:underline">
              Back to home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}