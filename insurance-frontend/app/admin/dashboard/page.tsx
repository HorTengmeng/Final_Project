"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken, removeToken } from "@/lib/auth";
import { AdminStats,Policy,Claim,Payment } from "@/app/types";


import DataTable from "@/components/shared/datatable";
import StatCard from "@/components/shared/statcard";
import StatusBadge from "@/components/shared/statusbadge";
import Navbar from "@/components/shared/navbar";

// shadcn
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Icons
import {
  Users,
  FileText,
  AlertCircle,
  CreditCard,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const payload = decodeToken(token);
    if (!payload || payload.role !== "ADMIN") {
      router.push("/user/dashboard");
      return;
    }

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

  // ================================
  // Table Column Definitions
  // ================================
  const policyColumns = [
    { key: "userFullName", label: "User" },
    { key: "planName", label: "Plan" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  const claimColumns = [
    { key: "userFullName", label: "User" },
    { key: "planName", label: "Plan" },
    {
      key: "amountRequested",
      label: "Amount",
      render: (value: number) => `$${value}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  const paymentColumns = [
    { key: "userFullName", label: "User" },
    { key: "planName", label: "Plan" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `$${value}`,
    },
    { key: "monthYear", label: "Month" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <Navbar
        title="Admin Dashboard"
        subtitle="Insurance Management System"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* ================================ */}
        {/* STAT CARDS                       */}
        {/* ================================ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* ================================ */}
        {/* RECENT POLICIES                  */}
        {/* ================================ */}
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

        {/* ================================ */}
        {/* RECENT CLAIMS                    */}
        {/* ================================ */}
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

        {/* ================================ */}
        {/* RECENT PAYMENTS                  */}
        {/* ================================ */}
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

      </main>
    </div>
  );
}