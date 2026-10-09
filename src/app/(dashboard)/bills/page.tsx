// src/app/(dashboard)/bills/page.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MOCK_STUDENTS } from "@/lib/mock-data";
import { Student } from "@/types/roles";
import EditStudentBillingDialog from "@/components/forms/EditStudentBillingDialog";

export default function BillsPage() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleUpdate = (updated: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Student Fee Overview
          </CardTitle>
          <CardDescription>
            Monthly tuition fees for all enrolled students. Edit to mark payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-4 py-2 text-left">Student Name</th>
                  <th className="px-4 py-2 text-left">Monthly Fee</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-4 py-2">{formatCurrency(s.fee)}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={s.paymentStatus === "PAID" ? "success" : "warning"}
                      >
                        {s.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingStudent(s)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingStudent && (
        <EditStudentBillingDialog
          student={editingStudent}
          onUpdate={handleUpdate}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
}
