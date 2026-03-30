// app/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, decodeToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in → redirect to dashboard
    const token = getToken();
    if (token) {
      const payload = decodeToken(token);
      if (payload?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (payload?.role === "USER") {
        router.push("/user/dashboard");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col
      items-center justify-center text-center px-6">

      <Shield className="w-16 h-16 text-blue-600 mb-6" />

      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Welcome to InsureMe
      </h1>

      <p className="text-xl text-gray-500 mb-8 max-w-xl">
        Protect what matters most. Simple, affordable
        and reliable insurance coverage.
      </p>

      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={() => router.push("/auth/login")}>
          Sign In
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push("/auth/register")}>
          Get Started
        </Button>
      </div>
    </div>
  );
}