// src/app/(dashboard)/teachers/page.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Phone, Edit, Mail } from "lucide-react";
import { AddTeacherDialog } from "@/components/forms/AddTeacherDialog";
import { MOCK_TEACHERS } from "@/lib/mock-data";
import { Teacher } from "@/types/roles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const handleAddTeacher = (teacher: Teacher) => {
    setTeachers((prev) => [...prev, teacher]);
  };

  const handleUpdateTeacher = (updated: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTeacher(null);
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((t) => {
    const fullName = `${t.firstName} ${t.middleName || ""} ${t.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      t.subjectSpecialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mobileNumber.includes(searchQuery);
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teachers & Staff Directory</h2>
          <p className="text-sm text-muted-foreground">
            Manage faculty profiles, subject specializations, compensation models, and batch allocations.
          </p>
        </div>
        <AddTeacherDialog onAdd={handleAddTeacher} />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by name, subject, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Teacher Name</th>
                <th className="px-4 py-3">Subject Specialization</th>
                <th className="px-4 py-3">Qualification</th>
                <th className="px-4 py-3">Rate Model</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No teachers found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {t.firstName} {t.middleName ? t.middleName + " " : ""}{t.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.subjectSpecialization}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.qualification || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {t.rateType} @ ₹{t.rateAmount}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-indigo-500" />
                        <span>{t.mobileNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          t.status === "ACTIVE" ? "success" :
                          t.status === "INACTIVE" ? "secondary" : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTeacher(t)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Teacher Dialog */}
      {editingTeacher && (
        <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
              <DialogDescription>Update the teacher details and save.</DialogDescription>
            </DialogHeader>
            <AddTeacherDialog
              initialTeacher={editingTeacher}
              onAdd={handleAddTeacher}
              onUpdate={handleUpdateTeacher}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
