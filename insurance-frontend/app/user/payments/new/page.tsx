"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
// import { Policy } from "@/types";
import { Policy } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle, Upload } from "lucide-react";

export default function MakePaymentPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] =
    useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [monthYear, setMonthYear] = useState(
    new Date().toISOString().slice(0, 7) // "2026-03"
  );

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

  const handlePolicyChange = (policyId: string) => {
    const policy = policies.find((p) => p.id === policyId);
    setSelectedPolicy(policy || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("policyId", selectedPolicy.id);
      formData.append(
        "amount",
        String(selectedPolicy.monthlyPremium)
      );
      formData.append("monthYear", monthYear);
      if (receipt) {
        formData.append("receipt", receipt);
      }

      await api.post("/api/payments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Payment failed"
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
          Payment Submitted!
        </h2>
        <p className="text-gray-500 mb-6">
          Your payment is being verified by our team.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              router.push("/user/payments/new")
            }>
            Pay Another
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push("/user/payments")}>
            View Payments
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
          Make Payment
        </h1>
        <p className="text-gray-500 mt-1">
          Pay your monthly premium
        </p>
      </div>

      {policies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No active policies found
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
            <CardTitle>Payment Details</CardTitle>
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
                <Select onValueChange={handlePolicyChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select your policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((policy) => (
                      <SelectItem
                        key={policy.id}
                        value={policy.id}>
                        {policy.planName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show amount after selecting policy */}
              {selectedPolicy && (
                <div className="bg-blue-50 rounded-lg p-4
                  space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">
                      {selectedPolicy.planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold text-blue-600
                      text-xl">
                      ${selectedPolicy.monthlyPremium}
                    </span>
                  </div>
                </div>
              )}

              {/* Month Year */}
              <div className="space-y-2">
                <Label>Payment Month</Label>
                <Input
                  type="month"
                  value={monthYear}
                  onChange={(e) =>
                    setMonthYear(e.target.value)
                  }
                  required
                />
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label>Upload Receipt</Label>
                <div className="border-2 border-dashed
                  border-gray-200 rounded-lg p-6 text-center
                  cursor-pointer hover:border-blue-400
                  transition-colors"
                  onClick={() =>
                    document.getElementById("receipt")?.click()
                  }>
                  <Upload className="w-8 h-8 text-gray-400
                    mx-auto mb-2" />
                  {receipt ? (
                    <p className="text-sm text-blue-600 font-medium">
                      {receipt.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Click to upload receipt (PDF or Image)
                    </p>
                  )}
                </div>
                <input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    setReceipt(e.target.files?.[0] || null)
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || !selectedPolicy}>
                {submitting
                  ? "Processing..."
                  : `Pay $${selectedPolicy?.monthlyPremium || 0}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
