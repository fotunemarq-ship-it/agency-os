"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import clsx from "clsx";
import FortuneMarqLogo from "@/components/ui/fortune-marq-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Get user role and redirect to appropriate dashboard
  const redirectBasedOnRole = useCallback(async (userId: string) => {
    try {
      // First, try to get role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      let role = (profile as any)?.role;

      // If no role found in profiles, check if user is a client
      if (!role) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const { data: client } = await supabase
            .from("clients")
            .select("id")
            .eq("primary_email", user.email)
            .single();
          
          if (client) {
            role = "client";
          }
        }
      }

      // Default to staff if no role found
      if (!role) {
        role = "staff";
      }

      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        telecaller: "/sales",
        strategist: "/strategist",
        pm: "/projects",
        staff: "/staff",
        client: "/client/dashboard",
      };

      const redirectPath = roleRoutes[role] || "/staff";
      router.push(redirectPath);
    } catch (err) {
      console.error("Role fetch error:", err);
      router.push("/staff");
    }
  }, [supabase, router]);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // User is already logged in, redirect based on role
          await redirectBasedOnRole(user.id);
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [supabase, redirectBasedOnRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        await redirectBasedOnRole(data.user.id);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#42CA80]" />
          <p className="text-sm text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#42CA80]/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-[#42CA80]/10 blur-[120px]" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Card glow effect */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-[#42CA80]/20 to-transparent blur-xl" />
        
        <div className="relative rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f]/90 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          {/* Logo & Branding */}
          <div className="mb-8 flex flex-col items-center text-center">
            <FortuneMarqLogo size="lg" showText={false} />
            <p className="mt-4 text-sm text-[#666]">
              Sign in to your workspace
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#a1a1aa]"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-[#666]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] py-3.5 pl-12 pr-4 text-white placeholder-[#444] transition-all focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#a1a1aa]"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-[#666]" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] py-3.5 pl-12 pr-4 text-white placeholder-[#444] transition-all focus:border-[#42CA80]/50 focus:outline-none focus:ring-2 focus:ring-[#42CA80]/20"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all",
                isLoading
                  ? "cursor-not-allowed bg-[#42CA80]/50 text-white/70"
                  : "bg-[#42CA80] text-black hover:bg-[#3ab872] hover:shadow-lg hover:shadow-[#42CA80]/25 active:scale-[0.98]"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-[#1a1a1a] pt-6 text-center">
            <p className="text-xs text-[#666]">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>

        {/* Bottom text */}
        <p className="mt-6 text-center text-xs text-[#444]">
          © {new Date().getFullYear()} FortuneMarq. All rights reserved.
        </p>
      </div>
    </div>
  );
}

