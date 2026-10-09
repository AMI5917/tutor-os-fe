import React from "react";
import { GraduationCap, Users, CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Brand Showcase Pane */}
      <div className="relative hidden w-full flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 text-white lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Tutor<span className="text-indigo-400">OS</span>
            </span>
            <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase border border-indigo-400/20">
              v1.0 MVP
            </span>
          </div>
        </div>

        {/* Center Value Proposition */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-200 backdrop-blur-md border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>The Operating System for Modern Education</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Run your tutoring academy with{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-emerald-300 bg-clip-text text-transparent">
              zero administrative friction.
            </span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Eliminate chaotic spreadsheets and fragmented messaging. Unify class batch segregation, teacher management, 1-click attendance, semester grading, and automated WhatsApp fee reminders.
          </p>

          {/* Social Proof Cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-bold">1-Click</div>
                  <div className="text-xs text-slate-400">Attendance & Logs</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-bold">Multi-Role</div>
                  <div className="text-xs text-slate-400">Tutors, Staff & Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security / Trust Footer */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Enterprise-grade security, RBAC protection & real-time synchronization.</span>
        </div>
      </div>

      {/* Right Form Content */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
