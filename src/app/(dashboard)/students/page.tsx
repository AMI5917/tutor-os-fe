// src/app/(dashboard)/students/page.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, Phone, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddStudentDialog, type Student as DialogStudent } from "@/components/forms/AddStudentDialog";
import { MOCK_STUDENTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export interface Student {
  id: string;
  name: string;
  grade: string;
  enrollmentType: string;
  subjects: string[];
  monthlyFee: number;
  guardianName: string;
  guardianPhone: string;
  status: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(() =>
    MOCK_STUDENTS.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`.trim(),
      grade: s.standard.startsWith("Grade") ? s.standard : `Grade ${s.standard}`,
      enrollmentType: s.enrollmentType === "ALL" ? "FULL_BUNDLE" : "MODULAR",
      subjects: s.enrollmentType === "ALL" ? ["All Subjects (Bundle)"] : (s.subjects.length ? s.subjects : ["General"]),
      monthlyFee: s.fee,
      guardianName: `${s.lastName} Family`,
      guardianPhone: s.parentPhone,
      status: s.status,
    }))
  );

  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleAdd = (data: DialogStudent) => {
    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ");
    const subs = data.enrollmentType === "all"
      ? ["All Subjects (Bundle)"]
      : data.subjects
        ? data.subjects.split(",").map((s) => s.trim()).filter(Boolean)
        : ["General"];
    const newStudent: Student = {
      id: data.id || `s-${Date.now()}`,
      name: fullName || "New Student",
      grade: data.standard ? (data.standard.startsWith("Grade") ? data.standard : `Grade ${data.standard}`) : "Grade 10",
      enrollmentType: data.enrollmentType === "all" ? "FULL_BUNDLE" : "MODULAR",
      subjects: subs.length > 0 ? subs : ["General"],
      monthlyFee: data.fee || 250,
      guardianName: `${data.lastName || "Family"} Guardian`,
      guardianPhone: data.parentPhone || "+1 (555) 000-0000",
      status: (data.status || "active").toUpperCase(),
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleUpdate = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditOpen(false);
    setEditStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Directory & Subject Enrollment</h2>
          <p className="text-sm text-muted-foreground">
            Manage students with flexible enrollment (All-Subjects Bundle vs. Modular 1–2 Subjects).
          </p>
        </div>
        {/* Add Student button using the reusable dialog component */}
        <AddStudentDialog onAdd={handleAdd} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filter by name, subject, or guardian..." className="h-9 pl-9 text-xs" />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Grade Level</th>
                <th className="px-4 py-3">Enrollment Mode</th>
                <th className="px-4 py-3">Enrolled Subjects</th>
                <th className="px-4 py-3">Monthly Tuition</th>
                <th className="px-4 py-3">Parent Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.grade}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.enrollmentType === "FULL_BUNDLE" ? "default" : "secondary"} className="text-[10px]">
                      {s.enrollmentType === "FULL_BUNDLE" ? "All Subjects (Bundle)" : "Modular (1–2 Subj)"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.subjects.map((sub) => (
                        <span key={sub} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground">{formatCurrency(s.monthlyFee)}/mo</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-indigo-500" />
                      <span>{s.guardianPhone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="success" className="text-[10px]">{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => { setEditStudent(s); setEditOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Student Dialog */}
      {editStudent && (
        <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditStudent(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update the student details and save.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fd = new FormData(form);
                const firstName = (fd.get("firstName") as string) || "";
                const lastName = (fd.get("lastName") as string) || "";
                const fullName = `${firstName} ${lastName}`.trim();
                const standard = (fd.get("standard") as string) || editStudent.grade;
                const enrollmentType = (fd.get("enrollmentType") as string) || "all";
                const subStr = (fd.get("subjects") as string) || "";
                const fee = Number(fd.get("fee")) || editStudent.monthlyFee;
                const parentPhone = (fd.get("parentPhone") as string) || editStudent.guardianPhone;
                const status = (fd.get("status") as string) || editStudent.status;

                const updated: Student = {
                  id: editStudent.id,
                  name: fullName || editStudent.name,
                  grade: standard,
                  enrollmentType: enrollmentType === "all" ? "FULL_BUNDLE" : "MODULAR",
                  subjects: enrollmentType === "all"
                    ? ["All Subjects (Bundle)"]
                    : subStr
                      ? subStr.split(",").map((s) => s.trim()).filter(Boolean)
                      : editStudent.subjects,
                  monthlyFee: fee,
                  guardianName: editStudent.guardianName,
                  guardianPhone: parentPhone,
                  status: status.toUpperCase(),
                };
                handleUpdate(updated);
              }}
              className="space-y-4 py-2"
            >
              {/* Name fields */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="firstName">First Name *</label>
                  <Input id="firstName" name="firstName" defaultValue={editStudent.name.split(' ')[0]} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="middleName">Middle Name</label>
                  <Input id="middleName" name="middleName" defaultValue="" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="lastName">Last Name *</label>
                  <Input id="lastName" name="lastName" defaultValue={editStudent.name.split(' ')[1] || ""} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="parentPhone">Parent WhatsApp / Phone *</label>
                <Input id="parentPhone" name="parentPhone" defaultValue={editStudent.guardianPhone} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="standard">Standard *</label>
                <Select defaultValue={editStudent.grade} onValueChange={() => {}} name="standard">
                  <SelectTrigger id="standard">
                    <SelectValue placeholder="Select standard" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const std = `${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}`;
                      return (
                        <SelectItem key={i} value={std}>
                          {std}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="enrollmentType">Tuition Enrollment Type *</label>
                <Select defaultValue={editStudent.enrollmentType} name="enrollmentType">
                  <SelectTrigger id="enrollmentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects (Bundle)</SelectItem>
                    <SelectItem value="single">Single Subject</SelectItem>
                    <SelectItem value="specific">Specific Subjects (multiple)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/** Subjects field – show when not "all" */}
              {(editStudent.enrollmentType !== "all") && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="subjects">Subject(s) (comma separated)</label>
                  <Input id="subjects" name="subjects" defaultValue={editStudent.subjects.join(", ")} />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="fee">Fees (₹) *</label>
                <Input id="fee" name="fee" type="number" min="0" defaultValue={editStudent.monthlyFee} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="status">Status *</label>
                <Select defaultValue={editStudent.status.toLowerCase()} name="status">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">
                  Update Student
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
