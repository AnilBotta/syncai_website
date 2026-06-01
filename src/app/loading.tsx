export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f1a]">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-[#9400D3] border-t-transparent" />
        <p className="mt-4 text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
