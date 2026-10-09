import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock, Video, MapPin } from "lucide-react";
import { MOCK_TODAY_SESSIONS } from "@/lib/mock-data";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar & Schedule Engine</h2>
          <p className="text-sm text-muted-foreground">
            Multi-teacher, multi-batch timetable with conflict detection.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 bg-slate-900 text-white dark:bg-indigo-600">
          <Plus className="h-4 w-4" /> Book New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_TODAY_SESSIONS.map((sess) => (
          <Card key={sess.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-indigo-600 font-bold">
                    [{sess.batchCode}]
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {sess.timeSlot}
                  </span>
                  <Badge variant={sess.status === "COMPLETED" ? "success" : sess.status === "IN_PROGRESS" ? "warning" : "default"}>
                    {sess.status}
                  </Badge>
                </div>
                <h4 className="text-base font-semibold">{sess.batchName}</h4>
                <p className="text-xs text-muted-foreground">
                  Faculty: <strong className="text-foreground">{sess.teacherName}</strong> • {sess.studentCount} Students Enrolled
                </p>
              </div>

              <div className="flex items-center gap-2">
                {sess.meetingLink ? (
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs text-indigo-600 border-indigo-200">
                    <Video className="h-3.5 w-3.5" /> Launch Video Call
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-amber-500" /> Room 101
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
