"use client";

import React from "react";
import { HeroWelcome } from "@/components/dashboard/HeroWelcome";
import { KpiStatsCards } from "@/components/dashboard/KpiStatsCards";
import { QuickActionToolbar } from "@/components/dashboard/QuickActionToolbar";
import { TodayAgendaFeed } from "@/components/dashboard/TodayAgendaFeed";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import {
  getKpiStats,
  MOCK_KPIS,
  MOCK_TODAY_SESSIONS,
  MOCK_RECENT_ACTIVITIES,
  MOCK_BATCHES,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Layers, Users, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = getKpiStats();

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Greeting Banner */}
      <HeroWelcome />

      {/* 2. Quick Operations Toolbar */}
      <QuickActionToolbar />

      {/* 3. 4 Core Executive KPI Cards */}
      <KpiStatsCards stats={stats} />

      {/* 4. Split Grid: Live Agenda & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Today's Agenda Feed */}
        <div className="lg:col-span-7">
          <TodayAgendaFeed sessions={MOCK_TODAY_SESSIONS} />
        </div>

        {/* Right Column: Live Audit Stream */}
        <div className="lg:col-span-5">
          <RecentActivityFeed activities={MOCK_RECENT_ACTIVITIES} />
        </div>
      </div>

      {/* 5. Class Batch Segregation & Capacity Preview Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Active Class Batches & Capacity
            </CardTitle>
            <CardDescription>
              Segregated cohorts with assigned faculty, subject stream, and seat occupancy.
            </CardDescription>
          </div>

          <Link
            href="/dashboard/batches"
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1"
          >
            Manage All Batches
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {MOCK_BATCHES.map((batch) => {
              const occupancyPct = Math.round(
                (batch.enrolledStudents / batch.capacity) * 100
              );
              const isFull = batch.enrolledStudents >= batch.capacity;

              return (
                <div
                  key={batch.id}
                  className="rounded-xl border p-4 space-y-3 bg-muted/20 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      [{batch.code}]
                    </span>
                    <Badge
                      variant={isFull ? "destructive" : "success"}
                      className="text-[10px] font-bold"
                    >
                      {isFull ? "FULL" : `${batch.capacity - batch.enrolledStudents} SEATS LEFT`}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold truncate leading-tight">
                      {batch.name}
                    </h4>
                    <p className="text-xs text-muted-foreground pt-1">
                      Faculty: <strong className="text-foreground">{batch.teacherName}</strong>
                    </p>
                  </div>

                  {/* Seat Occupancy Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Occupancy: {batch.enrolledStudents} / {batch.capacity}</span>
                      <span className="font-bold">{occupancyPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? "bg-rose-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {batch.scheduleDays}
                    </span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(batch.monthlyFee)}/mo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
