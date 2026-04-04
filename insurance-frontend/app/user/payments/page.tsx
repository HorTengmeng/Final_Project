"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import { Payment } from "@/app/types";
import StatusBadge from "@/components/shared/statusbadge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PlusCircle, CreditCard, Loader2 } from "lucide-react";

export default function MyPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
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
    fetchPayments();
  }, [router]);

  const fetchPayments = async () => {
    try {
      // Ensure this endpoint exists on your Spring Boot/Express backend
      const res = await api.get("/api/payments/my");
      setPayments(res.data || []);
    } catch (err) {
      console.error("Payment fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Safe summation of total paid amount
  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-gray-500 font-medium">Loading your payments...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            My Payments
          </h1>
          <p className="text-gray-500 mt-1">
            Track your protection and payment history
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push("/user/payments/new")}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-500">Total Paid</p>
            <p className="text-3xl font-bold text-green-600">
              ${totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-500">Pending Payments</p>
            <p className="text-3xl font-bold text-yellow-600">
              {payments.filter((p) => p.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
            <p className="text-3xl font-bold text-slate-900">
              {payments.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <CreditCard className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">No payments found in your history.</p>
              <Button
                variant="outline"
                onClick={() => router.push("/user/payments/new")}>
                Make First Payment
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold">Plan</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Month</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Receipt</TableHead>
                  <TableHead className="font-semibold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      {payment.planName}
                    </TableCell>
                    <TableCell className="font-semibold">${payment.amount}</TableCell>
                    <TableCell className="text-slate-600">{payment.monthYear}</TableCell>
                    <TableCell className="text-slate-600">{payment.paymentDate}</TableCell>
                    <TableCell>
                      {payment.receiptUrl ? (
                        <a
                          href={`http://localhost:8080${payment.receiptUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}