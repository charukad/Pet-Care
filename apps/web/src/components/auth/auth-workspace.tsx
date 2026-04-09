"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { useState, useTransition } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/types/app";

const demoAccounts = [
  {
    role: "User" as const,
    email: "sarah@petcare.local",
    password: "Owner@123",
    note: "Has demo pets and a seeded booking.",
    icon: UserRound,
  },
  {
    role: "Doctor" as const,
    email: "amara@petcare.local",
    password: "Doctor@123",
    note: "Can accept, reject, and complete bookings.",
    icon: Stethoscope,
  },
  {
    role: "Admin" as const,
    email: "admin@petcare.local",
    password: "Admin@123",
    note: "Can view platform counts and recent bookings.",
    icon: ShieldCheck,
  },
];

function getDashboardHref(role: UserRole) {
  if (role === "doctor") {
    return "/dashboard/doctor";
  }

  if (role === "admin") {
    return "/dashboard/admin";
  }

  return "/dashboard/user";
}

export function AuthWorkspace() {
  const { isAuthenticated, isLoading, login, logout, register, user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = searchParams.get("next");
  const safeNextPath = nextPath?.startsWith("/") ? nextPath : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(() => {
      void (async () => {
        try {
          const session =
            mode === "login"
              ? await login({ email, password })
              : await register({ name, email, password });

          const destination = safeNextPath || getDashboardHref(session.user.role);
          router.push(destination);
        } catch (error) {
          setErrorMessage(
            getApiErrorMessage(error, "Unable to complete authentication."),
          );
        }
      })();
    });
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Checking your current Pet Care session.
          </p>
        </section>
      </main>
    );
  }

  if (isAuthenticated && user) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
            Session active
          </p>
          <h1 className="mt-4 [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            You are signed in as {user.name}.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            Your current role is <strong className="text-[color:var(--pc-ink)]">{user.role}</strong>. You can head straight into your dashboard or sign out and test a different role.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={safeNextPath || getDashboardHref(user.role)}
              className="rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Open dashboard
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-[color:var(--pc-line)] px-5 py-3 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <section className="space-y-6">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Authentication
        </p>
        <h1 className="max-w-2xl [font-family:var(--font-display)] text-5xl leading-tight text-[color:var(--pc-ink)]">
          Sign in as a pet owner, doctor, or admin and keep moving.
        </h1>
        <p className="max-w-xl text-base leading-8 text-[color:var(--pc-muted)]">
          This is now a real auth surface backed by JWT sessions. You can register a fresh user account or use one of the seeded demo roles to walk the booking flow from different angles.
        </p>

        <div className="grid gap-4">
          {demoAccounts.map((account) => {
            const Icon = account.icon;

            return (
              <article
                key={account.email}
                className="rounded-[1.75rem] border border-[color:var(--pc-line)] bg-white/85 p-5 shadow-[0_20px_55px_rgba(8,47,73,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--pc-surface)] text-[color:var(--pc-emerald)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--pc-ink)]">
                      {account.role} demo
                    </h2>
                    <p className="text-sm text-[color:var(--pc-muted)]">{account.note}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-[1.25rem] bg-[color:var(--pc-surface)] p-4 text-sm leading-7 text-[color:var(--pc-muted)]">
                  <div>
                    <strong className="text-[color:var(--pc-ink)]">Email:</strong> {account.email}
                  </div>
                  <div>
                    <strong className="text-[color:var(--pc-ink)]">Password:</strong> {account.password}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)] sm:p-8">
        <div className="inline-flex rounded-full border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-[color:var(--pc-ink)] text-white"
                : "text-[color:var(--pc-muted)]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "register"
                ? "bg-[color:var(--pc-ink)] text-white"
                : "text-[color:var(--pc-muted)]"
            }`}
          >
            Create account
          </button>
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="[font-family:var(--font-display)] text-3xl text-[color:var(--pc-ink)]">
            {mode === "login" ? "Welcome back." : "Create a pet owner account."}
          </h2>
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            {mode === "login"
              ? "Use your account credentials or try one of the demo roles."
              : "New registrations currently create pet owner accounts. Doctor and admin roles are seeded for testing."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {mode === "register" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[color:var(--pc-ink)]">Full name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                placeholder="Enter your full name"
                required
              />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[color:var(--pc-ink)]">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[color:var(--pc-ink)]">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
              placeholder="Enter your password"
              required
            />
          </label>

          {errorMessage ? (
            <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending
              ? "Working..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
