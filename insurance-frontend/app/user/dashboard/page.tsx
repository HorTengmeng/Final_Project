"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import { Policy, Plan } from "@/app/types";

import DataTable from "@/components/shared/datatable";
import Navbar from "@/components/shared/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Zap,
  ArrowRight,
  Activity,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserDashboard() {
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const payload = decodeToken(token);
    if (!payload || payload.role !== "USER") {
      router.push("/auth/login");
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [profileRes, policiesRes, plansRes] = await Promise.all([
        api.get("/api/users/me"),
        api.get("/api/policies/my"),
        api.get("/api/plans/active"),
      ]);

      setUserProfile(profileRes.data);
      setPolicies(policiesRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Activity className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  const initials = userProfile?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* DESIGN UPGRADE: The Navbar now includes a Profile Dropdown 
          This allows the user to access their profile from anywhere.
      */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-900">InsureMe</span>
            <span className="text-xs text-slate-500 font-medium">
              Marketplace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full bg-slate-100 p-0 overflow-hidden hover:bg-slate-200 transition-colors"
                >
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">
                      {userProfile?.fullName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/user/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/user/settings")}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <main className="p-6 space-y-10 max-w-7xl mx-auto">
        {/* 1. HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-500/30">
              <Sparkles className="w-3 h-3" /> WELCOME BACK
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Hello, {userProfile?.fullName?.split(" ")[0]}.
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Your security is our priority. You currently have{" "}
              {policies.length} active
              {policies.length === 1 ? " policy" : " policies"}.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl"
                onClick={() => router.push("/user/plans")}
              >
                Browse Plans <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white px-8 rounded-xl backdrop-blur-sm"
                onClick={() => router.push("/user/profile")}
              >
                View Profile
              </Button>
            </div>
          </div>
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        </div>

        {/* 2. TOP PICKS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-500 fill-orange-500" />{" "}
              Recommended for You
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.slice(0, 3).map((plan) => (
              <Card
                key={plan.id}
                className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group bg-white"
              >
                <CardHeader>
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                    {plan.type}
                  </span>
                  <CardTitle className="text-xl mt-2 group-hover:text-blue-600 transition-colors">
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900">
                    ${plan.monthlyPremium}
                    <span className="text-sm text-slate-400 font-normal">
                      /mo
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Coverage: ${plan.coverageAmount.toLocaleString()}
                  </p>
                </CardContent>
                <CardFooter className="p-0">
                  <Button
                    className="w-full h-12 rounded-none bg-slate-900 hover:bg-blue-600 transition-colors font-semibold"
                    // Change this:
                    onClick={() => router.push(`/user/plans/${plan.id}/apply`)}
                  >
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. POLICY MANAGEMENT */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <Tabs defaultValue="policies" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-slate-50 p-1 rounded-xl">
                <TabsTrigger
                  value="policies"
                  className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Active Policies ({policies.length})
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="policies" className="mt-0">
              <DataTable
                columns={[
                  { key: "planName", label: "Plan Name" },
                  { key: "status", label: "Status" },
                  { key: "endDate", label: "Expiry Date" },
                ]}
                data={policies}
                emptyMessage="No active protection yet. Secure your future by selecting a plan above."
              />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
