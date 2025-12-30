"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import clsx from "clsx";
import {
  LayoutDashboard,
  Phone,
  Target,
  FolderKanban,
  Users,
  ListTodo,
  LogOut,
  Menu,
  X,
  Loader2,
  DollarSign,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_CONFIG: Record<string, NavItem[]> = {
  admin: [
    { label: "Command Hub", href: "/admin", icon: LayoutDashboard },
    { label: "Sales Force", href: "/admin/sales", icon: Phone },
    { label: "Strategy Engine", href: "/admin/strategy", icon: Target },
    { label: "Financials", href: "/admin/financials", icon: DollarSign },
    { label: "Operations", href: "/admin/operations", icon: Settings },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Staff Tasks", href: "/staff", icon: Users },
  ],
  telecaller: [
    { label: "Sales Cockpit", href: "/sales", icon: Phone },
  ],
  strategist: [
    { label: "Strategy Board", href: "/strategist", icon: Target },
  ],
  pm: [
    { label: "Project Dashboard", href: "/projects", icon: FolderKanban },
  ],
  staff: [
    { label: "My Tasks", href: "/staff", icon: ListTodo },
  ],
  client: [
    { label: "My Project", href: "/client/dashboard", icon: FolderKanban },
  ],
};

export default function AppSidebar() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Try to get role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, email")
          .eq("id", user.id)
          .single();

        let userRole = (profile as any)?.role;
        let name = (profile as any)?.full_name || "User";
        let email = (profile as any)?.email || user.email || "";

        // If no role found in profiles, check if user is a client
        if (!userRole && user.email) {
          const { data: client } = await supabase
            .from("clients")
            .select("id, business_name, primary_email")
            .eq("primary_email", user.email)
            .single();
          
          if (client) {
            userRole = "client";
            name = (client as any).business_name || "Client";
            email = (client as any).primary_email || user.email;
          }
        }

        setRole(userRole || "staff");
        setUserName(name);
        setUserEmail(email);
      } catch (error) {
        console.error("Error fetching role:", error);
        setRole("staff");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = role ? NAV_CONFIG[role] || NAV_CONFIG.staff : [];

  const isActiveLink = (href: string) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href !== "/admin" && pathname.startsWith(href)) return true;
    return false;
  };

  // Mobile Header Component
  const MobileHeader = () => (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur-sm md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 items-center">
          <img
            src="/Logo.png"
            alt="FortuneMarq"
            className="h-8 w-auto object-contain"
          />
        </div>
        <span className="text-base font-bold text-white">
          FortuneMarq
        </span>
      </Link>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );

  // Sidebar Content Component
  const SidebarContent = () => (
    <>
      {/* Sidebar Header / Logo */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 items-center">
            <img
              src="/Logo.png"
              alt="FortuneMarq"
              className="h-10 w-auto object-contain"
            />
          </div>
          <span className="text-lg font-bold text-white">
            FortuneMarq
          </span>
        </Link>
        {/* Close button - Mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#42CA80]" />
          </div>
        ) : (
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-[#42CA80]/10 text-[#42CA80]"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? "text-[#42CA80]" : "text-zinc-500 group-hover:text-white"
                      )}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-[#42CA80]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="border-t border-zinc-800 p-4">
        {/* User Profile Snippet */}
        <div className="mb-3 rounded-xl bg-zinc-800/50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 text-sm font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="truncate text-xs text-zinc-500">{userEmail}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-md bg-[#42CA80]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#42CA80]">
              {role}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-zinc-950 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:border-r md:border-zinc-800",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
