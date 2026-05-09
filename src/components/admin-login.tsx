"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabasePublicConfig } from "@/lib/supabase";

export function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const configured = hasSupabasePublicConfig();

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
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <form action={login} className="w-full rounded-[2rem] border border-white/10 bg-white/[.06] p-6 shadow-2xl backdrop-blur">
          <span className="grid size-[52px] place-items-center rounded-2xl bg-cyan-300 text-slate-950">
            <LockKeyhole className="size-6" />
          </span>
          <h1 className="mt-6 text-3xl font-black">SyncAi Admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Sign in with the private Supabase admin account to manage website leads.
          </p>

          {!configured ? (
            <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before logging in.
            </div>
          ) : null}

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-200">
              Email
              <input
                name="email"
                type="email"
                required
                className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-slate-950 outline-none focus:ring-4 focus:ring-cyan-300/20"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-200">
              Password
              <input
                name="password"
                type="password"
                required
                className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-slate-950 outline-none focus:ring-4 focus:ring-cyan-300/20"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !configured}
            className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 text-sm font-black text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Sign in
          </button>
          {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
