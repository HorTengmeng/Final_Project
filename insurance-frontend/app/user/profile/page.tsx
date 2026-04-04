"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Mail, Phone, Calendar, ShieldCheck,
  Camera, Lock, Bell, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get("/api/users/me").then((res) => setUser(res.data));
  }, []);

  if (!user)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">

        {/* HEADER */}
        <Card className="rounded-3xl shadow-sm border-0">
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
            
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 shadow-lg">
                <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                  {user.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow border hover:bg-slate-50">
                <Camera className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                {user.role}
              </span>
            </div>

            {/* Action */}
            <Button className="rounded-xl">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT - INFO */}
          <Card className="rounded-3xl">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-sm font-semibold text-slate-500">Personal Info</h3>

              <div className="space-y-4">
                <InfoItem icon={<Mail />} label="Email" value={user.email} />
                <InfoItem icon={<Phone />} label="Phone" value={user.phone || "Not set"} />
                <InfoItem
                  icon={<Calendar />}
                  label="Joined"
                  value={new Date(user.createdAt).toLocaleDateString()}
                />
              </div>
            </CardContent>
          </Card>

          {/* RIGHT - SETTINGS */}
          <div className="lg:col-span-2 space-y-6">

            {/* SECURITY */}
            <Card className="rounded-3xl">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-sm font-semibold text-slate-500">Security</h3>

                <SettingItem
                  icon={<Lock />}
                  title="Change Password"
                  description="Update your password regularly"
                />

                <SettingSwitch
                  icon={<ShieldCheck />}
                  title="2-Factor Authentication"
                  description="Extra layer of protection"
                />
              </CardContent>
            </Card>

            {/* NOTIFICATIONS */}
            <Card className="rounded-3xl">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-sm font-semibold text-slate-500">Notifications</h3>

                <SettingSwitch
                  icon={<Bell />}
                  title="Email Alerts"
                  description="Receive updates via email"
                  defaultChecked
                />
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}

/* 🔹 Small reusable components */

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function SettingItem({ icon, title, description }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="text-blue-600">{icon}</div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SettingSwitch({ icon, title, description, defaultChecked }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50">
      <div className="flex items-center gap-4">
        <div className="text-blue-600">{icon}</div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}