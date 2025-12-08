"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "./app-sidebar";

// Routes that should NOT show the sidebar (public routes)
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Check if current route is a public route or the root redirect page
  const isPublicRoute =
    pathname === "/" ||
    PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  // For public routes, render children only (full screen)
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, render with sidebar
  return (
    <div className="flex min-h-screen bg-zinc-900">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 pt-14 md:pt-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
