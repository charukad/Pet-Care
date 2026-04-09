"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Bell, BellRing } from "lucide-react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { AppNotification, NotificationsFeed } from "@/types/app";

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function getNotificationTarget(notification: AppNotification, role?: string) {
  if (notification.type === "prescription") {
    return "/records";
  }

  if (notification.type === "booking") {
    return role === "doctor"
      ? "/dashboard/doctor"
      : role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/user";
  }

  return "/dashboard/user";
}

export function NotificationsWorkspace() {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const [feed, setFeed] = useState<NotificationsFeed>({
    items: [],
    unreadCount: 0,
  });
  const [view, setView] = useState<"all" | "unread">("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedFeed, setHasLoadedFeed] = useState(false);
  const [isMutating, startTransition] = useTransition();
  const shouldLoadFeed = Boolean(session?.token);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let isMounted = true;

    void api
      .get<ApiResponse<NotificationsFeed>>("/notifications/me", {
        headers: createAuthHeaders(session.token),
      })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setFeed(response.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load notifications right now."),
        );
      })
      .finally(() => {
        if (isMounted) {
          setHasLoadedFeed(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.token]);

  function markOneRead(notificationId: string) {
    if (!session?.token) {
      return;
    }

    startTransition(() => {
      void api
        .patch<ApiResponse<AppNotification>>(
          `/notifications/${notificationId}/read`,
          {},
          {
            headers: createAuthHeaders(session.token),
          },
        )
        .then((response) => {
          setFeed((currentFeed) => {
            const nextItems = currentFeed.items.map((item) =>
              item.id === notificationId ? response.data.data : item,
            );

            return {
              items: nextItems,
              unreadCount: nextItems.filter((item) => !item.readAt).length,
            };
          });
          setErrorMessage(null);
        })
        .catch((error) => {
          setErrorMessage(
            getApiErrorMessage(error, "Unable to mark that notification as read."),
          );
        });
    });
  }

  function markEverythingRead() {
    if (!session?.token || feed.unreadCount === 0) {
      return;
    }

    startTransition(() => {
      void api
        .patch<ApiResponse<{ updatedCount: number }>>(
          "/notifications/read-all",
          {},
          {
            headers: createAuthHeaders(session.token),
          },
        )
        .then(() => {
          const timestamp = new Date().toISOString();
          setFeed((currentFeed) => ({
            unreadCount: 0,
            items: currentFeed.items.map((item) =>
              item.readAt ? item : { ...item, readAt: timestamp, updatedAt: timestamp },
            ),
          }));
          setErrorMessage(null);
        })
        .catch((error) => {
          setErrorMessage(
            getApiErrorMessage(error, "Unable to mark all notifications as read."),
          );
        });
    });
  }

  if (isLoading || (shouldLoadFeed && !hasLoadedFeed)) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Loading your notification center.
          </p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            Sign in to view notifications.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            Booking updates and prescription alerts will appear here once you are signed in.
          </p>
          <Link
            href="/auth/login?next=/notifications"
            className="mt-8 inline-flex rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  const visibleItems =
    view === "unread"
      ? feed.items.filter((notification) => !notification.readAt)
      : feed.items;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Notifications
        </p>
        <h1 className="max-w-4xl [font-family:var(--font-display)] text-4xl leading-tight text-[color:var(--pc-ink)] sm:text-5xl">
          Booking decisions, prescription alerts, and platform updates in one feed.
        </h1>
        <p className="max-w-3xl text-base leading-8 text-[color:var(--pc-muted)] sm:text-lg">
          This center keeps recent changes visible without asking you to keep checking dashboards.
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Total notifications</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {feed.items.length}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Unread</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {feed.unreadCount}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Current view</p>
          <p className="mt-3 text-4xl font-semibold capitalize text-[color:var(--pc-ink)]">
            {view}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setView("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                view === "all"
                  ? "bg-[color:var(--pc-ink)] text-white"
                  : "border border-[color:var(--pc-line)] text-[color:var(--pc-ink)] hover:border-[color:var(--pc-sky)] hover:bg-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setView("unread")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                view === "unread"
                  ? "bg-[color:var(--pc-ink)] text-white"
                  : "border border-[color:var(--pc-line)] text-[color:var(--pc-ink)] hover:border-[color:var(--pc-sky)] hover:bg-white"
              }`}
            >
              Unread
            </button>
          </div>

          <button
            type="button"
            onClick={markEverythingRead}
            disabled={isMutating || feed.unreadCount === 0}
            className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white disabled:opacity-60"
          >
            Mark all as read
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {visibleItems.length > 0 ? (
          visibleItems.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-[2rem] border p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)] transition ${
                notification.readAt
                  ? "border-[color:var(--pc-line)] bg-white/90"
                  : "border-[color:var(--pc-sky)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(232,245,255,0.92))]"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--pc-surface)] text-[color:var(--pc-ink)]">
                    {notification.readAt ? (
                      <Bell className="h-5 w-5" />
                    ) : (
                      <BellRing className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
                        {notification.title}
                      </h2>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                        {notification.type}
                      </span>
                      {!notification.readAt ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                          Unread
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--pc-muted)]">
                      {notification.message}
                    </p>
                    <p className="mt-3 text-xs text-[color:var(--pc-muted)]">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!notification.readAt ? (
                    <button
                      type="button"
                      onClick={() => markOneRead(notification.id)}
                      disabled={isMutating}
                      className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white disabled:opacity-60"
                    >
                      Mark read
                    </button>
                  ) : null}
                  <Link
                    href={getNotificationTarget(notification, user?.role)}
                    className="rounded-full bg-[color:var(--pc-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <h2 className="text-2xl font-semibold text-[color:var(--pc-ink)]">
              No notifications in this view.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--pc-muted)]">
              Once bookings are created, decisions are made, or prescriptions are issued, they will appear here.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
