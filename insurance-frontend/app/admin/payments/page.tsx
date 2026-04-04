"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import DeleteButton from "@/components/shared/deletebutton";
import { Payment } from "@/app/types";
import Navbar from "@/components/shared/navbar";
import StatusBadge from "@/components/shared/statusbadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // Fix for Hydration
  const [selected, setSelected] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    setIsMounted(true); // Signal that we are now on the client
    const token = getToken();

    if (!token) {
      router.push("/auth/login");
      return;
    }

    const payload = decodeToken(token);
    if (!payload || payload.role !== "ADMIN") {
      router.push("/auth/login");
      return;
    }

    fetchPayments();
  }, [router]);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/api/payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (payment: Payment) => {
    setSelected(payment);
    setStatus(payment.status);
    setAdminNote(payment.adminNote || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/api/payments/${selected.id}/confirm`, {
        status,
        adminNote,
      });
      setDialogOpen(false);
      fetchPayments();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const filtered =
    filterStatus === "ALL"
      ? payments
      : payments.filter((p) => p.status === filterStatus);

  // Prevent hydration mismatch by not rendering UI until mounted
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Plans</h1>
        <p className="text-gray-500 mt-1">Create and manage insurance plans</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Payments</CardTitle>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.userFullName}</TableCell>
                  <TableCell>{payment.planName}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>{payment.monthYear}</TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>
                    {payment.receiptUrl ? (
                      <a
                        href={`http://localhost:8080${payment.receiptUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No receipt</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {payment.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenConfirm(payment)}
                        >
                          Confirm
                        </Button>
                      )}
                      <DeleteButton
                        itemName={`${payment.userFullName}'s payment`}
                        onDelete={async () => {
                          await api.delete(`/api/payments/${payment.id}`);
                          fetchPayments();
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <p>
                <span className="font-medium">User:</span>{" "}
                {selected?.userFullName}
              </p>
              <p>
                <span className="font-medium">Plan:</span> {selected?.planName}
              </p>
              <p>
                <span className="font-medium">Amount:</span> ${selected?.amount}
              </p>
              <p>
                <span className="font-medium">Month:</span>{" "}
                {selected?.monthYear}
              </p>
              {selected?.receiptUrl && (
                <a
                  href={`http://localhost:8080${selected.receiptUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block"
                >
                  View Receipt ↗
                </a>
              )}
            </div>

            <div className="space-y-2">
              <Label>Decision</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Confirm as Paid</SelectItem>
                  <SelectItem value="FAILED">Mark as Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Note</Label>
              <Textarea
                placeholder="Add a note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
