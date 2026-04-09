"use client";

import Link from "next/link";
import { ClipboardPlus, PawPrint, Stethoscope } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export function SiteHeader() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  const dashboardHref =
    user?.role === "doctor"
      ? "/dashboard/doctor"
      : user?.role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/user";

  return (
    <header className="sticky top-0 z-50 border-b border-white/45 bg-[color:var(--pc-surface-strong)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em] text-[color:var(--pc-ink)] uppercase"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--pc-emerald),var(--pc-sky))] text-white shadow-[0_18px_40px_rgba(16,185,129,0.3)]">
            <PawPrint className="h-5 w-5" />
          </span>
          Pet Care
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {[
            { href: "/", label: "Home" },
            { href: "/doctors", label: "Doctors" },
            { href: "/booking", label: "Booking" },
            { href: "/chat", label: "Chat" },
            ...(user?.role === "user" ? [{ href: "/records", label: "Records" }] : []),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[color:var(--pc-muted)] transition hover:text-[color:var(--pc-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-muted)]">
              Loading...
            </div>
          ) : isAuthenticated && user ? (
            <>
              <Link
                href={dashboardHref}
                className="hidden rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white sm:inline-flex"
              >
                {user.name.split(" ")[0]} · {user.role}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white"
            >
              Sign in
            </Link>
          )}
          <Link
            href={user?.role === "user" ? "/records" : "/doctors"}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pc-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            {user?.role === "user" ? (
              <>
                <ClipboardPlus className="h-4 w-4" />
                Records
              </>
            ) : (
              <>
                <Stethoscope className="h-4 w-4" />
                Find a vet
              </>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
