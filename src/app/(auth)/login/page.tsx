"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Scissors, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/validations/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@pos.local", password: "Admin@123456" },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#17251F] via-[#1E3328] to-[#245C43] p-4">
      <Card className="w-full max-w-md border border-white/10 bg-white/95 backdrop-blur-xl shadow-2xl dark:bg-[#17251F]/95 dark:border-[#2A4437]">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#245C43] text-white shadow-lg shadow-[#245C43]/40">
            <Scissors className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-[#17251F] dark:text-[#F4F6F2]">
            Fabric<span className="text-[#3D8964]">POS</span>
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 font-medium">
            Pakistani Men&apos;s Unstitched Clothing &amp; Retail POS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-[#245C43] hover:bg-[#1E4D37] text-white font-bold h-11 shadow-md shadow-[#245C43]/30"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to POS Counter"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-zinc-500">
            Default credentials prefilled for testing
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
