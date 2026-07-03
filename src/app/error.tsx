"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-deep px-4">
      <div className="max-w-md text-center">
        <p className="text-6xl font-black text-brand-soft">500</p>
        <h1 className="mt-4 text-2xl font-black text-foreground">Something went wrong</h1>
        <p className="mt-3 text-muted">We encountered an unexpected error. Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white shadow-[0_0_24px_rgba(160,120,255,0.3)]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
