"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, CheckCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "success";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {

  const styles = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-600" />,
      iconBg: "bg-red-100",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      iconBg: "bg-yellow-100",
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      iconBg: "bg-green-100",
      confirmBtn: "bg-green-600 hover:bg-green-700 text-white",
    },
  };

  const style = styles[variant];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">

        {/* Top colored bar */}
        <div className={`h-1 w-full ${
          variant === "danger" ? "bg-red-500" :
          variant === "warning" ? "bg-yellow-500" :
          "bg-green-500"
        }`} />

        <div className="p-6 space-y-4">
          <DialogHeader>
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full
              ${style.iconBg} flex items-center
              justify-center mx-auto mb-2`}>
              {style.icon}
            </div>

            <DialogTitle className="text-center text-lg
              font-semibold text-gray-900">
              {title}
            </DialogTitle>

            <DialogDescription className="text-center
              text-gray-500 text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              className={`flex-1 ${style.confirmBtn}`}
              onClick={onConfirm}
              disabled={loading}>
              {loading ? "Processing..." : confirmLabel}
            </Button>
          </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
}