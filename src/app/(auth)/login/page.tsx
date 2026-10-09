import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight">Sign in to TutorOS</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials or choose a role to launch your command center.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an academy registered yet?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Create an Academy Account
        </Link>
      </p>
    </div>
  );
}
