"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabasePublicConfig } from "@/lib/supabase";
import { BrandLogo } from "@/components/admin/shell/brand-logo";

export function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Match the dashboard's persisted Luminary theme (dark default, no toggle here).
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const configured = hasSupabasePublicConfig();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("syncai-admin-theme");
      if (stored === "light" || stored === "dark") setTheme(stored);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function login(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
      });

      if (authError) {
        throw authError;
      }

      router.push("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`admin-luminary admin-${theme} min-h-screen px-4 py-12`}>
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <form
          action={login}
          className="w-full rounded-[2rem] border border-sidebar-border bg-card p-6 shadow-card backdrop-blur-xl"
        >
          <BrandLogo theme={theme} width={160} />
          <h1 className="mt-6 text-3xl font-black text-foreground">Control Center</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign in with the private Supabase admin account to manage website leads.
          </p>

          {!configured ? (
            <div className="mt-5 rounded-2xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn">
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before logging in.
            </div>
          ) : null}

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-foreground/90">
              Email
              <input
                name="email"
                type="email"
                required
                className="h-12 rounded-2xl border border-sidebar-border bg-input-bg px-4 text-foreground outline-none backdrop-blur-md focus:border-brand-soft focus:ring-4 focus:ring-brand/20"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-foreground/90">
              Password
              <input
                name="password"
                type="password"
                required
                className="h-12 rounded-2xl border border-sidebar-border bg-input-bg px-4 text-foreground outline-none backdrop-blur-md focus:border-brand-soft focus:ring-4 focus:ring-brand/20"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !configured}
            className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-electric to-brand-soft px-6 text-sm font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Sign in
          </button>
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
