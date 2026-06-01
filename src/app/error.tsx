"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f1a] px-4">
      <div className="max-w-md text-center">
        <p className="text-6xl font-black text-[#9400D3]">500</p>
        <h1 className="mt-4 text-2xl font-black text-white">Something went wrong</h1>
        <p className="mt-3 text-slate-400">We encountered an unexpected error. Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-gradient-to-r from-[#4B0082] to-[#9400D3] px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(75,0,130,0.35)]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
