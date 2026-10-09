"use client";

import React from "react";
import { KpiStats } from "@/types/roles";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  IndianRupee,
  CalendarCheck,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function KpiStatsCards({ stats }: { stats: KpiStats }) {
  const earningsPercentage = Math.round(
    (stats.monthlyEarnings / (stats.targetEarnings || 1)) * 100
  );

  const handleSendReminders = () => {
    toast.success(
      `Dispatched automated WhatsApp fee reminders to ${stats.pendingDuesCount} parents with overdue dues!`
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Active Students & Batches */}
      <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Students
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {stats.totalStudents}
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +{stats.studentGrowthPct}%
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
            <span>Enrolled across</span>
            <span className="font-semibold text-foreground">
              {stats.activeBatches} Active Batches
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: Monthly Tuition Earnings */}
      <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Earnings
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {formatCurrency(stats.monthlyEarnings)}
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              +{stats.earningsGrowthPct}%
            </span>
          </div>

          {/* Progress to Target */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Goal: {formatCurrency(stats.targetEarnings)}</span>
              <span className="font-bold text-foreground">{earningsPercentage}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${earningsPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI 3: Today's Classes */}
      <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today&apos;s Sessions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {stats.todayClasses}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              classes booked
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
            <span className="text-muted-foreground">Completed today:</span>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200">
              {stats.completedTodayClasses} of {stats.todayClasses} Done
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPI 4: Pending Tuition Dues */}
      <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unpaid Dues
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(stats.pendingDues)}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              ({stats.pendingDuesCount} invoices)
            </span>
          </div>

          <div className="mt-3 border-t pt-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Action needed:</span>
            <button
              onClick={handleSendReminders}
              className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 transition-colors"
            >
              <Send className="h-3 w-3" />
              WhatsApp Alert
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
