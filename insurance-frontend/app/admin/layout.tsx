"use client";

import Sidebar from "@/components/shared/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* Main content pushed right of sidebar */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}