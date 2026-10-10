"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/types/roles";
import {
  Search,
  Bell,
  Sparkles,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  ChevronDown,
  Building2,
  Check,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void;
}

export function DashboardHeader({ onMenuClick, collapsed, onCollapseToggle }: DashboardHeaderProps) {
  const { user, loginAsDemo, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(3);

  const handleRoleSwitch = (role: UserRole) => {
    loginAsDemo(role);
    toast.info(`Switched view to ${role} persona`);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: Mobile Menu Button + Collapse Toggle + Global Search */}
      <div className="flex items-center gap-4 w-full max-w-md">
        {/* Mobile menu button (hamburger) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Collapse/Expand sidebar button (visible on all screen sizes) */}
        <button
          onClick={onCollapseToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        {/* Search */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students, batches, teachers (⌘ + K)..."
            className="h-9 pl-9 pr-4 text-xs bg-muted/50 border-border/80 focus-visible:bg-background"
          />
        </div>
      </div>

      {/* Right Action Toolbar */}
      <div className="flex items-center gap-3">
        {/* Academy Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground">
            {user?.academyName || "Apex Academy"}
          </span>
        </div>

        {/* Role Switcher Pill */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold capitalize">
                {user?.role.toLowerCase()} View
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Preview Persona
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleRoleSwitch("ADMIN")}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>Admin / Solo Tutor</span>
              </div>
              {user?.role === "ADMIN" && <Check className="h-4 w-4 text-emerald-600" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleRoleSwitch("TEACHER")}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <span>Faculty Teacher</span>
              </div>
              {user?.role === "TEACHER" && <Check className="h-4 w-4 text-emerald-600" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleRoleSwitch("STUDENT")}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                <span>Student / Parent</span>
              </div>
              {user?.role === "STUDENT" && <Check className="h-4 w-4 text-emerald-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Popover */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-8 w-8 rounded-full border-border/80"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <button
                onClick={() => {
                  setUnreadCount(0);
                  toast.success("All notifications marked as read.");
                }}
                className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400 font-normal"
              >
                Mark all read
              </button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1 p-1">
              <div className="rounded-lg p-2 hover:bg-muted/60 transition-colors text-xs space-y-0.5 cursor-pointer">
                <p className="font-semibold text-foreground">Next Session Starting in 25m</p>
                <p className="text-muted-foreground text-[11px]">
                  [PHY-12B] AP Physics Mechanics with Prof. Amir
                </p>
              </div>
              <div className="rounded-lg p-2 hover:bg-muted/60 transition-colors text-xs space-y-0.5 cursor-pointer">
                <p className="font-semibold text-foreground">Tuition Fee Paid (₹3,200)</p>
                <p className="text-muted-foreground text-[11px]">
                  Alex Rivera cleared invoice for Math & Physics
                </p>
              </div>
              <div className="rounded-lg p-2 hover:bg-muted/60 transition-colors text-xs space-y-0.5 cursor-pointer">
                <p className="font-semibold text-foreground">Semester 1 Results Ready</p>
                <p className="text-muted-foreground text-[11px]">
                  Draft report cards generated for Grade 10 Batch
                </p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar & Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name?.charAt(0) || "A"}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground leading-none">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Settings panel opened.")}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Academy Branding opened.")}>
              Academy Branding
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-rose-600 focus:text-rose-600 cursor-pointer"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
