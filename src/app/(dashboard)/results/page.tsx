import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Printer, Plus, CheckCircle2 } from "lucide-react";

export default function ResultsPage() {
  const semesterResults = [
    {
      id: "res_1",
      studentName: "Alex Rivera",
      semester: "Semester 1 (Fall 2026)",
      enrolledSubjectsCount: 2,
      scores: [
        { subject: "Mathematics", marks: 94, max: 100, grade: "A+" },
        { subject: "Physics", marks: 88, max: 100, grade: "A" },
      ],
      gpa: "3.9 / 4.0",
      percentage: "91.0%",
      overallGrade: "A+",
      status: "PUBLISHED",
    },
    {
      id: "res_2",
      studentName: "Sophia Zhang",
      semester: "Semester 1 (Fall 2026)",
      enrolledSubjectsCount: 4,
      scores: [
        { subject: "Mathematics", marks: 98, max: 100, grade: "A+" },
        { subject: "Physics", marks: 92, max: 100, grade: "A" },
        { subject: "Chemistry", marks: 90, max: 100, grade: "A" },
        { subject: "Biology", marks: 95, max: 100, grade: "A+" },
      ],
      gpa: "4.0 / 4.0",
      percentage: "93.7%",
      overallGrade: "A+",
      status: "PUBLISHED",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Semester Results & Report Cards</h2>
          <p className="text-sm text-muted-foreground">
            Academic grading computed strictly over each student&apos;s enrolled subjects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Printer className="h-4 w-4" /> Bulk Print Report Cards
          </Button>
          <Button size="sm" className="gap-1.5 bg-slate-900 text-white dark:bg-indigo-600">
            <Plus className="h-4 w-4" /> Enter Exam Marks
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {semesterResults.map((res) => (
          <Card key={res.id} className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-semibold text-indigo-600 border-indigo-200">
                  {res.semester}
                </Badge>
                <Badge variant="success" className="text-[10px]">
                  {res.status}
                </Badge>
              </div>
              <CardTitle className="text-lg pt-1">{res.studentName}</CardTitle>
              <CardDescription className="text-xs">
                Evaluated across {res.enrolledSubjectsCount} enrolled subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                {res.scores.map((sc) => (
                  <div key={sc.subject} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{sc.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">{sc.marks}/{sc.max}</span>
                      <Badge variant="default" className="text-[10px] h-5 px-1.5">
                        {sc.grade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Overall GPA: </span>
                  <strong className="font-mono text-foreground font-bold">{res.gpa}</strong>
                  <span className="text-muted-foreground ml-2">({res.percentage})</span>
                </div>

                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-indigo-200">
                  <Download className="h-3.5 w-3.5 text-indigo-600" />
                  PDF Report Card
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


