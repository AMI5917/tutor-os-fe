// src/app/dashboard/teachers/page.tsx
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Phone, Edit, Eye, UserPlus, Calendar } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RegisterTeacherDialog } from "@/components/teachers/RegisterTeacherDialog";
import { TeacherStaff, EmploymentStatus, RoleType } from "@/types/teacher-staff";
import { getStoredTeacherStaff, seedMockTeacherStaff } from "@/lib/teacher-staff-data";
import { TeacherProfileDialog } from "@/components/teachers/TeacherProfileDialog";
import { useAcademicYear } from "@/lib/academic-year-context";

export default function TeachersPage() {
  const { selectedYear } = useAcademicYear();

  // State
  const [staff, setStaff] = React.useState<TeacherStaff[]>([]);
  const [search, setSearch] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("ALL");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [viewStaff, setViewStaff] = React.useState<TeacherStaff | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  // Load data on mount
  React.useEffect(() => {
    seedMockTeacherStaff();
    setStaff(getStoredTeacherStaff());
  }, []);

  const availableDepartments = React.useMemo(() => {
    const deps = Array.from(new Set(staff.map((s) => s.department)));
    return deps;
  }, [staff]);

  const filtered = React.useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search);
      const matchesYear = selectedYear === "ALL" || s.academicYear === selectedYear;
      const matchesDept = deptFilter === "ALL" || s.department === deptFilter;
      const matchesRole = roleFilter === "ALL" || s.role === roleFilter;
      return matchesSearch && matchesYear && matchesDept && matchesRole;
    });
  }, [staff, search, selectedYear, deptFilter, roleFilter]);

  const refresh = () => setStaff(getStoredTeacherStaff());

  return (
    <div className="space-y-6">
      {/* Add Dialog */}
      <RegisterTeacherDialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) refresh(); }} />

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teachers &amp; Staff Directory</h2>
          <p className="text-sm text-muted-foreground">
            Manage faculty profiles, assignments, and employment details.
          </p>
        </div>
        <Button variant="default" size="sm" onClick={() => setAddOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> Add Teacher / Staff
        </Button>
      </div>

      {/* Filters - Academic Year is handled globally from the top header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300">
          <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span>Academic Session: <strong className="font-semibold">{selectedYear === "ALL" ? "All Years" : selectedYear}</strong></span>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 text-xs" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Department"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {availableDepartments.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Role"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value={RoleType.TEACHER}>Teacher</SelectItem>
            <SelectItem value={RoleType.STAFF}>Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Department / Subject</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No staff found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.employeeId} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground">{s.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.employeeId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.designation}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.department}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-indigo-500" />{s.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <Badge variant={s.status === EmploymentStatus.ACTIVE ? "success" : "secondary"} className="text-[10px]">{s.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => setViewStaff(s)}><Eye className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4"/></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Dialog */}
      {viewStaff && (
        <TeacherProfileDialog staff={viewStaff} open={!!viewStaff} onOpenChange={(open) => { if (!open) setViewStaff(null); }} />
      )}
    </div>
  );
}
