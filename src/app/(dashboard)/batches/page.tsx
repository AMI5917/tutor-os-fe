import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Users, Calendar, Clock } from "lucide-react";
import { MOCK_BATCHES } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function BatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Class Batch Segregation</h2>
          <p className="text-sm text-muted-foreground">
            Isolated class cohorts segregated by subject, grade level, and assigned teacher.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 bg-slate-900 text-white dark:bg-indigo-600">
          <Plus className="h-4 w-4" /> Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_BATCHES.map((batch) => {
          const occupancyPct = Math.round(
            (batch.enrolledStudents / batch.capacity) * 100
          );
          const isFull = batch.enrolledStudents >= batch.capacity;

          return (
            <Card key={batch.id} className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    [{batch.code}]
                  </span>
                  <Badge variant={isFull ? "destructive" : "success"} className="text-[10px]">
                    {isFull ? "CAPACITY FULL" : `${batch.capacity - batch.enrolledStudents} SEATS AVAILABLE`}
                  </Badge>
                </div>
                <CardTitle className="text-base pt-1">{batch.name}</CardTitle>
                <CardDescription className="text-xs">
                  Instructor: <strong className="text-foreground">{batch.teacherName}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Enrolled: {batch.enrolledStudents} / {batch.capacity}</span>
                    <span className="font-bold">{occupancyPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFull ? "bg-rose-500" : "bg-indigo-600"}`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {batch.scheduleDays}
                  </span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(batch.monthlyFee)}/mo
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
