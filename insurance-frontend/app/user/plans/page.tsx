"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getToken, decodeToken } from "@/lib/auth";
import { Plan } from "@/app/types";
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function BrowsePlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    const payload = decodeToken(token);
    if (!payload || payload.role !== "USER") {
      router.push("/auth/login"); return;
    }
    fetchPlans();
  }, [router]);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/api/plans/active");
      setPlans(res.data);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Insurance Plans
        </h1>
        <p className="text-gray-500 mt-1">
          Choose the right coverage for you
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          No plans available
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden
                hover:shadow-xl transition-all duration-300
                hover:-translate-y-1 border-2
                ${index === 1
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-100"
                }`}>

              {index === 1 && (
                <div className="absolute top-0 right-0
                  bg-blue-600 text-white text-xs font-bold
                  px-4 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}

              <div className="h-2 bg-blue-500" />

              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">
                    {plan.name}
                  </CardTitle>
                  <span className={`text-xs font-semibold
                    px-3 py-1 rounded-full
                    ${plan.type === "HEALTH"
                      ? "bg-green-100 text-green-700"
                      : plan.type === "LIFE"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                    }`}>
                    {plan.type}
                  </span>
                </div>
                <CardDescription>
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold
                    text-gray-900">
                    ${plan.monthlyPremium}
                  </span>
                  <span className="text-gray-500 mb-1">/mo</span>
                </div>

                <div className="space-y-2 py-3
                  border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Coverage</span>
                    <span className="font-semibold">
                      ${plan.coverageAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold">
                      {plan.durationMonths} months
                    </span>
                  </div>
                </div>

                {["24/7 Support", "Fast Claims",
                  "Online Management"].map((f) => (
                  <div key={f}
                    className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4
                      text-green-500" />
                    <span className="text-sm text-gray-600">
                      {f}
                    </span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(`/user/plans/${plan.id}/apply`)
                  }>
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}