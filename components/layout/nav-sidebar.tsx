"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Phone,
  Target,
  FolderKanban,
  ListTodo,
  X,
  BarChart3,
} from "lucide-react";
import clsx from "clsx";

interface NavSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/admin/upload", label: "Upload Leads", icon: Upload },
  { href: "/sales", label: "Sales", icon: Phone },
  { href: "/strategist", label: "Strategist", icon: Target },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "My Tasks", icon: ListTodo },
];

export default function NavSidebar({ isOpen, onClose }: NavSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 h-full w-64 transform bg-[#0f0f0f] border-r border-[#1a1a1a] transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#1a1a1a] px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#42CA80]">
              <span className="text-sm font-bold text-black">FM</span>
            </div>
            <span className="font-semibold text-white">Agency OS</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#42CA80]/10 text-[#42CA80]"
                        : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#1a1a1a] p-4">
          <p className="text-xs text-[#666]">FortuneMarq Agency OS v1.0</p>
        </div>
      </aside>
    </>
  );
}


