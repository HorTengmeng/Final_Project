"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import { Plan } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { PlusCircle, Pencil } from "lucide-react";

interface PlanForm {
  name: string;
  type: string;
  description: string;
  coverageAmount: string;
  monthlyPremium: string;
  durationMonths: string;
}

const emptyForm: PlanForm = {
  name: "",
  type: "HEALTH",
  description: "",
  coverageAmount: "",
  monthlyPremium: "",
  durationMonths: "",
};

export default function AdminPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    fetchPlans();
  }, [router]);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/api/plans");
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      type: plan.type,
      description: plan.description,
      coverageAmount: String(plan.coverageAmount),
      monthlyPremium: String(plan.monthlyPremium),
      durationMonths: String(plan.durationMonths),
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name,
        type: form.type,
        description: form.description,
        coverageAmount: parseFloat(form.coverageAmount),
        monthlyPremium: parseFloat(form.monthlyPremium),
        durationMonths: parseInt(form.durationMonths),
      };

      if (editingPlan) {
        await api.put(`/api/plans/${editingPlan.id}`, body);
      } else {
        await api.post("/api/plans", body);
      }

      setDialogOpen(false);
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this plan?`)) return;

    try {
      if (currentStatus) {
        await api.delete(`/api/plans/${id}`);
      } else {
        await api.put(`/api/plans/${id}/activate`);
      }
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Insurance Plans</CardTitle>
          <Button onClick={handleOpenCreate}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.type}</TableCell>
                  <TableCell>${plan.coverageAmount.toLocaleString()}</TableCell>
                  <TableCell>${plan.monthlyPremium}/mo</TableCell>
                  <TableCell>{plan.durationMonths} months</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs
    font-medium ${
      plan.isActive
        ? "bg-green-100 text-green-800"
        : "bg-gray-100 text-gray-500"
    }`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(plan)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={plan.isActive ? "destructive" : "default"}
                        onClick={() => handleToggle(plan.id, plan.isActive)}
                      >
                        {plan.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input
                placeholder="Basic Health Plan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="HEALTH">Health</option>
                <option value="LIFE">Life</option>
                <option value="VEHICLE">Vehicle</option>
                <option value="PROPERTY">Property</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Plan description..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coverage Amount ($)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={form.coverageAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      coverageAmount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Premium ($)</Label>
                <Input
                  type="number"
                  placeholder="99"
                  value={form.monthlyPremium}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      monthlyPremium: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration (months)</Label>
              <Input
                type="number"
                placeholder="12"
                value={form.durationMonths}
                onChange={(e) =>
                  setForm({ ...form, durationMonths: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingPlan ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
