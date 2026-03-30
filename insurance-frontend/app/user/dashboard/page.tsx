"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import { Policy,Claim,Payment,Plan } from "@/app/types";


import DataTable from "@/components/shared/datatable";
import StatCard from "@/components/shared/statcard";
import StatusBadge from "@/components/shared/statusbadge";
import Navbar from "@/components/shared/navbar";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";


import {
  Shield,
  AlertCircle,
  CreditCard,
  ArrowRight,
  History,
  Activity,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

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

    setUserName(payload.sub);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [policiesRes, claimsRes, paymentsRes, plansRes] =
        await Promise.all([
          api.get("/api/policies/my"),
          api.get("/api/claims/my"),
          api.get("/api/payments/my"),
          api.get("/api/plans/active"),
        ]);

      setPolicies(policiesRes.data);
      setClaims(claimsRes.data);
      setPayments(paymentsRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activePolicies = policies.filter((p) => p.status === "ACTIVE");
  const pendingClaims = claims.filter((c) => c.status === "PENDING");
  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-10 h-10 animate-spin
            text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar
        title="Insurance Portal"
        subtitle={`Hello, ${userName}`}
      />

      <main className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* ================================ */}
        {/* SECTION 1: WELCOME + STAT CARDS  */}
        {/* ================================ */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Welcome Card */}
          <div className="flex-1 bg-blue-600 rounded-2xl p-8
            text-white flex flex-col justify-between
            shadow-lg shadow-blue-200">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back!
              </h1>
              <p className="opacity-80 max-w-md">
                You have {activePolicies.length} active insurance
                policies. Stay protected every day.
              </p>
            </div>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Button
                variant="secondary"
                onClick={() => router.push("/user/plans")}>
                Explore Plans
              </Button>
              <Button
                className="bg-white/20 hover:bg-white/30 border-none"
                onClick={() => router.push("/user/claims/new")}>
                File a Claim
              </Button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4
            w-full lg:w-[400px]">
            <StatCard
              title="Active Policies"
              value={activePolicies.length}
              icon={Shield}
              iconColor="text-blue-500"
            />
            <StatCard
              title="Open Claims"
              value={pendingClaims.length}
              icon={AlertCircle}
              iconColor="text-orange-500"
            />
            <StatCard
              title="Total Paid"
              value={`$${totalPaid}`}
              icon={CreditCard}
              iconColor="text-emerald-500"
            />
            <StatCard
              title="Total Policies"
              value={policies.length} // ← fixed
              icon={History}
              iconColor="text-purple-500"
            />
          </div>
        </div>

        {/* ================================ */}
        {/* SECTION 2: AVAILABLE PLANS       */}
        {/* ================================ */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Recommended for You
              </h2>
              <p className="text-slate-500 text-sm">
                Protection tailored to your needs
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => router.push("/user/plans")}>
              View all plans
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {plans.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No plans available
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.slice(0, 3).map((plan) => (
                <Card
                  key={plan.id}
                  className="group border-none shadow-md
                    hover:shadow-xl transition-all duration-300
                    overflow-hidden">
                  <div className="h-2 bg-blue-500" />
                  <CardHeader>
                    <div className="flex justify-between
                      items-start">
                      <CardTitle className="text-xl
                        group-hover:text-blue-600
                        transition-colors">
                        {plan.name}
                      </CardTitle>
                      <span className="bg-blue-50 text-blue-700
                        text-[10px] uppercase tracking-wider
                        font-bold px-2 py-1 rounded">
                        {plan.type}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold
                        text-slate-900">
                        ${plan.monthlyPremium}
                      </span>
                      <span className="text-slate-500 text-sm">
                        / month
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm
                      text-gray-500">
                      <div className="flex justify-between">
                        <span>Coverage</span>
                        <span className="font-medium text-gray-700">
                          ${plan.coverageAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span className="font-medium text-gray-700">
                          {plan.durationMonths} months
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50
                    border-t p-4">
                    <Button
                      className="w-full bg-slate-900
                        hover:bg-blue-600 transition-colors"
                      onClick={() =>
                        router.push(
                          `/user/plans/${plan.id}/apply`
                        )
                      }>
                      Apply Coverage
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ================================ */}
        {/* SECTION 3: ACTIVITY TABS         */}
        {/* ================================ */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
            <CardDescription>
              Track your policies, claims and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="policies" className="w-full">
              <TabsList className="grid w-full grid-cols-3
                mb-6 bg-slate-100 p-1">
                <TabsTrigger value="policies">
                  My Policies
                </TabsTrigger>
                <TabsTrigger value="claims">
                  My Claims
                </TabsTrigger>
                <TabsTrigger value="payments">
                  Payments
                </TabsTrigger>
              </TabsList>

              {/* Policies Tab */}
              <TabsContent value="policies">
                <DataTable
                  columns={[
                    { key: "planName", label: "Plan" },
                    { key: "planType", label: "Type" },
                    { key: "startDate", label: "Start" },
                    { key: "endDate", label: "Renewal" },
                    {
                      key: "status",
                      label: "Status",
                      render: (v: string) => (
                        <StatusBadge status={v} />
                      ),
                    },
                  ]}
                  data={policies.slice(0, 5)}
                  emptyMessage="No policies yet. Apply for a plan above!"
                />
              </TabsContent>

              {/* Claims Tab */}
              <TabsContent value="claims">
                <DataTable
                  columns={[
                    { key: "planName", label: "Plan" },
                    { key: "reason", label: "Reason" },
                    {
                      key: "amountRequested",
                      label: "Amount",
                      render: (v: number) => `$${v}`,
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (v: string) => (
                        <StatusBadge status={v} />
                      ),
                    },
                  ]}
                  data={claims.slice(0, 5)}
                  emptyMessage="No claims filed yet."
                />
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments">
                <DataTable
                  columns={[
                    { key: "planName", label: "Plan" },
                    {
                      key: "amount",
                      label: "Amount",
                      render: (v: number) => `$${v}`,
                    },
                    { key: "monthYear", label: "Month" },
                    { key: "paymentDate", label: "Date" },
                    {
                      key: "status",
                      label: "Status",
                      render: (v: string) => (
                        <StatusBadge status={v} />
                      ),
                    },
                  ]}
                  data={payments.slice(0, 5)}
                  emptyMessage="No payments made yet."
                />
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}