"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types/roles";

export const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: "usr_admin_1",
    name: "Prof. Amir",
    email: "amir@apexacademy.edu",
    role: "ADMIN",
    academyName: "Apex Tutoring Academy",
    title: "Academy Founder & Lead Director",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  TEACHER: {
    id: "usr_teach_1",
    name: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@apexacademy.edu",
    role: "TEACHER",
    academyName: "Apex Tutoring Academy",
    title: "Senior Mathematics & Physics Faculty",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  STUDENT: {
    id: "usr_stud_1",
    name: "Alex Rivera",
    email: "alex.rivera@student.apex.edu",
    role: "STUDENT",
    academyName: "Apex Tutoring Academy",
    title: "Grade 10 - Science Stream",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
  PARENT: {
    id: "usr_parent_1",
    name: "David Rivera",
    email: "david.rivera@guardian.com",
    role: "PARENT",
    academyName: "Apex Tutoring Academy",
    title: "Parent of Alex Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginAsDemo: (role: UserRole) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USERS.ADMIN);

  useEffect(() => {
    // Check if saved user exists in localStorage
    const saved = localStorage.getItem("tutor_os_current_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        setUser(DEMO_USERS.ADMIN);
      }
    }
  }, []);

  const loginAsDemo = (role: UserRole) => {
    const selected = DEMO_USERS[role];
    setUser(selected);
    localStorage.setItem("tutor_os_current_user", JSON.stringify(selected));
  };

  const login = (email: string, role: UserRole) => {
    const demo = DEMO_USERS[role];
    const newUser: User = {
      ...demo,
      email,
      name: email.split("@")[0].replace(".", " "),
    };
    setUser(newUser);
    localStorage.setItem("tutor_os_current_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tutor_os_current_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginAsDemo,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
