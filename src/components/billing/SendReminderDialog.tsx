// src/components/billing/SendReminderDialog.tsx
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  MonthlyFeeRecord,
  ReminderChannel,
  ReminderType,
} from "@/types/billing";
import { getReminderTemplate, logNotification } from "@/lib/billing-data";
import {
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  Send,
  ExternalLink,
  Users,
} from "lucide-react";

interface SendReminderDialogProps {
  records: MonthlyFeeRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReminderSent?: () => void;
}

export function SendReminderDialog({
  records,
  open,
  onOpenChange,
  onReminderSent,
}: SendReminderDialogProps) {
  const isBulk = records.length > 1;
  const primaryRecord = records[0];

  const [channel, setChannel] = useState<ReminderChannel>("WHATSAPP");
  const [reminderType, setReminderType] = useState<ReminderType>("PENDING_FEE");
  const [customMessage, setCustomMessage] = useState<string>("");

  useEffect(() => {
    if (primaryRecord) {
      // Pick sensible default template based on status
      const initialType: ReminderType =
        primaryRecord.status === "OVERDUE"
          ? "OVERDUE_URGENT"
          : primaryRecord.status === "PARTIALLY_PAID"
          ? "PARTIAL_PAYMENT"
          : "PENDING_FEE";

      setReminderType(initialType);
      const generated = getReminderTemplate(initialType, {
        studentName: isBulk ? "[Student Name]" : primaryRecord.studentName,
        monthName: primaryRecord.monthName,
        pendingAmount: isBulk ? 2500 : primaryRecord.pendingAmount,
        dueDate: primaryRecord.dueDate,
        academyName: "TutorOS Academy",
        upiId: "tutoros@icici",
      });
      setCustomMessage(generated);
    }
  }, [primaryRecord, isBulk, open]);

  const handleTypeChange = (type: ReminderType) => {
    setReminderType(type);
    if (primaryRecord) {
      const generated = getReminderTemplate(type, {
        studentName: isBulk ? "[Student Name]" : primaryRecord.studentName,
        monthName: primaryRecord.monthName,
        pendingAmount: isBulk ? 2500 : primaryRecord.pendingAmount,
        dueDate: primaryRecord.dueDate,
        academyName: "TutorOS Academy",
        upiId: "tutoros@icici",
      });
      setCustomMessage(generated);
    }
  };

  const cleanPhone = (phone: string) => {
    return phone.replace(/[^\d]/g, "");
  };

  const handleOpenWhatsAppWeb = () => {
    if (!primaryRecord) return;
    const phone = cleanPhone(primaryRecord.parentPhone);
    const text = encodeURIComponent(customMessage);
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, "_blank");

    logNotification({
      studentId: primaryRecord.studentId,
      studentName: primaryRecord.studentName,
      recipientContact: primaryRecord.parentPhone,
      channel: "WHATSAPP",
      type: reminderType,
      amount: primaryRecord.pendingAmount,
      message: customMessage,
      status: "SENT",
    });

    toast.success(`Opened WhatsApp for ${primaryRecord.studentName}'s parent!`);
    onReminderSent?.();
    onOpenChange(false);
  };

  const handleOpenEmail = () => {
    if (!primaryRecord) return;
    const subject = encodeURIComponent(
      `Fee Reminder for ${primaryRecord.studentName} — ${primaryRecord.monthName}`
    );
    const body = encodeURIComponent(customMessage);
    const mailto = `mailto:${primaryRecord.parentEmail || ""}?subject=${subject}&body=${body}`;
    window.open(mailto, "_blank");

    logNotification({
      studentId: primaryRecord.studentId,
      studentName: primaryRecord.studentName,
      recipientContact: primaryRecord.parentEmail || primaryRecord.parentPhone,
      channel: "EMAIL",
      type: reminderType,
      amount: primaryRecord.pendingAmount,
      message: customMessage,
      status: "SENT",
    });

    toast.success(`Email client opened for ${primaryRecord.studentName}`);
    onReminderSent?.();
    onOpenChange(false);
  };

  const handleDispatch = () => {
    records.forEach((rec) => {
      const msg = isBulk
        ? getReminderTemplate(reminderType, {
            studentName: rec.studentName,
            monthName: rec.monthName,
            pendingAmount: rec.pendingAmount,
            dueDate: rec.dueDate,
            academyName: "TutorOS Academy",
            upiId: "tutoros@icici",
          })
        : customMessage;

      logNotification({
        studentId: rec.studentId,
        studentName: rec.studentName,
        recipientContact:
          channel === "EMAIL"
            ? rec.parentEmail || rec.parentPhone
            : rec.parentPhone,
        channel,
        type: reminderType,
        amount: rec.pendingAmount,
        message: msg,
        status: "SENT",
      });
    });

    toast.success(
      isBulk
        ? `Successfully sent ${records.length} ${channel} reminders!`
        : `${channel} reminder sent to ${primaryRecord?.studentName}'s parent!`
    );

    onReminderSent?.();
    onOpenChange(false);
  };

  if (records.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBulk ? (
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>
              {isBulk
                ? `Send Bulk Reminders (${records.length} Students)`
                : `Send Fee Reminder — ${primaryRecord?.studentName}`}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Broadcast customized fee payment notifications to all ${records.length} selected students.`
              : `Send instant reminder to guardian (${primaryRecord?.parentPhone}) for ${primaryRecord?.monthName} dues.`}
          </DialogDescription>
        </DialogHeader>

        {/* Selected target info banner */}
        {!isBulk && primaryRecord && (
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-500 block">Pending Balance</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                {formatCurrency(primaryRecord.pendingAmount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Due Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {primaryRecord.dueDate}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Channel selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Notification Channel</Label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChannel("WHATSAPP")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  channel === "WHATSAPP"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Smartphone className="h-4 w-4 mb-1 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("SMS")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  channel === "SMS"
                    ? "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <MessageSquare className="h-4 w-4 mb-1 text-blue-600" />
                <span>SMS</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("EMAIL")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  channel === "EMAIL"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Mail className="h-4 w-4 mb-1 text-indigo-600" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("IN_APP")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  channel === "IN_APP"
                    ? "border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Bell className="h-4 w-4 mb-1 text-purple-600" />
                <span>In-App</span>
              </button>
            </div>
          </div>

          {/* Reminder template selector */}
          <div className="space-y-1.5">
            <Label htmlFor="reminderType" className="text-xs font-semibold">
              Select Message Template
            </Label>
            <Select
              value={reminderType}
              onValueChange={(val) => handleTypeChange(val as ReminderType)}
            >
              <SelectTrigger id="reminderType">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING_FEE">Standard Pending Fee Reminder</SelectItem>
                <SelectItem value="PARTIAL_PAYMENT">Partial Payment Remaining Balance</SelectItem>
                <SelectItem value="UPCOMING_DUE">Upcoming Payment Due Date Alert</SelectItem>
                <SelectItem value="OVERDUE_URGENT">Urgent Overdue Notice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Preview & Edit */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="customMessage" className="text-xs font-semibold">
                Message Preview & Customization
              </Label>
              <span className="text-[11px] text-slate-400 font-mono">
                {customMessage.length} chars
              </span>
            </div>
            <Textarea
              id="customMessage"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="text-xs font-sans leading-relaxed resize-none"
            />
            {isBulk && (
              <p className="text-[11px] text-slate-500">
                Note: <code>[Student Name]</code> will be automatically replaced with each student&apos;s actual name during dispatch.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          {!isBulk && channel === "WHATSAPP" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenWhatsAppWeb}
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950 font-medium gap-1.5"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open in WhatsApp</span>
            </Button>
          )}

          {!isBulk && channel === "EMAIL" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenEmail}
              className="text-indigo-700 border-indigo-300 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950 font-medium gap-1.5"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Mail Client</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleDispatch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5"
          >
            <Send className="h-4 w-4" />
            <span>
              {isBulk ? `Send to All (${records.length})` : "Dispatch Reminder"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
