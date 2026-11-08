// src/lib/academic-year-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const CANONICAL_ACADEMIC_YEARS = [
  "2026-2027",
  "2025-2026",
  "2024-2025",
] as const;

export type AcademicYearType = (typeof CANONICAL_ACADEMIC_YEARS)[number] | "ALL";

interface AcademicYearContextValue {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
  isCurrentSession: boolean;
}

const AcademicYearContext = createContext<AcademicYearContextValue>({
  selectedYear: "2026-2027",
  setSelectedYear: () => {},
  availableYears: [...CANONICAL_ACADEMIC_YEARS],
  isCurrentSession: true,
});

const STORAGE_KEY = "tutoros_global_academic_year_v1";
const DEFAULT_YEAR = "2026-2027";

export function AcademicYearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYearState] = useState<string>(DEFAULT_YEAR);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedYearState(stored);
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const setSelectedYear = (year: string) => {
    setSelectedYearState(year);
    try {
      localStorage.setItem(STORAGE_KEY, year);
    } catch {
      // ignore
    }
  };

  const isCurrentSession = selectedYear === DEFAULT_YEAR;

  return (
    <AcademicYearContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        availableYears: [...CANONICAL_ACADEMIC_YEARS],
        isCurrentSession,
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error("useAcademicYear must be used within an AcademicYearProvider");
  }
  return context;
}
