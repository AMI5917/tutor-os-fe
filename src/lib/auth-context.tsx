// src/lib/auth-context.tsx
"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "./supabase-client";
import { Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  phone?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  loginAsDemo: (role: "ADMIN" | "TEACHER" | "STUDENT") => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          phone: data.phone,
          avatar_url: data.avatar_url,
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.error("Auth subscription error:", err);
      return;
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || "Login failed" };
    }
  };

  const loginAsDemo = async (role: "ADMIN" | "TEACHER" | "STUDENT") => {
    // Demo mode - creates a mock user without actual Supabase auth
    const demoUsers: Record<string, AuthUser> = {
      ADMIN: {
        id: "demo-admin-1",
        email: "amir@apexacademy.edu",
        full_name: "Amir Gunje",
        role: "ADMIN",
        phone: "+91 98765 43210",
        avatar_url: undefined,
      },
      TEACHER: {
        id: "demo-teacher-1",
        email: "sarah.jenkins@apexacademy.edu",
        full_name: "Dr. Sarah Jenkins",
        role: "TEACHER",
        phone: "+91 98123 45678",
        avatar_url: undefined,
      },
      STUDENT: {
        id: "demo-student-1",
        email: "alex.rivera@student.apex.edu",
        full_name: "Alex Rivera",
        role: "STUDENT",
        phone: "+1 (555) 234-5678",
        avatar_url: undefined,
      },
    };

    const demoUser = demoUsers[role];
    if (demoUser) {
      setUser(demoUser);
      return {};
    }
    return { error: "Invalid role" };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        loginAsDemo,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}