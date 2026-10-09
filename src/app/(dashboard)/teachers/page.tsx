// src/app/(dashboard)/teachers/page.tsx
"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddTeacherDialog } from "@/components/forms/AddTeacherDialog"
import { MOCK_TEACHERS } from "@/lib/mock-data"
import { Teacher } from "@/types/roles"

export default function TeachersPage() {
  const [teachers, setTeachers] = React.useState<Teacher[]>(MOCK_TEACHERS)
  const [editingTeacher, setEditingTeacher] = React.useState<Teacher | null>(null)

  const handleAddTeacher = (teacher: Teacher) => {
    setTeachers((prev) => [...prev, teacher])
  }

  const handleUpdateTeacher = (updated: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setEditingTeacher(null)
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teachers &amp; Staff</h1>
        <AddTeacherDialog onAdd={handleAddTeacher} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p className="text-muted-foreground">No teachers added yet.</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-2 py-1">Name</th>
                  <th className="text-left px-2 py-1">Subject</th>
                  <th className="text-left px-2 py-1">Rate</th>
                  <th className="text-left px-2 py-1">Mobile</th>
                  <th className="text-left px-2 py-1">Status</th>
                  <th className="text-left px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="px-2 py-1">
                      <span className="font-medium">
                        {t.firstName} {t.middleName ? t.middleName + " " : ""}{t.lastName}
                      </span>
                    </td>
                    <td className="px-2 py-1">{t.subjectSpecialization}</td>
                    <td className="px-2 py-1">{t.rateType} @ ₹{t.rateAmount}</td>
                    <td className="px-2 py-1">{t.mobileNumber}</td>
                    <td className="px-2 py-1">{t.status}</td>
                    <td className="px-2 py-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingTeacher(t)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {editingTeacher && (
        <AddTeacherDialog
          initialTeacher={editingTeacher}
          onAdd={handleAddTeacher}
          onUpdate={handleUpdateTeacher}
        />
      )}
    </div>
  )
}
