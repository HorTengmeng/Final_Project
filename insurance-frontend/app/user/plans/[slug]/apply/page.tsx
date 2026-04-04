"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
// import { Plan } from "@/types";
import { Plan } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Upload,
  Shield,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Plan Summary" },
  { id: 2, title: "Personal Info" },
  { id: 3, title: "Confirm" },
];

export default function ApplyPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.slug as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "",
    address: "",
    occupation: "",
    medicalHistory: "",
    beneficiaryName: "",
    beneficiaryRelationship: "",
  });

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
    fetchPlan();
  }, [router]);

  const fetchPlan = async () => {
    try {
      const res = await api.get(`/api/plans/${planId}`);
      setPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError("");
    if (step === 2) {
      if (
        !form.dateOfBirth ||
        !form.gender ||
        !form.address ||
        !form.occupation
      ) {
        setError("Please fill in all required fields");
        return;
      }
    }
    setStep((s) => s + 1);
  };

const handleSubmit = async () => {
  setSubmitting(true);
  setError("");
  try {
    // Send as a plain JSON object instead of FormData
    const payload = {
      planId: planId,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender, // Added gender back in
      address: form.address,
      occupation: form.occupation,
      medicalHistory: form.medicalHistory,
      beneficiaryName: form.beneficiaryName,
      beneficiaryRelationship: form.beneficiaryRelationship,
    };

    await api.post("/api/policies/apply", payload);

    setSuccess(true);
  } catch (err: any) {
    setError(err.response?.data?.message || "Failed to apply");
  } finally {
    setSubmitting(false);
  }
};

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center
      justify-center"
      >
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  // SUCCESS STATE
  if (success)
    return (
      <div
        className="p-8 flex items-center justify-center
      min-h-[80vh]"
      >
        <Card
          className="max-w-md w-full text-center p-8
        border-none shadow-lg"
        >
          <div
            className="w-16 h-16 bg-green-100 rounded-full
          flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-500 mb-6">
            Your application for <strong>{plan?.name}</strong> has been
            submitted. An admin will review it shortly.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/user/plans")}
            >
              Browse More
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push("/user/policies")}
            >
              My Policies
            </Button>
          </div>
        </Card>
      </div>
    );

  return (
    <div className="p-8 space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Plans
      </Button>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Apply for Coverage</h1>
        <p className="text-gray-500 mt-1">
          Complete the application for {plan?.name}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2
              px-3 py-1.5 rounded-full text-xs font-medium
              transition-all ${
                step === s.id
                  ? "bg-blue-600 text-white"
                  : step > s.id
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {step > s.id ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <span>{s.id}</span>
              )}
              {s.title}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-6 ${
                  step > s.id ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          className="bg-red-50 border border-red-200
          text-red-600 px-4 py-3 rounded-lg text-sm"
        >
           {error}
        </div>
      )}

      {/* ================================ */}
      {/* STEP 1 — Plan Summary            */}
      {/* ================================ */}
      {step === 1 && plan && (
        <div
          className="grid grid-cols-1 md:grid-cols-2
          gap-6"
        >
          {/* Plan Card */}
          <Card className="border-2 border-blue-100">
            <div className="h-1.5 bg-blue-500 rounded-t-lg" />
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-semibold
                  bg-blue-100 text-blue-700 px-2 py-1
                  rounded-full"
                >
                  {plan.type}
                </span>
              </div>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className="flex justify-between py-2
                border-b"
              >
                <span className="text-gray-500 text-sm">Monthly Premium</span>
                <span
                  className="font-bold text-blue-600
                  text-lg"
                >
                  ${plan.monthlyPremium}
                </span>
              </div>
              <div
                className="flex justify-between py-2
                border-b"
              >
                <span className="text-gray-500 text-sm">Coverage Amount</span>
                <span className="font-semibold">
                  ${plan.coverageAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 text-sm">Duration</span>
                <span className="font-semibold">
                  {plan.durationMonths} months
                </span>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Fill Personal Info",
                    desc: "Provide your personal details",
                    color: "bg-blue-600",
                  },
                  {
                    step: "2",
                    title: "Upload Documents",
                    desc: "ID card or proof of identity",
                    color: "bg-yellow-500",
                  },
                  {
                    step: "3",
                    title: "Admin Review",
                    desc: "We verify your application",
                    color: "bg-purple-600",
                  },
                  {
                    step: "4",
                    title: "Coverage Active",
                    desc: "Pay premium to get covered",
                    color: "bg-green-600",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 ${item.color}
                      rounded-full flex items-center
                      justify-center flex-shrink-0`}
                    >
                      <span
                        className="text-white text-xs
                        font-bold"
                      >
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <p
                        className="font-medium text-gray-900
                        text-sm"
                      >
                        {item.title}
                      </p>
                      <p className="text-gray-400 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2 — Personal Info           */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Fields marked with <span className="text-red-500">*</span> are
              required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* DOB + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Date of Birth
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dateOfBirth: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Gender
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>
                Address
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                placeholder="Your full address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label>
                Occupation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                placeholder="Your current job or profession"
                value={form.occupation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    occupation: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Medical History */}
            <div className="space-y-2">
              <Label>
                Medical History
                <span className="text-gray-400 text-xs ml-2">(optional)</span>
              </Label>
              <Textarea
                placeholder="Any existing medical conditions,
                  allergies, previous surgeries, medications..."
                rows={3}
                value={form.medicalHistory}
                onChange={(e) =>
                  setForm({
                    ...form,
                    medicalHistory: e.target.value,
                  })
                }
              />
            </div>

            {/* Beneficiary Section */}
            <div className="border-t pt-5">
              <div className="mb-4">
                <p className="font-semibold text-gray-800">
                  Beneficiary Information
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Person who receives the payout (optional but recommended)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Beneficiary Full Name</Label>
                  <Input
                    placeholder="Full name"
                    value={form.beneficiaryName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        beneficiaryName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Select
                    value={form.beneficiaryRelationship}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        beneficiaryRelationship: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SPOUSE">Spouse</SelectItem>
                      <SelectItem value="PARENT">Parent</SelectItem>
                      <SelectItem value="CHILD">Child</SelectItem>
                      <SelectItem value="SIBLING">Sibling</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

     

      {/* STEP 4 — Confirm & Submit        */}
      {step === 3 && plan && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Application</CardTitle>
              <CardDescription>
                Please review all details before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Summary */}
              <div
                className="bg-blue-50 border border-blue-100
                rounded-lg p-4"
              >
                <h3
                  className="font-semibold text-blue-900
                  mb-3 flex items-center gap-2 text-sm"
                >
                  <Shield className="w-4 h-4" />
                  Plan Details
                </h3>
                <div
                  className="grid grid-cols-2 gap-y-2
                  text-sm"
                >
                  <div>
                    <span className="text-gray-500">Plan:</span>
                    <span className="ml-2 font-medium">{plan.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium">{plan.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Monthly:</span>
                    <span
                      className="ml-2 font-bold
                      text-blue-600"
                    >
                      ${plan.monthlyPremium}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Coverage:</span>
                    <span className="ml-2 font-medium">
                      ${plan.coverageAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium">
                      {plan.durationMonths} months
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Info Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3
                  className="font-semibold text-gray-900
                  mb-3 text-sm"
                >
                  Personal Information
                </h3>
                <div
                  className="grid grid-cols-2 gap-y-2
                  text-sm"
                >
                  <div>
                    <span className="text-gray-500">DOB:</span>
                    <span className="ml-2">{form.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-2">{form.gender}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-2">{form.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Occupation:</span>
                    <span className="ml-2">{form.occupation}</span>
                  </div>
                  {form.medicalHistory && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Medical History:</span>
                      <span className="ml-2">{form.medicalHistory}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Beneficiary Summary */}
              {form.beneficiaryName && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3
                    className="font-semibold text-gray-900
                    mb-3 text-sm"
                  >
                    Beneficiary
                  </h3>
                  <div
                    className="grid grid-cols-2 gap-y-2
                    text-sm"
                  >
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2">{form.beneficiaryName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Relationship:</span>
                      <span className="ml-2">
                        {form.beneficiaryRelationship}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3
                  className="font-semibold text-gray-900
                  mb-2 text-sm"
                >
                  Document
                </h3>
                <p className="text-sm">
                  {docFile ? (
                    <span className="text-green-600">✅ {docFile.name}</span>
                  ) : (
                    <span className="text-gray-400">
                     No document uploaded (optional)
                    </span>
                  )}
                </p>
              </div>

              {/* Agreement */}
              <div
                className="bg-blue-50 border border-blue-100
                rounded-lg p-3 text-xs text-blue-700"
              >
                By submitting this application, you confirm that all information
                provided is accurate and complete. False information may result
                in claim rejection.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================================ */}
      {/* NAVIGATION BUTTONS               */}
      {/* ================================ */}
      <div className="flex justify-between pt-2">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setStep((s) => s - 1);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button onClick={handleNext}>
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700
              min-w-40"
          >
            {submitting ? "Submitting..." : "Submit Application"}
            {!submitting && <CheckCircle className="w-4 h-4 ml-2" />}
          </Button>
        )}
      </div>
    </div>
  );
}
