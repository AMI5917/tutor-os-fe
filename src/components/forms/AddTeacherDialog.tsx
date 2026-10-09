// src/components/forms/AddTeacherDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Teacher, RateType } from "@/types/roles";
import { useAuth } from "@/lib/auth-context";

interface AddTeacherDialogProps {
  /** Callback when a new teacher is added */
  onAdd: (teacher: Teacher) => void;
  /** Optional teacher data for edit mode */
  initialTeacher?: Teacher;
  /** Callback when an existing teacher is updated */
  onUpdate?: (teacher: Teacher) => void;
}

export function AddTeacherDialog({ onAdd, initialTeacher, onUpdate }: AddTeacherDialogProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [open, setOpen] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [subjectSpecialization, setSubjectSpecialization] = React.useState("");
  const [rateType, setRateType] = React.useState<RateType>("Hourly");
  const [rateAmount, setRateAmount] = React.useState(0);
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [status, setStatus] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Populate fields when editing
  React.useEffect(() => {
    if (initialTeacher) {
      setFirstName(initialTeacher.firstName);
      setMiddleName(initialTeacher.middleName ?? "");
      setLastName(initialTeacher.lastName);
      setSubjectSpecialization(initialTeacher.subjectSpecialization);
      setRateType(initialTeacher.rateType);
      setRateAmount(initialTeacher.rateAmount);
      setMobileNumber(initialTeacher.mobileNumber ?? "");
      setStatus(initialTeacher.status);
      setOpen(true);
    }
  }, [initialTeacher]);

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSubjectSpecialization("");
    setRateType("Hourly");
    setRateAmount(0);
    setMobileNumber("");
    setStatus("ACTIVE");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher: Teacher = {
      id: initialTeacher?.id ?? `teach_${Date.now()}`,
      firstName,
      middleName: middleName || undefined,
      lastName,
      subjectSpecialization,
      rateType,
      rateAmount,
      mobileNumber,
      status,
    };

    if (initialTeacher && onUpdate) {
      onUpdate(teacher);
    } else {
      onAdd(teacher);
    }
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Teacher</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              placeholder="Middle Name (optional)"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <Input
            placeholder="Subject Specialization"
            value={subjectSpecialization}
            onChange={(e) => setSubjectSpecialization(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={rateType} onValueChange={(v) => setRateType(v as RateType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Rate Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hourly">Hourly</SelectItem>
                <SelectItem value="Per Session">Per Session</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Rate Amount (₹)"
              min={0}
              value={rateAmount.toString()}
              onChange={(e) => setRateAmount(parseInt(e.target.value) || 0)}
              required
            />
          </div>
          {isAdmin && (
            <>
              <Input
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
              <Select value={status} onValueChange={(v) => setStatus(v as "ACTIVE" | "INACTIVE")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          <Button type="submit" className="w-full">
            {initialTeacher ? "Update Teacher" : "Add Teacher"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
