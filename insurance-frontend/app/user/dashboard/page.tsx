"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import { Policy, Claim, Payment, Plan } from "@/app/types";

import DataTable from "@/components/shared/datatable";
import Navbar from "@/components/shared/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Sparkles, Zap, ArrowRight, Activity, CheckCircle2 } from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    const payload = decodeToken(token);
    if (!payload || payload.role !== "USER") { router.push("/auth/login"); return; }

    setUserName(payload.sub);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [policiesRes, plansRes] = await Promise.all([
        api.get("/api/policies/my"),
        api.get("/api/plans/active"),
      ]);
      setPolicies(policiesRes.data);
      setPlans(plansRes.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Activity className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar title="Insurance Marketplace" subtitle={`Account: ${userName}`} />

      <main className="p-6 space-y-10 max-w-7xl mx-auto">
        
        {/* 1. SALES HERO: Focused on "Upgrading" or "Starting" */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-500/30">
              <Sparkles className="w-3 h-3" /> NEW PLANS AVAILABLE
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Secure your future <br/> in minutes.
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Based on your profile, you are currently eligible for enhanced {plans[0]?.type.toLowerCase()} coverage with 0% processing fees.
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8" onClick={() => router.push("/user/plans")}>
              Explore Marketplace <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent hidden lg:block" />
        </div>

        {/* 2. TRENDING/FEATURED PLANS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-500 fill-orange-500" /> Featured for You
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.slice(0, 3).map((plan) => (
              <Card key={plan.id} className="relative border-none shadow-sm hover:shadow-2xl transition-all duration-500 group rounded-2xl overflow-hidden bg-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {plan.type}
                    </span>
                    {plan.monthlyPremium < 100 && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        Best Value
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-500 line-clamp-2">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="py-4 border-y border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 uppercase font-bold">Starts at</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">${plan.monthlyPremium}</span>
                      <span className="text-slate-400 font-medium">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ${plan.coverageAmount.toLocaleString()} Coverage
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {plan.durationMonths} Months Duration
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="p-0 mt-2">
                  <Button className="w-full h-14 rounded-none bg-slate-900 hover:bg-blue-600 transition-all font-bold text-lg" 
                          onClick={() => router.push(`/user/plans/${plan.id}/apply`)}>
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. SECONDARY ACTIVITY: Less prominent, more compact */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold">Manage Your Protection</h3>
            <p className="text-slate-500 text-sm">Review your active policies and claims status.</p>
          </div>
          <Tabs defaultValue="policies" className="w-full">
            <TabsList className="bg-slate-50 p-1 rounded-xl mb-6">
              <TabsTrigger value="policies" className="rounded-lg px-6">My Policies ({policies.length})</TabsTrigger>
              <TabsTrigger value="claims" className="rounded-lg px-6">Active Claims</TabsTrigger>
            </TabsList>
            <TabsContent value="policies">
               {/* Use a more compact table style here */}
               <DataTable
                  columns={[
                    { key: "planName", label: "Plan" },
                    { key: "status", label: "Status" },
                    { key: "endDate", label: "Expires" },
                  ]}
                  data={policies}
                  emptyMessage="No active coverage. Select a plan above to begin."
                />
            </TabsContent>
          </Tabs>
        </section>

      </main>
    </div>
  );
}