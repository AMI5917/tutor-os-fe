// src/app/dashboard/batches/page.tsx
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Layers, Plus, Users, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ClassBatch, BatchStatus } from "@/types/class-batch";
import { getStoredClassBatches, seedMockBatches } from "@/lib/class-batch-data";
import { RegisterBatchDialog } from "@/components/batches/RegisterBatchDialog";
import { MOCK_STUDENTS } from "@/lib/mock-data";
import { useAcademicYear } from "@/lib/academic-year-context";

export default function BatchesPage() {
  const { selectedYear } = useAcademicYear();

  // State
  const [batches, setBatches] = React.useState<ClassBatch[]>([]);
  const [activeModal, setActiveModal] = React.useState<string | null>(null); // "register"
  const [selectedBatch, setSelectedBatch] = React.useState<ClassBatch | null>(null);
  const [filterClass, setFilterClass] = React.useState<string>('ALL');
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');

  // Load data on mount
  React.useEffect(() => {
    seedMockBatches();
    setBatches(getStoredClassBatches());
  }, []);

  const availableClasses = React.useMemo(() => {
    const classes = Array.from(new Set(batches.map(b => b.className)));
    return classes;
  }, [batches]);

  const filteredBatches = React.useMemo(() => {
    return batches.filter(b => {
      const yr = selectedYear === 'ALL' || b.academicYear === selectedYear;
      const cl = filterClass === 'ALL' || b.className === filterClass;
      const st = filterStatus === 'ALL' || b.status === filterStatus;
      return yr && cl && st;
    });
  }, [batches, selectedYear, filterClass, filterStatus]);

  const refresh = () => setBatches(getStoredClassBatches());

  // Render
  return (
    <div className="space-y-6">
      {/* Register Batch Dialog */}
      <RegisterBatchDialog open={activeModal === "register"} onOpenChange={(open) => { if (!open) setActiveModal(null); refresh(); }} />

      {/* Filter Bar - Academic Year is handled globally from the top header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300">
            <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Academic Session: <strong className="font-semibold">{selectedYear === "ALL" ? "All Years" : selectedYear}</strong></span>
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Class"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {availableClasses.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Status"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value={BatchStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={BatchStatus.INACTIVE}>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={() => setActiveModal("register")} className="gap-1.5 bg-slate-900 text-white dark:bg-indigo-600">
          <Plus className="h-4 w-4"/> New Batch
        </Button>
      </div>

      {/* Batch Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBatches.map(batch => {
          const occupancyPct = Math.round((batch.studentIds.length / batch.capacity) * 100);
          const isFull = batch.studentIds.length >= batch.capacity;
          const remaining = batch.capacity - batch.studentIds.length;
          return (
            <Card key={batch.batchId} className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">[{batch.batchId}]</span>
                  <Badge variant={isFull ? "destructive" : "success"} className="text-[10px]">
                    {isFull ? "CAPACITY FULL" : `${remaining} SEATS AVAILABLE`}
                  </Badge>
                </div>
                <CardTitle className="text-base pt-1">{batch.batchName}</CardTitle>
                <CardDescription className="text-xs">
                  Class: <strong className="text-foreground">{batch.className}</strong>
                </CardDescription>
                <CardDescription className="text-xs">
                  Teacher: <strong className="text-foreground">{batch.assignedTeacherId}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Enrolled: {batch.studentIds.length} / {batch.capacity}</span>
                  <span className="font-bold">{occupancyPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${isFull ? "bg-rose-500" : "bg-indigo-600"}`} style={{ width: `${occupancyPct}%` }} />
                </div>
                <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {batch.startDate} – {batch.endDate}
                  </span>
                  <span className="font-bold text-foreground">{batch.status}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" onClick={() => setSelectedBatch(batch)}>
                  <Users className="h-3.5 w-3.5" /> View Student List
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Student List Dialog */}
      <Dialog open={!!selectedBatch} onOpenChange={(open) => { if (!open) setSelectedBatch(null); }}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Students in {selectedBatch?.batchName}</DialogTitle>
    </DialogHeader>
    <div className="max-h-[60vh] overflow-y-auto">
      <ul className="space-y-1 text-sm">
        {selectedBatch?.studentIds.map(id => {
          const s = MOCK_STUDENTS.find(st => st.id === id);
          if (!s) return null;
          return (
            <li key={id} className="border-b pb-1">
              {s.firstName} {s.lastName} – {s.id} – {s.parentPhone}
            </li>
          );
        })}
        {selectedBatch?.studentIds.length === 0 && (
          <li className="text-muted-foreground">No students assigned.</li>
        )}
      </ul>
    </div>
    <DialogFooter>
      <Button size="sm" variant="outline" onClick={() => setSelectedBatch(null)}>
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}
