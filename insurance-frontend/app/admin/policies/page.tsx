"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import DeleteButton from "@/components/shared/deletebutton";
import { Policy } from "@/app/types";
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

export default function AdminPoliciesPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Policy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
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
    fetchPolicies();
  }, [router]);

  const fetchPolicies = async () => {
    try {
      const res = await api.get("/api/policies");
      setPolicies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (policy: Policy) => {
    setSelected(policy);
    setStatus(policy.status);
    setAdminNote(policy.adminNote || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/api/policies/${selected.id}/status`, {
        status,
        adminNote,
      });
      setDialogOpen(false);
      fetchPolicies();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered =
    filterStatus === "ALL"
      ? policies
      : policies.filter((p) => p.status === filterStatus);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Plans</h1>
        <p className="text-gray-500 mt-1">Create and manage insurance plans</p>
      </div>
      <Card>
        <CardHeader
          className="flex flex-row items-center
            justify-between"
        >
          <CardTitle>All Policies</CardTitle>
          {/* Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.userFullName}</TableCell>
                  <TableCell>{policy.planName}</TableCell>
                  <TableCell>{policy.startDate}</TableCell>
                  <TableCell>{policy.endDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={policy.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReview(policy)}
                      >
                        Review
                      </Button>
                      <DeleteButton
                        itemName={`${policy.userFullName}'s policy`}
                        onDelete={async () => {
                          await api.delete(`/api/policies/${policy.id}`);
                          fetchPolicies();
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

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Application Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* NEW: USER SUBMITTED DATA SECTION */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3 text-sm">
              <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-1">
                Submitted Information
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500 text-xs">Date of Birth</p>
                  <p className="font-medium">{selected?.dateOfBirth || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Occupation</p>
                  <p className="font-medium">{selected?.occupation || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Address</p>
                  <p className="font-medium">{selected?.address || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Medical History</p>
                  <p className="font-medium italic text-gray-700">
                    {selected?.medicalHistory || "No history provided"}
                  </p>
                </div>
                {selected?.beneficiaryName && (
                  <div className="col-span-2 pt-2 border-t border-blue-100">
                    <p className="text-gray-500 text-xs">Beneficiary</p>
                    <p className="font-medium">
                      {selected.beneficiaryName} ({selected.beneficiaryRelationship})
                    </p>
                  </div>
                )}
              </div>

              {/* NEW: VIEW DOCUMENT BUTTON */}
              {selected?.documentUrl && (
                <div className="pt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-white"
                    onClick={() => window.open(`http://localhost:8080${selected.documentUrl}`, "_blank")}
                  >
                    View Attached Document/ID
                  </Button>
                </div>
              )}
            </div>

            {/* Original Plan Info */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm border">
               <p><span className="font-medium text-gray-500">Plan:</span> {selected?.planName}</p>
               <p><span className="font-medium text-gray-500">Requested Period:</span> {selected?.startDate} → {selected?.endDate}</p>
            </div>

            {/* Update Status Form */}
            <div className="space-y-2 pt-2">
              <Label>Decision</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending (Under Review)</SelectItem>
                  <SelectItem value="ACTIVE">Approve (Active)</SelectItem>
                  <SelectItem value="CANCELLED">Reject (Cancelled)</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Note (Visible to User)</Label>
              <Textarea
                placeholder="Reason for approval/rejection..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600">
              {saving ? "Saving..." : "Save Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
