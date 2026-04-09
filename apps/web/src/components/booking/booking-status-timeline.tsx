"use client";

import type { BookingStatusEvent } from "@/types/app";

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function formatStatusLabel(status: BookingStatusEvent["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function BookingStatusTimeline({
  history,
}: {
  history: BookingStatusEvent[];
}) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
        Status history
      </p>
      <div className="space-y-3">
        {history.map((entry, index) => (
          <div key={`${entry.status}-${entry.changedAt}-${index}`} className="flex gap-3">
            <div className="flex w-4 justify-center">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[color:var(--pc-sky)]" />
            </div>
            <div className="min-w-0 flex-1 rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--pc-ink)]">
                    {formatStatusLabel(entry.status)}
                  </p>
                  <p className="text-xs text-[color:var(--pc-muted)]">
                    {entry.actorName} · {entry.actorRole}
                  </p>
                </div>
                <span className="text-xs text-[color:var(--pc-muted)]">
                  {formatDateTime(entry.changedAt)}
                </span>
              </div>
              {entry.note ? (
                <p className="mt-2 text-sm leading-7 text-[color:var(--pc-muted)]">
                  {entry.note}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
