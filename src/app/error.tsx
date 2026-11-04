"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <button onClick={() => reset()} className="rounded bg-slate-900 px-4 py-2 text-white">
        Try again
      </button>
    </div>
  );
}
