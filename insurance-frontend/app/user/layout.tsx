"use client";

// import UserSidebar from "@/components/shared/UserSidebar";
import UserSidebar from "@/components/shared/Usersidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}