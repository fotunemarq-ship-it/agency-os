"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Loader2, Zap } from "lucide-react";

export default function Home() {
  const [status, setStatus] = useState("Initializing...");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        setStatus("Checking authentication...");
        
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Not logged in, redirect to login
          setStatus("Redirecting to login...");
          router.replace("/login");
          return;
        }

        // User is logged in, get their role
        setStatus("Loading your dashboard...");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        let role = profile?.role;

        // If no role found in profiles, check if user is a client
        if (!role && user.email) {
          const { data: client } = await supabase
            .from("clients")
            .select("id")
            .eq("primary_email", user.email)
            .single();
          
          if (client) {
            role = "client";
          }
        }

        // Default to staff if no role found
        if (!role) {
          role = "staff";
        }

        // Role-based redirect
        const roleRoutes: Record<string, string> = {
          admin: "/admin",
          telecaller: "/sales",
          strategist: "/admin/strategy",
          pm: "/projects",
          staff: "/staff",
          client: "/client/dashboard",
        };

        const redirectPath = roleRoutes[role] || "/staff";
        router.replace(redirectPath);
      } catch (error) {
        console.error("Auth check error:", error);
        // On error, redirect to login
        router.replace("/login");
      }
    };

    checkAuthAndRedirect();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#42CA80]/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-[#42CA80]/5 blur-[120px]" />
      </div>

      {/* Loading Content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#42CA80] to-emerald-600 shadow-lg shadow-[#42CA80]/25">
          <Zap className="h-8 w-8 text-white" />
        </div>

        {/* Brand */}
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Agency <span className="text-[#42CA80]">OS</span>
        </h1>

        {/* Loading Spinner */}
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#42CA80]" />
          <p className="text-sm text-[#666]">{status}</p>
        </div>
      </div>
    </div>
  );
}
