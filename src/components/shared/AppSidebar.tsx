"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Layers,
  UserCheck,
  Award,
  Calendar,
  ClipboardCheck,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "warning" | "success" | "destructive" | "info";
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Teachers & Staff",
    href: "/teachers",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Class Batches",
    href: "/dashboard/batches",
    icon: Layers,
    badge: "8 Active",
    badgeVariant: "info",
  },
  {
    label: "Students CRM",
    href: "/dashboard/students",
    icon: UserCheck,
  },
  {
    label: "Semester Results",
    href: "/dashboard/results",
    icon: Award,
    badge: "Sem 1",
    badgeVariant: "success",
  },
  {
    label: "Schedule / Calendar",
    href: "/dashboard/schedule",
    icon: Calendar,
    badge: "4 Today",
    badgeVariant: "warning",
  },
  {
    label: "Attendance & Logs",
    href: "/dashboard/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Billing & Invoices",
    href: "/dashboard/billing",
    icon: Receipt,
    badge: "6 Due",
    badgeVariant: "destructive",
    roles: ["ADMIN", "PARENT"],
  },
  {
    label: "Academy Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card text-card-foreground transition-all duration-300 z-30 shrink-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-indigo-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none">
                Tutor<span className="text-indigo-600 dark:text-indigo-400">OS</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium pt-1">
                {user?.academyName || "Tutoring System"}
              </span>
            </div>
          </Link>
        ) : (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-indigo-600">
            <GraduationCap className="h-5 w-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground hover:bg-accent shadow-sm"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-900 text-white shadow-sm dark:bg-indigo-600"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )}
              />

              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || "default"}
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0",
                        isActive && "border-white/20 bg-white/20 text-white"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer Card */}
      <div className="border-t p-3">
        {!collapsed ? (
          <div className="flex items-center justify-between rounded-xl bg-muted/60 p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1 pt-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title="Sign Out"
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
