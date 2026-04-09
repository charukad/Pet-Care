"use client";

import { useEffect, useState } from "react";
import { DoctorDirectory } from "@/components/doctors/doctor-directory";
import { api, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import type { PublicDoctorProfile } from "@/types/app";

export function DoctorDirectoryWorkspace() {
  const [doctors, setDoctors] = useState<PublicDoctorProfile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedDoctors, setHasLoadedDoctors] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void api
      .get<ApiResponse<PublicDoctorProfile[]>>("/public/doctors")
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setDoctors(response.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load doctors right now."),
        );
      })
      .finally(() => {
        if (isMounted) {
          setHasLoadedDoctors(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!hasLoadedDoctors) {
    return (
      <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
        <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
          Loading available doctors.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
      <DoctorDirectory doctors={doctors} />
    </div>
  );
}
