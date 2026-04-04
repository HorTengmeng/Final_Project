"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import { Claim } from "@/app/types";
import StatusBadge from "@/components/shared/statusbadge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PlusCircle, AlertCircle } from "lucide-react";

export default function MyClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    const payload = decodeToken(token);
    if (!payload || payload.role !== "USER") {
      router.push("/auth/login"); return;
    }
    fetchClaims();
  }, [router]);

  const fetchClaims = async () => {
    try {
      const res = await api.get("/api/claims/my");
      setClaims(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Claims
          </h1>
          <p className="text-gray-500 mt-1">
            Track your insurance claims
          </p>
        </div>
        <Button
          onClick={() => router.push("/user/claims/new")}>
          <PlusCircle className="w-4 h-4 mr-2" />
          File New Claim
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {status}
                  </p>
                  <p className="text-3xl font-bold">
                    {claims.filter(
                      (c) => c.status === status
                    ).length}
                  </p>
                </div>
                <AlertCircle className={`w-8 h-8 ${
                  status === "APPROVED"
                    ? "text-green-500"
                    : status === "PENDING"
                    ? "text-yellow-500"
                    : "text-red-400"
                }`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300
                mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                No claims filed yet
              </p>
              <Button
                onClick={() => router.push("/user/claims/new")}>
                File Your First Claim
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Note</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">
                      {claim.planName}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {claim.reason}
                    </TableCell>
                    <TableCell>
                      ${claim.amountRequested}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell>
                      {claim.adminNote || (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(claim.createdAt)
                        .toLocaleDateString()}
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