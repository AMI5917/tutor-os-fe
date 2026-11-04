// src/components/students/RegisterStudentDialog.tsx
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MOCK_BATCHES } from "@/lib/mock-data";
import {
  AVAILABLE_SUBJECTS,
  generateNextStudentId,
  registerNewStudent,
  ACADEMIC_YEAR_OPTIONS,
} from "@/lib/student-directory-data";
import {
  DirectoryStudent,
  EnrollmentMode,
  StudentGuardian,
  StudentAddress,
} from "@/types/student-directory";
import {
  UserPlus,
  User,
  ShieldCheck,
  MapPin,
  BookOpen,
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

interface RegisterStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentRegistered: (newStudent: DirectoryStudent) => void;
}

export function RegisterStudentDialog({
  open,
  onOpenChange,
  onStudentRegistered,
}: RegisterStudentDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");

  // Basic Info
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("2010-05-15");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Academic Assignment
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [batchId, setBatchId] = useState("bat_1");
  const [standard, setStandard] = useState("10th");

  // Dynamic Student ID Preview
  const [previewId, setPreviewId] = useState("");

  useEffect(() => {
    if (open) {
      setPreviewId(generateNextStudentId(academicYear));
    }
  }, [academicYear, open]);

  // Guardian Details
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState<StudentGuardian["relationship"]>("Father");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianOccupation, setGuardianOccupation] = useState("");

  // Address
  const [street, setStreet] = useState("45, MG Road, Central Block");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560001");

  // Subject Enrollment
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>("MODULAR");
  const [selectedSubjectCodes, setSelectedSubjectCodes] = useState<string[]>(["MATH", "PHYS"]);
  const [monthlyFee, setMonthlyFee] = useState<number>(3400);

  // Avatar selector
  const avatarSeeds = ["Alex", "Aarav", "Meera", "Rohan", "Ananya", "Vikram", "Sneha", "Karan"];
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState("Alex");

  // Documents
  const [uploadedDocs, setUploadedDocs] = useState<{
    birthCert: boolean;
    prevMarksheet: boolean;
    idProof: boolean;
  }>({
    birthCert: true,
    prevMarksheet: true,
    idProof: false,
  });

  // Auto-calculate fee when subjects or enrollment mode change
  useEffect(() => {
    if (enrollmentMode === "FULL_BUNDLE") {
      setMonthlyFee(4500);
    } else {
      const calculated = selectedSubjectCodes.reduce((sum, code) => {
        const sub = AVAILABLE_SUBJECTS.find((s) => s.code === code);
        return sum + (sub ? sub.defaultMonthlyFee : 1500);
      }, 0);
      setMonthlyFee(calculated);
    }
  }, [selectedSubjectCodes, enrollmentMode]);

  const toggleSubject = (code: string) => {
    if (selectedSubjectCodes.includes(code)) {
      if (selectedSubjectCodes.length === 1) {
        toast.error("At least one subject must be enrolled.");
        return;
      }
      setSelectedSubjectCodes(selectedSubjectCodes.filter((c) => c !== code));
    } else {
      setSelectedSubjectCodes([...selectedSubjectCodes, code]);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setGuardianName("");
    setGuardianPhone("");
    setGuardianEmail("");
    setSelectedSubjectCodes(["MATH", "PHYS"]);
    setEnrollmentMode("MODULAR");
    setActiveTab("personal");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please provide student first and last name.");
      setActiveTab("personal");
      return;
    }

    if (!guardianName.trim() || !guardianPhone.trim()) {
      toast.error("Please provide guardian name and contact number.");
      setActiveTab("guardian");
      return;
    }

    if (selectedSubjectCodes.length === 0) {
      toast.error("Please select at least one enrolled subject.");
      setActiveTab("subjects");
      return;
    }

    const docs = [];
    if (uploadedDocs.birthCert) {
      docs.push({
        name: "Birth Certificate",
        type: "BIRTH_CERTIFICATE" as const,
        fileName: `${firstName.toLowerCase()}_birth_certificate.pdf`,
      });
    }
    if (uploadedDocs.prevMarksheet) {
      docs.push({
        name: "Previous School Marksheet",
        type: "PREVIOUS_MARKSHEET" as const,
        fileName: `${firstName.toLowerCase()}_previous_marksheet.pdf`,
      });
    }
    if (uploadedDocs.idProof) {
      docs.push({
        name: "Government ID / Aadhar Card",
        type: "ID_PROOF" as const,
        fileName: `${firstName.toLowerCase()}_id_proof.pdf`,
      });
    }

    const newStudent = registerNewStudent({
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.apex.edu`,
      phone: phone.trim() || "+91 98000 00000",
      standard,
      academicYear,
      batchId,
      enrollmentMode,
      subjectCodes: selectedSubjectCodes,
      monthlyFee,
      guardian: {
        name: guardianName.trim(),
        relationship: guardianRelationship,
        phone: guardianPhone.trim(),
        email: guardianEmail.trim() || `parent.${lastName.toLowerCase()}@gmail.com`,
        occupation: guardianOccupation.trim() || undefined,
      },
      address: {
        street,
        city,
        state,
        postalCode,
      },
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatarSeed}`,
      documents: docs,
      notes: "Newly enrolled student through directory registration portal.",
    });

    toast.success(`Student ${newStudent.fullName} registered with ID ${newStudent.studentId}!`);
    onStudentRegistered(newStudent);
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <span>Register New Student</span>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono text-xs">
                    {previewId || "Generating ID..."}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Enrolling student into Academic Session {academicYear} with institutional ID assignment.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-10 p-1 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="personal" className="text-xs flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>1. Student</span>
              </TabsTrigger>
              <TabsTrigger value="guardian" className="text-xs flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>2. Guardian</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>3. Subjects & Batch</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>4. Documents</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Student Personal Details */}
            <TabsContent value="personal" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-xs font-semibold">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="e.g. Alex"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (e.target.value) setSelectedAvatarSeed(e.target.value);
                    }}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="middleName" className="text-xs">Middle Name</Label>
                  <Input
                    id="middleName"
                    placeholder="Optional"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-xs font-semibold">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="e.g. Rivera"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="dob" className="text-xs font-semibold">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Gender *</Label>
                  <Select value={gender} onValueChange={(v: "Male" | "Female" | "Other") => setGender(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="std" className="text-xs font-semibold">Grade / Standard *</Label>
                  <Select value={standard} onValueChange={setStandard}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8th">Grade 8 (8th Standard)</SelectItem>
                      <SelectItem value="9th">Grade 9 (9th Standard)</SelectItem>
                      <SelectItem value="10th">Grade 10 (10th Standard)</SelectItem>
                      <SelectItem value="11th">Grade 11 (11th Standard)</SelectItem>
                      <SelectItem value="12th">Grade 12 (12th Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="studentEmail" className="text-xs">Student Email</Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="studentPhone" className="text-xs">Student Mobile Phone</Label>
                  <Input
                    id="studentPhone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900 space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Choose Profile Avatar / Photo</span>
                </Label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {avatarSeeds.map((seed) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    const isSelected = selectedAvatarSeed.toLowerCase() === seed.toLowerCase();
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setSelectedAvatarSeed(seed)}
                        className={`h-11 w-11 rounded-full p-0.5 border-2 transition-all flex-shrink-0 ${
                          isSelected ? "border-indigo-600 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={avatarUrl} alt={seed} className="h-full w-full rounded-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="button" size="sm" onClick={() => setActiveTab("guardian")}>
                  Next: Guardian Details →
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: Guardian & Address Details */}
            <TabsContent value="guardian" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="gName" className="text-xs font-semibold">Guardian / Parent Full Name *</Label>
                  <Input
                    id="gName"
                    placeholder="e.g. Ramesh Rivera"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Relationship *</Label>
                  <Select value={guardianRelationship} onValueChange={(v: StudentGuardian["relationship"]) => setGuardianRelationship(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Guardian">Legal Guardian</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="gPhone" className="text-xs font-semibold">Guardian Phone Number *</Label>
                  <Input
                    id="gPhone"
                    placeholder="+91 98234 56780"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gEmail" className="text-xs">Guardian Email</Label>
                  <Input
                    id="gEmail"
                    type="email"
                    placeholder="guardian@example.com"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gOcc" className="text-xs">Occupation / Profession</Label>
                  <Input
                    id="gOcc"
                    placeholder="e.g. Software Architect"
                    value={guardianOccupation}
                    onChange={(e) => setGuardianOccupation(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="border-t pt-3 border-slate-200 dark:border-slate-800 space-y-3">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Residential Address</span>
                </Label>
                <div className="space-y-1">
                  <Label htmlFor="street" className="text-xs">Street Address</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="city" className="text-xs">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="state" className="text-xs">State</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pin" className="text-xs">PIN / Postal Code</Label>
                    <Input id="pin" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="h-9 text-xs" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("personal")}>
                  ← Back
                </Button>
                <Button type="button" size="sm" onClick={() => setActiveTab("subjects")}>
                  Next: Subjects & Batch →
                </Button>
              </div>
            </TabsContent>

            {/* TAB 3: Batch Assignment & Subject Enrollment */}
            <TabsContent value="subjects" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Academic Year *</span>
                  </Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger className="h-9 text-xs font-medium">
                      <SelectValue placeholder="Select Academic Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEAR_OPTIONS.map((y) => (
                        <SelectItem key={y.value} value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Batch Assignment *</span>
                  </Label>
                  <Select value={batchId} onValueChange={setBatchId}>
                    <SelectTrigger className="h-9 text-xs font-medium">
                      <SelectValue placeholder="Assign Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_BATCHES.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.code} — {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Subject Enrollment Plan</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={enrollmentMode === "MODULAR" ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => setEnrollmentMode("MODULAR")}
                    >
                      Modular (1-2 Subjects)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={enrollmentMode === "FULL_BUNDLE" ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => {
                        setEnrollmentMode("FULL_BUNDLE");
                        setSelectedSubjectCodes(["MATH", "PHYS", "CHEM", "BIOL"]);
                      }}
                    >
                      All Subjects Bundle
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {AVAILABLE_SUBJECTS.map((sub) => {
                    const isSelected = selectedSubjectCodes.includes(sub.code);
                    return (
                      <div
                        key={sub.code}
                        onClick={() => toggleSubject(sub.code)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-foreground">{sub.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {sub.code}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{sub.facultyTeacher}</p>
                          <p className="text-[10px] text-slate-500">{sub.scheduleDays}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                            ₹{sub.defaultMonthlyFee}
                          </span>
                          <div className="mt-1 flex justify-end">
                            <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                              isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                            }`}>
                              {isSelected && <CheckCircle2 className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <div>
                    <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                      Total Monthly Tuition Fee:
                    </span>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                      {enrollmentMode === "FULL_BUNDLE"
                        ? "Special discounted bundled curriculum rate applied"
                        : `${selectedSubjectCodes.length} modular subject(s) selected`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">₹</span>
                    <Input
                      type="number"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value) || 0)}
                      className="h-8 w-28 text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900"
                    />
                    <span className="text-xs text-slate-500">/mo</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("guardian")}>
                  ← Back
                </Button>
                <Button type="button" size="sm" onClick={() => setActiveTab("documents")}>
                  Next: Documents & Review →
                </Button>
              </div>
            </TabsContent>

            {/* TAB 4: Documents Upload Simulation */}
            <TabsContent value="documents" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Supporting Documents Checklist</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Verify or upload copies of mandatory institutional documents required for admission.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground">Birth Certificate</span>
                        <p className="text-[11px] text-muted-foreground">Proof of age & legal identity verification</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={uploadedDocs.birthCert ? "outline" : "default"}
                      className="h-7 text-xs"
                      onClick={() => setUploadedDocs({ ...uploadedDocs, birthCert: !uploadedDocs.birthCert })}
                    >
                      {uploadedDocs.birthCert ? "Attached (1.2 MB)" : "Attach File"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground">Previous Grade Marksheet</span>
                        <p className="text-[11px] text-muted-foreground">Academic transcript from prior standard</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={uploadedDocs.prevMarksheet ? "outline" : "default"}
                      className="h-7 text-xs"
                      onClick={() => setUploadedDocs({ ...uploadedDocs, prevMarksheet: !uploadedDocs.prevMarksheet })}
                    >
                      {uploadedDocs.prevMarksheet ? "Attached (2.4 MB)" : "Attach File"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground">Government Photo ID / Aadhar</span>
                        <p className="text-[11px] text-muted-foreground">Student or Guardian residence identity</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={uploadedDocs.idProof ? "outline" : "default"}
                      className="h-7 text-xs"
                      onClick={() => setUploadedDocs({ ...uploadedDocs, idProof: !uploadedDocs.idProof })}
                    >
                      {uploadedDocs.idProof ? "Attached (850 KB)" : "Attach File"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Admission Preview Summary
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Student Name:</span>
                    <p className="font-semibold">{firstName || "—"} {lastName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Assigned ID:</span>
                    <p className="font-semibold text-indigo-600">{previewId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Session & Batch:</span>
                    <p className="font-semibold">{academicYear} ({batchId})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Monthly Fee:</span>
                    <p className="font-semibold text-emerald-600">₹{monthlyFee}/mo</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("subjects")}>
                  ← Back
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Enrollment & Save
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}
