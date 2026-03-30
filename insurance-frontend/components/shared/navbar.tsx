// Top navigation bar - reused in all dashboard pages

"use client";

import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/auth/login");
  };

  return (
    <header className="bg-white border-b px-6 py-4
      flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </header>
  );
}