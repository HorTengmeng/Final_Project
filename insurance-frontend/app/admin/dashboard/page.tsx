"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";

import { AdminStats,Policy,Claim,Payment } from "@/app/types";
import StatCard from "@/components/shared/statcard";
import StatusBadge from "@/components/shared/statusbadge";
import DataTable from "@/components/shared/datatable";

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, FileText, AlertCircle,
  CreditCard, Activity,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    const payload = decodeToken(token);
    if (!payload || payload.role !== "ADMIN") {
      router.push("/auth/login"); return;
    }
    setAdminName(payload.sub);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [statsRes, policiesRes, claimsRes, paymentsRes] =
        await Promise.all([
          api.get("/api/dashboard/admin/stats"),
          api.get("/api/policies"),
          api.get("/api/claims"),
          api.get("/api/payments"),
        ]);
      setStats(statsRes.data);
      setPolicies(policiesRes.data.slice(0, 5));
      setClaims(claimsRes.data.slice(0, 5));
      setPayments(paymentsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const policyColumns = [
    { key: "userFullName", label: "User" },
    { key: "planName", label: "Plan" },
    { key: "startDate", label: "Start" },
    { key: "endDate", label: "End" },
    {
      key: "status", label: "Status",
      render: (v: string) => <StatusBadge status={v} />,
    },
  ];

  const claimColumns = [
    { key: "userFullName", label: "User" },
    { key: "planName", label: "Plan" },
    {
      key: "amountRequested", label: "Amount",
      render: (v: number) => `$${v}`,
    },
    {
      key: "status", label: "Status",
      render: (v: string) => <StatusBadge status={v} />,
    },
  ];

  const paymentColumns = [
    { key: "userFullName", label: "User" },
    { key: "planName", label: "Plan" },
    {
      key: "amount", label: "Amount",
      render: (v: number) => `$${v}`,
    },
    { key: "monthYear", label: "Month" },
    {
      key: "status", label: "Status",
      render: (v: string) => <StatusBadge status={v} />,
    },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Activity className="w-10 h-10 animate-spin
          text-blue-500 mx-auto mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {adminName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Total Policies"
          value={stats?.totalPolicies ?? 0}
          icon={FileText}
          iconColor="text-green-500"
        />
        <StatCard
          title="Total Claims"
          value={stats?.totalClaims ?? 0}
          icon={AlertCircle}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Total Payments"
          value={stats?.totalPayments ?? 0}
          icon={CreditCard}
          iconColor="text-purple-500"
        />
      </div>

      {/* Recent Policies */}
      <Card>
        <CardHeader className="flex flex-row items-center
          justify-between">
          <CardTitle>Recent Policies</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/policies")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={policyColumns}
            data={policies}
            emptyMessage="No policies found"
          />
        </CardContent>
      </Card>

      {/* Recent Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center
          justify-between">
          <CardTitle>Recent Claims</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/claims")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={claimColumns}
            data={claims}
            emptyMessage="No claims found"
          />
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center
          justify-between">
          <CardTitle>Recent Payments</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/payments")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={paymentColumns}
            data={payments}
            emptyMessage="No payments found"
          />
        </CardContent>
      </Card>

    </div>
  );
}