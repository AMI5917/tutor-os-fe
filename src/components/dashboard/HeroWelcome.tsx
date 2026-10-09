"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HeroWelcome() {
  const { user } = useAuth();

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md dark:border-indigo-950 lg:p-8">
      <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-200 backdrop-blur-md">
              <CalendarIcon className="h-3.5 w-3.5 text-indigo-400" />
              {todayStr}
            </span>
            <Badge
              variant="outline"
              className="border-indigo-400/30 bg-indigo-500/20 text-indigo-200 text-xs font-semibold"
            >
              {user?.role === "ADMIN"
                ? "Executive Control Mode"
                : user?.role === "TEACHER"
                ? "Faculty Dashboard"
                : "Student Learning Space"}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
            Welcome back, {user?.name}! 👋
          </h1>

          <p className="text-sm text-slate-300">
            {user?.role === "ADMIN"
              ? "You have 5 sessions scheduled across 4 batches today. 2 classes completed, 1 currently active in Google Meet."
              : user?.role === "TEACHER"
              ? "You have 2 scheduled batch lectures today. Remember to mark attendance and assign homework notes."
              : "Here is your enrolled schedule, past lesson logs, and Semester 1 academic report card."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-black text-indigo-300">5</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Today&apos;s Sessions
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-black text-emerald-400">98%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Attendance Avg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
