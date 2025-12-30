"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import NavSidebar from "./nav-sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-[#1a1a1a] bg-[#0f0f0f]/95 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <div className="flex h-8 items-center">
            <img
              src="/Logo.png"
              alt="FortuneMarq"
              className="h-8 w-auto object-contain"
            />
          </div>
          <span className="font-semibold text-white">FortuneMarq</span>
        </div>
      </header>

      {/* Sidebar */}
      <NavSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
