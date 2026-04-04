"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import { Policy } from "@/app/types";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StatusBadge from "@/components/shared/statusbadge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Shield, PlusCircle } from "lucide-react";

export default function MyPoliciesPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    const payload = decodeToken(token);
    if (!payload || payload.role !== "USER") {
      router.push("/auth/login"); return;
    }
    fetchPolicies();
  }, [router]);

  const fetchPolicies = async () => {
    try {
      const res = await api.get("/api/policies/my");
      setPolicies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.put(`/api/policies/${cancelId}/cancel`);
      setCancelId(null);
      fetchPolicies();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Policies
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your insurance coverage
          </p>
        </div>
        <Button onClick={() => router.push("/user/plans")}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Apply for Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {["ACTIVE", "PENDING", "CANCELLED"].map((status) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {status} Policies
                  </p>
                  <p className="text-3xl font-bold">
                    {policies.filter(
                      (p) => p.status === status
                    ).length}
                  </p>
                </div>
                <Shield className={`w-8 h-8 ${
                  status === "ACTIVE"
                    ? "text-green-500"
                    : status === "PENDING"
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Policies</CardTitle>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-300
                mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                No policies yet
              </p>
              <Button
                onClick={() => router.push("/user/plans")}>
                Browse Plans
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Note</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">
                      {policy.planName}
                    </TableCell>
                    <TableCell>{policy.planType}</TableCell>
                    <TableCell>{policy.startDate}</TableCell>
                    <TableCell>{policy.endDate}</TableCell>
                    <TableCell>
                      <StatusBadge status={policy.status} />
                    </TableCell>
                    <TableCell>
                      {policy.adminNote || (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {policy.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/user/claims/new?policyId=${policy.id}`
                              )
                            }>
                            File Claim
                          </Button>
                        )}
                        {(policy.status === "ACTIVE" ||
                          policy.status === "PENDING") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setCancelId(policy.id)
                            }>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Policy"
        description="Are you sure you want to cancel this policy? You will lose your coverage."
        confirmLabel="Yes, Cancel Policy"
        variant="warning"
        loading={cancelling}
      />
    </div>
  );
}