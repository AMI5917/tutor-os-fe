"use client";

import React, { useState } from "react";
import { TodaySession } from "@/types/roles";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  Users,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export function TodayAgendaFeed({ sessions: initialSessions }: { sessions: TodaySession[] }) {
  const [sessions, setSessions] = useState<TodaySession[]>(initialSessions);

  const handleMarkAttendance = (id: string, batchName: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "COMPLETED" } : s))
    );
    toast.success(`Attendance marked complete for ${batchName}!`);
  };

  const handleJoinClass = (meetingLink?: string, batchName?: string) => {
    if (meetingLink) {
      window.open(meetingLink, "_blank");
      toast.info(`Joining virtual classroom for ${batchName}...`);
    } else {
      toast.info(`This is an offline classroom session in Room 101.`);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Today&apos;s Live Agenda
          </CardTitle>
          <CardDescription>
            Real-time batch timetable with 1-click classroom launch & attendance.
          </CardDescription>
        </div>

        <Badge variant="outline" className="text-xs font-semibold">
          {sessions.length} Sessions
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {sessions.map((session) => {
          const isCompleted = session.status === "COMPLETED";
          const isInProgress = session.status === "IN_PROGRESS";

          return (
            <div
              key={session.id}
              className={`group flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between ${
                isInProgress
                  ? "border-indigo-300 bg-indigo-50/40 dark:border-indigo-800 dark:bg-indigo-950/20 shadow-sm"
                  : isCompleted
                  ? "border-border/60 bg-muted/30 opacity-75"
                  : "border-border bg-card hover:border-border/80 hover:shadow-sm"
              }`}
            >
              {/* Left Column: Timing & Batch Info */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      isInProgress
                        ? "warning"
                        : isCompleted
                        ? "success"
                        : "info"
                    }
                    className="text-[11px] font-bold"
                  >
                    {isInProgress
                      ? "● LIVE NOW"
                      : isCompleted
                      ? "COMPLETED"
                      : "UPCOMING"}
                  </Badge>

                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    [{session.batchCode}]
                  </span>

                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3" />
                    {session.timeSlot}
                  </span>
                </div>

                <h4 className="text-sm font-semibold truncate text-foreground">
                  {session.batchName}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Instructor: <strong className="text-foreground">{session.teacherName}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {session.studentCount} Students
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {session.meetingLink ? (
                      <>
                        <Video className="h-3.5 w-3.5 text-indigo-500" />
                        {session.roomOrPlatform}
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3.5 w-3.5 text-amber-500" />
                        {session.roomOrPlatform}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                {session.meetingLink && !isCompleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50"
                    onClick={() => handleJoinClass(session.meetingLink, session.batchName)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Join Class
                  </Button>
                )}

                {!isCompleted ? (
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    onClick={() => handleMarkAttendance(session.id, session.batchName)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Attendance
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                    Attendance Logged
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
