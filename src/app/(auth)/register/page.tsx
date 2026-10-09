"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [academyName, setAcademyName] = useState("");
  const [founderName, setFounderName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [primarySubject, setPrimarySubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyName || !email || !password) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(email, "ADMIN");
      toast.success(`Academy "${academyName}" registered successfully!`);
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight">Create your Academy</h2>
        <p className="text-sm text-muted-foreground">
          Get started with TutorOS to manage students, batches, faculty, and billing.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="academyName">Academy / Coaching Center Name *</Label>
          <Input
            id="academyName"
            placeholder="e.g. Apex Learning Center"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="founderName">Your Full Name</Label>
            <Input
              id="founderName"
              placeholder="e.g. Prof. Amir"
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primarySubject">Primary Subject/Stream</Label>
            <Input
              id="primarySubject"
              placeholder="e.g. STEM / SAT"
              value={primarySubject}
              onChange={(e) => setPrimarySubject(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Admin Work Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="director@youracademy.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            "Creating Academy..."
          ) : (
            <>
              <span>Launch TutorOS Academy</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
}
