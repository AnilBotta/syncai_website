import Link from "next/link";

export default function NotFound() {
  return (
    <div className="theme-dark flex min-h-screen items-center justify-center bg-bg-deep px-4">
      <div className="max-w-md text-center">
        <p className="text-6xl font-black text-brand-soft">404</p>
        <h1 className="mt-4 text-2xl font-black text-foreground">Page not found</h1>
        <p className="mt-3 text-muted">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-bold text-white shadow-[0_0_24px_rgba(160,120,255,0.3)]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
