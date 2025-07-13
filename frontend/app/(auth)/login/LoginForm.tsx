"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

import newRequest from "@/app/api/newRequest";
import { useAuth } from "@/lib/auth-context";

const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    try {
      // Create form data for FastAPI OAuth2 format
      const formData = new URLSearchParams();
      formData.append("username", values.email); // FastAPI uses "username" field
      formData.append("password", values.password);

      const response = await newRequest().post(
        "/auth/login",
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(response)

      // If login successful
      if (response.status === 200) {
        const token = response.data.access_token;
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name || "",
        };

        // Update auth context with token and user data
        login(token, userData);

        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // Handle error response
      form.setError("email", { message: "Invalid credentials" });
      form.setError("password", { message: "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate /* disable browser default messages */
      >
        {/* -------- Email -------- */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage /> {/* shows Zod error, if any */}
            </FormItem>
          )}
        />

        {/* -------- Password (+ eye toggle) -------- */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={show ? "text" : "password"}
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShow(!show)}
                  tabIndex={-1} /* don't steal focus */
                >
                  {show ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* -------- Forgot link -------- */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* -------- Submit -------- */}
        <Button className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </Form>
  );
}
