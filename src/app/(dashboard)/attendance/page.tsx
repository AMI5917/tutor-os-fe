// src/app/(dashboard)/attendance/page.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { MOCK_TODAY_SESSIONS, MOCK_STUDENTS } from "@/lib/mock-data";

export default function AttendancePage() {
  const [selectedSession, setSelectedSession] = useState(MOCK_TODAY_SESSIONS[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const toggleAttendance = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const sessionStudents = MOCK_STUDENTS.slice(0, selectedSession.studentCount);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Attendance & Lesson Logs</h2>
        <p className="text-sm text-muted-foreground">
          Mark attendance for today's sessions and record lesson coverage.
        </p>
      </div>

      {/* Session Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Session</CardTitle>
          <CardDescription>Choose a class batch to mark attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_TODAY_SESSIONS.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedSession.id === session.id
                    ? "border-indigo-500 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30"
                    : "hover:border-indigo-300 dark:hover:border-indigo-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    [{session.batchCode}]
                  </span>
                  <Badge
                    variant={
                      session.status === "COMPLETED" ? "success" :
                      session.status === "IN_PROGRESS" ? "warning" : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {session.status}
                  </Badge>
                </div>
                <h4 className="mt-2 text-sm font-semibold truncate">{session.batchName}</h4>
                <p className="text-xs text-muted-foreground">{session.subject}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.timeSlot}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {session.studentCount}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Sheet — {selectedSession.batchCode}</CardTitle>
          <CardDescription>
            Mark each student as Present, Absent, Late, or Excused.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Standard</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {sessionStudents.map((student) => {
                  const currentStatus = attendance[student.id] || "";
                  return (
                    <tr key={student.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{student.standard}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleAttendance(student.id, "PRESENT")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                              currentStatus === "PRESENT"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50"
                                : "border-border hover:bg-muted/50"
                            }`}
                            title="Present"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleAttendance(student.id, "ABSENT")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                              currentStatus === "ABSENT"
                                ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/50"
                                : "border-border hover:bg-muted/50"
                            }`}
                            title="Absent"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleAttendance(student.id, "LATE")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                              currentStatus === "LATE"
                                ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/50"
                                : "border-border hover:bg-muted/50"
                            }`}
                            title="Late"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input placeholder="Remarks..." className="h-8 text-xs" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {Object.keys(attendance).length} of {sessionStudents.length} students marked
            </p>
            <Button size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">
              Save Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}