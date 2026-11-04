// src/components/billing/PaymentStatusBadge.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/billing";
import { CheckCircle2, AlertTriangle, Clock, Hourglass } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
  showIcon?: boolean;
}

export function PaymentStatusBadge({
  status,
  className = "",
  showIcon = true,
}: PaymentStatusBadgeProps) {
  switch (status) {
    case "PAID":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 font-medium px-2.5 py-0.5 gap-1.5 ${className}`}
        >
          {showIcon && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
          <span>Paid</span>
        </Badge>
      );

    case "PARTIALLY_PAID":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 font-medium px-2.5 py-0.5 gap-1.5 ${className}`}
        >
          {showIcon && <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
          <span>Partially Paid</span>
        </Badge>
      );

    case "OVERDUE":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 font-medium px-2.5 py-0.5 gap-1.5 ${className}`}
        >
          {showIcon && <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />}
          <span>Overdue</span>
        </Badge>
      );

    case "PENDING":
    default:
      return (
        <Badge
          variant="outline"
          className={`bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-medium px-2.5 py-0.5 gap-1.5 ${className}`}
        >
          {showIcon && <Hourglass className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />}
          <span>Pending</span>
        </Badge>
      );
  }
}
