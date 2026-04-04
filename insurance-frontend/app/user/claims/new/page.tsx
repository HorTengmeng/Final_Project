"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
// import { Policy } from "@/types";
import { Policy } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function FileClaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPolicyId = searchParams.get("policyId");

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    policyId: preselectedPolicyId || "",
    reason: "",
    amountRequested: "",
  });

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    const payload = decodeToken(token);
    if (!payload || payload.role !== "USER") {
      router.push("/auth/login"); return;
    }
    fetchActivePolicies();
  }, [router]);

  const fetchActivePolicies = async () => {
    try {
      const res = await api.get("/api/policies/my");
      // Only ACTIVE policies can have claims
      const active = res.data.filter(
        (p: Policy) => p.status === "ACTIVE"
      );
      setPolicies(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/api/claims", {
        policyId: form.policyId,
        reason: form.reason,
        amountRequested: parseFloat(form.amountRequested),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to file claim"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (success) return (
    <div className="p-8 flex items-center justify-center
      min-h-screen">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full
          flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Claim Submitted!
        </h2>
        <p className="text-gray-500 mb-6">
          Your claim has been submitted and is under review.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/user/claims/new")}>
            File Another
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push("/user/claims")}>
            View Claims
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">

      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          File a Claim
        </h1>
        <p className="text-gray-500 mt-1">
          Submit your insurance claim for review
        </p>
      </div>

      {policies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">
              You need an active policy to file a claim
            </p>
            <Button
              onClick={() => router.push("/user/policies")}>
              View My Policies
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="bg-red-50 text-red-600 px-4
                  py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Select Policy */}
              <div className="space-y-2">
                <Label>Select Policy</Label>
                <Select
                  value={form.policyId}
                  onValueChange={(v) =>
                    setForm({ ...form, policyId: v })
                  }>
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select your policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((policy) => (
                      <SelectItem
                        key={policy.id}
                        value={policy.id}>
                        {policy.planName} — {policy.planType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason for Claim</Label>
                <Textarea
                  placeholder="Describe your claim in detail..."
                  rows={4}
                  value={form.reason}
                  onChange={(e) =>
                    setForm({ ...form, reason: e.target.value })
                  }
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Amount Requested ($)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={form.amountRequested}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amountRequested: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || !form.policyId}>
                {submitting
                  ? "Submitting..."
                  : "Submit Claim"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}