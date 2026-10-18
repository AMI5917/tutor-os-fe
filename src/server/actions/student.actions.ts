// src/server/actions/student.actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookies().set(name, value, options);
          } catch (error) {
            // Ignore
          }
        },
        remove(name: string, options: any) {
          try {
            cookies().set(name, "", options);
          } catch (error) {
            // Ignore
          }
        },
      },
    }
  );
}

export async function getStudents() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("students")
    .select(`
      *,
      users(full_name, email, phone),
      student_subject_enrollment(
        id,
        enrollment_type,
        agreed_monthly_fee,
        status,
        subjects(name, code)
      )
    `)
    .order("first_name");

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }

  return data || [];
}

export async function getStudent(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("students")
    .select(`
      *,
      users(full_name, email, phone, avatar_url),
      student_subject_enrollment(
        id,
        enrollment_type,
        agreed_monthly_fee,
        status,
        subjects(name, code, default_monthly_fee)
      ),
      batch_enrollment(
        id,
        status,
        batches(id, name, subjects(name))
      ),
      invoices(
        id,
        amount,
        status,
        due_date,
        paid_at
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching student:", error);
    return null;
  }

  return data;
}

export async function createStudent(studentData: {
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  grade_level: string;
  school_name?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("students")
    .insert(studentData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/students");
  return { success: true, student: data };
}

export async function updateStudent(id: string, studentData: any) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("students")
    .update(studentData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/students");
  return { success: true, student: data };
}

export async function enrollStudentInSubject(
  studentId: string,
  subjectId: string,
  enrollmentType: string,
  agreedMonthlyFee: number
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_subject_enrollment")
    .insert({
      student_id: studentId,
      subject_id: subjectId,
      enrollment_type: enrollmentType,
      agreed_monthly_fee: agreedMonthlyFee,
      status: "ACTIVE",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/students/${studentId}`);
  return { success: true, enrollment: data };
}

export async function getSubjects() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }

  return data || [];
}

export async function createInvoice(invoiceData: {
  student_id: string;
  batch_id: string;
  amount: number;
  due_date: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert(invoiceData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/students/${invoiceData.student_id}`);
  return { success: true, invoice: data };
}

export async function markInvoicePaid(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "PAID",
      paid_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/billing");
  return { success: true, invoice: data };
}