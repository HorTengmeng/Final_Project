"use client";

import { useRouter, usePathname } from "next/navigation";
import { removeToken } from "@/lib/auth";
import {
  LayoutDashboard,
  FileText,
  Shield,
  AlertCircle,
  CreditCard,
  LogOut,
  ChevronRight,
  Users,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
    {
    label: "Users",        // ← ADD
    href: "/admin/users",  // ← ADD
    icon: Users,           // ← ADD
  },
  {
    label: "Plans",
    href: "/admin/plans",
    icon: FileText,
  },
  {
    label: "Policies",
    href: "/admin/policies",
    icon: Shield,
  },
  {
    label: "Claims",
    href: "/admin/claims",
    icon: AlertCircle,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    removeToken();
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900
      flex flex-col fixed left-0 top-0 z-50">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg
            flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">
              InsureMe
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3
                rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3
            rounded-lg text-sm font-medium text-slate-400
            hover:bg-slate-800 hover:text-white transition-all">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}