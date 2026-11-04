"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Layers, Plus, Users, Calendar } from "lucide-react";
import { MOCK_BATCHES, MOCK_STUDENTS, MOCK_TEACHERS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function BatchesPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [batchName, setBatchName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [batchDays, setBatchDays] = useState("ALL");
  const [selectedBatch, setSelectedBatch] = useState<(typeof MOCK_BATCHES)[number] | null>(null);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Class Batch "${batchName || "New Batch"}" created and isolated!`);
    setActiveModal(null);
    setBatchName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Class Batch Segregation</h2>
          <p className="text-sm text-muted-foreground">
            Isolated class cohorts segregated by subject, grade level, and assigned teacher.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-slate-900 text-white dark:bg-indigo-600"
          onClick={() => setActiveModal("batch")}
        >
          <Plus className="h-4 w-4" /> Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_BATCHES.map((batch) => {
          const occupancyPct = Math.round(
            (batch.enrolledStudents / batch.capacity) * 100
          );
          const isFull = batch.enrolledStudents >= batch.capacity;
          const remaining = batch.capacity - batch.enrolledStudents;

          return (
            <Card key={batch.id} className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    [{batch.code}]
                  </span>
                  <Badge variant={isFull ? "destructive" : "success"} className="text-[10px]">
                    {isFull ? "CAPACITY FULL" : `${remaining} SEATS AVAILABLE`}
                  </Badge>
                </div>
                <CardTitle className="text-base pt-1">{batch.name}</CardTitle>
                <CardDescription className="text-xs">
                  Subject: <strong className="text-foreground">{batch.subject}</strong>
                </CardDescription>
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

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 p-2">
                    <p className="text-muted-foreground">Paid</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(batch.paidAmount ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-md bg-rose-50 dark:bg-rose-950/30 p-2">
                    <p className="text-muted-foreground">Pending</p>
                    <p className="font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(batch.pendingAmount ?? 0)}
                    </p>
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

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => setSelectedBatch(batch)}
                >
                  <Users className="h-3.5 w-3.5" /> View Student List
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={activeModal === "batch"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Class Batch</DialogTitle>
            <DialogDescription>
              Segregate students into dedicated cohorts with an assigned teacher.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatch} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="batchTitle">Batch Name *</Label>
              <Input
                id="batchTitle"
                placeholder="e.g. Grade 11 Chemistry Weekend"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Chemistry" defaultValue="Chemistry" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxCap">Max Capacity</Label>
                <Input id="maxCap" type="number" defaultValue="15" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="batchDays">Batch Days</Label>
              <Select value={batchDays} onValueChange={setBatchDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Days (Mon–Sun)</SelectItem>
                  <SelectItem value="WEEKDAYS">Weekdays (Mon–Fri)</SelectItem>
                  <SelectItem value="WEEKEND">Weekend (Sat–Sun)</SelectItem>
                  <SelectItem value="MWF">Mon, Wed, Fri</SelectItem>
                  <SelectItem value="TTS">Tue, Thu, Sat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructor">Assigned Faculty Teacher</Label>
              <Select value={teacherName} onValueChange={setTeacherName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TEACHERS.map((t) => (
                    <SelectItem key={t.id} value={`${t.firstName} ${t.lastName}`}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">
                Create Batch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedBatch} onOpenChange={(open) => !open && setSelectedBatch(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Students in {selectedBatch?.name}</DialogTitle>
            <DialogDescription>
              {selectedBatch?.enrolledStudents} enrolled of {selectedBatch?.capacity} capacity.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-1 text-sm">
            {MOCK_STUDENTS.slice(0, selectedBatch?.enrolledStudents ?? 0).map((s) => (
              <li key={s.id} className="rounded-md border px-3 py-2">
                {s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
