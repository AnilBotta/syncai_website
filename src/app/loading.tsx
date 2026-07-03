export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-deep">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-brand-soft border-t-transparent" />
        <p className="mt-4 text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}
