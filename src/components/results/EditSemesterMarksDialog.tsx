// src/components/results/EditSemesterMarksDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  SemesterResult,
  SubjectScore,
  SemesterStatus,
} from "@/types/results";
import {
  calculateGradeAndGPA,
  updateStudentSemesterResult,
} from "@/lib/results-data";
import {
  Edit3,
  Award,
  CheckCircle2,
  Plus,
  Trash2,
  BookOpen,
} from "lucide-react";

interface EditSemesterMarksDialogProps {
  result: SemesterResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResultUpdated: (updated: SemesterResult) => void;
}

export function EditSemesterMarksDialog({
  result,
  open,
  onOpenChange,
  onResultUpdated,
}: EditSemesterMarksDialogProps) {
  const [scores, setScores] = useState<SubjectScore[]>([]);
  const [status, setStatus] = useState<SemesterStatus>("PUBLISHED");
  const [remarks, setRemarks] = useState<string>("");

  useEffect(() => {
    if (result) {
      setScores(JSON.parse(JSON.stringify(result.scores)));
      setStatus(result.status);
      setRemarks(result.teacherRemarks || "");
    }
  }, [result, open]);

  if (!result) return null;

  // Handle score change for an existing subject
  const handleScoreChange = (
    index: number,
    field: "theoryMarks" | "practicalMarks" | "subjectName",
    val: string | number
  ) => {
    const updated = [...scores];
    const target = { ...updated[index] };

    if (field === "subjectName") {
      target.subjectName = String(val);
    } else {
      const numVal = Math.max(0, Number(val) || 0);
      if (field === "theoryMarks") target.theoryMarks = numVal;
      if (field === "practicalMarks") target.practicalMarks = numVal;

      target.totalMarks = target.theoryMarks + target.practicalMarks;
      const calc = calculateGradeAndGPA(target.totalMarks, target.maxMarks);
      target.percentage = calc.percentage;
      target.grade = calc.grade;
      target.gpaPoint = calc.gpaPoint;
    }

    updated[index] = target;
    setScores(updated);
  };

  // Add new subject
  const handleAddSubject = () => {
    const newSub: SubjectScore = {
      id: `custom_${Date.now()}`,
      subjectName: "New Subject",
      subjectCode: `SUB-${scores.length + 1}`,
      maxMarks: 100,
      theoryMarks: 70,
      practicalMarks: 20,
      totalMarks: 90,
      percentage: 90,
      grade: "A+",
      gpaPoint: 4.0,
      feedback: "Active engagement in classroom exercises.",
    };
    setScores([...scores, newSub]);
  };

  // Remove subject
  const handleRemoveSubject = (index: number) => {
    if (scores.length <= 1) {
      toast.error("At least one subject score must remain.");
      return;
    }
    setScores(scores.filter((_, i) => i !== index));
  };

  // Computed totals for instant preview
  const liveTotalScored = scores.reduce((sum, s) => sum + s.totalMarks, 0);
  const liveMaxTotal = scores.reduce((sum, s) => sum + s.maxMarks, 0);
  const livePercentage =
    liveMaxTotal > 0 ? Math.round((liveTotalScored / liveMaxTotal) * 1000) / 10 : 0;
  const liveGpa =
    scores.length > 0
      ? Math.round(
          (scores.reduce((sum, s) => sum + s.gpaPoint, 0) / scores.length) * 10
        ) / 10
      : 0;
  const liveGrade = calculateGradeAndGPA(livePercentage, 100).grade;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = updateStudentSemesterResult({
      resultId: result.id,
      scores,
      teacherRemarks: remarks.trim() || undefined,
      status,
    });

    if (updated) {
      toast.success(`Academic results updated for ${result.studentName}!`);
      onResultUpdated(updated);
      onOpenChange(false);
    } else {
      toast.error("Failed to update semester marks.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Update Semester Marks & Progress</span>
          </DialogTitle>
          <DialogDescription>
            Edit subject marks, grades, status, and remarks for <strong>{result.studentName}</strong> (
            {result.batchCode}) in <strong>{result.semesterName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Live Aggregates Header */}
        <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-center my-1">
          <div>
            <span className="text-slate-500 block">Total Marks</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {liveTotalScored} / {liveMaxTotal}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Percentage</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {livePercentage}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">GPA (4.0)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {liveGpa}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Overall Grade</span>
            <Badge variant="outline" className="font-bold text-xs bg-white dark:bg-slate-900 mt-0.5">
              {liveGrade}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Semester Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs font-semibold">
              Semester Result Status
            </Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as SemesterStatus)}
            >
              <SelectTrigger id="status" className="h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLISHED">Published (Official Record)</SelectItem>
                <SelectItem value="DRAFT">Draft (Under Review)</SelectItem>
                <SelectItem value="UNDER_REVIEW">Needs Retest / Moderation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject Scores Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>Subject-wise Marks & Scores</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubject}
                className="h-7 text-xs px-2 gap-1"
              >
                <Plus className="h-3 w-3" /> Add Subject
              </Button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b">
                  <tr>
                    <th className="py-2 px-3">Subject Name</th>
                    <th className="py-2 px-2 text-center w-20">Theory (70)</th>
                    <th className="py-2 px-2 text-center w-20">Practical (30)</th>
                    <th className="py-2 px-2 text-center w-16">Total</th>
                    <th className="py-2 px-2 text-center w-14">Grade</th>
                    <th className="py-2 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scores.map((sub, idx) => (
                    <tr key={sub.id || idx}>
                      <td className="py-2 px-3">
                        <Input
                          value={sub.subjectName}
                          onChange={(e) =>
                            handleScoreChange(idx, "subjectName", e.target.value)
                          }
                          className="h-7 text-xs font-medium"
                          required
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={sub.theoryMarks}
                          onChange={(e) =>
                            handleScoreChange(idx, "theoryMarks", e.target.value)
                          }
                          className="h-7 text-xs text-center font-mono"
                          required
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={sub.practicalMarks}
                          onChange={(e) =>
                            handleScoreChange(idx, "practicalMarks", e.target.value)
                          }
                          className="h-7 text-xs text-center font-mono"
                          required
                        />
                      </td>
                      <td className="py-2 px-2 text-center font-bold font-mono">
                        {sub.totalMarks}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-bold"
                        >
                          {sub.grade}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove subject"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks and Feedback */}
          <div className="space-y-1.5">
            <Label htmlFor="remarks" className="text-xs font-semibold">
              Teacher Remarks & Constructive Feedback
            </Label>
            <Textarea
              id="remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Demonstrates exceptional problem-solving in mathematics..."
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Save Results & Recompute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
