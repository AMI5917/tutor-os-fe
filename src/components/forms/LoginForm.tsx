"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/types/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ShieldAlert,
  GraduationCap,
  Briefcase,
  UserCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [email, setEmail] = useState("amir@apexacademy.edu");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "ADMIN") {
      setEmail("amir@apexacademy.edu");
    } else if (role === "TEACHER") {
      setEmail("sarah.jenkins@apexacademy.edu");
    } else {
      setEmail("alex.rivera@student.apex.edu");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(email, selectedRole);
      toast.success(`Welcome back! Signed in as ${selectedRole}`);
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  const handleDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    loginAsDemo(role);
    toast.success(`Instant Demo Login: Switched to ${role}`);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Role Selector Header */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select Your Access Role
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleRoleChange("ADMIN")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
              selectedRole === "ADMIN"
                ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="text-xs">Academy Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("TEACHER")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
              selectedRole === "TEACHER"
                ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span className="text-xs">Teacher / Staff</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("STUDENT")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
              selectedRole === "STUDENT"
                ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Student / Parent</span>
          </button>
        </div>
      </div>

      {/* 1-Click Instant Demo Login Banner */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <div className="flex items-center justify-between pb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            1-Click Instant Demo Sign In:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("ADMIN")}
            disabled={isLoading}
            className="h-7 text-xs bg-white dark:bg-slate-900 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
          >
            Admin Demo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("TEACHER")}
            disabled={isLoading}
            className="h-7 text-xs bg-white dark:bg-slate-900 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
          >
            Teacher Demo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("STUDENT")}
            disabled={isLoading}
            className="h-7 text-xs bg-white dark:bg-slate-900 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
          >
            Student Demo
          </Button>
        </div>
      </div>

      {/* Standard Email & Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@apexacademy.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Password reset link dispatched in demo mode.");
              }}
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Signing in...
            </span>
          ) : (
            <>
              <span>Sign In to {selectedRole} Portal</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 gap-2 font-normal"
        onClick={() => handleDemoLogin("ADMIN")}
        disabled={isLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google
      </Button>
    </div>
  );
}
