"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarClock, CheckCircle2, PawPrint, Plus, ShieldAlert } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import type { DoctorProfile } from "@/data/mock-doctors";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { Booking, Pet } from "@/types/app";

const timeOptions = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

function statusClasses(status: Booking["status"]) {
  if (status === "accepted") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "completed") {
    return "bg-sky-100 text-sky-700";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export function BookingWorkspace() {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const searchParams = useSearchParams();
  const doctorQuery = searchParams.get("doctor");
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorQuery ?? "");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [consultationMode, setConsultationMode] = useState<"Clinic" | "Video">(
    "Clinic",
  );
  const [bookingDate, setBookingDate] = useState(getTomorrowDate());
  const [bookingTime, setBookingTime] = useState("09:00");
  const [bookingNotes, setBookingNotes] = useState("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petSex, setPetSex] = useState<"male" | "female" | "unknown">("unknown");
  const [hasLoadedWorkspace, setHasLoadedWorkspace] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingPet, startPetTransition] = useTransition();
  const [isSubmittingBooking, startBookingTransition] = useTransition();

  const selectedDoctor =
    doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null;
  const shouldLoadWorkspace = Boolean(session?.token && user?.role === "user");

  useEffect(() => {
    let isMounted = true;

    void api
      .get<ApiResponse<DoctorProfile[]>>("/public/doctors")
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const doctorList = response.data.data;
        setDoctors(doctorList);
        setSelectedDoctorId(
          (currentDoctorId) =>
            currentDoctorId || doctorQuery || doctorList[0]?.id || "",
        );
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("Unable to load doctors right now.");
      });

    return () => {
      isMounted = false;
    };
  }, [doctorQuery]);

  useEffect(() => {
    if (!doctorQuery) {
      return;
    }

    setSelectedDoctorId(doctorQuery);
  }, [doctorQuery]);

  useEffect(() => {
    if (!session?.token || user?.role !== "user") {
      return;
    }

    const token = session.token;
    let isMounted = true;

    async function loadBookingWorkspace() {
      try {
        const [petsResponse, bookingsResponse] = await Promise.all([
          api.get<ApiResponse<Pet[]>>("/pets", {
            headers: createAuthHeaders(token),
          }),
          api.get<ApiResponse<Booking[]>>("/bookings/me", {
            headers: createAuthHeaders(token),
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setPets(petsResponse.data.data);
        setBookings(bookingsResponse.data.data);
        setSelectedPetId(
          (currentPetId) => currentPetId || petsResponse.data.data[0]?.id || "",
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load your booking workspace."),
        );
      } finally {
        if (isMounted) {
          setHasLoadedWorkspace(true);
        }
      }
    }

    void loadBookingWorkspace();

    return () => {
      isMounted = false;
    };
  }, [session?.token, user?.role]);

  function handleAddPet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setMessage(null);

    if (!session?.token) {
      return;
    }

    startPetTransition(() => {
      void (async () => {
        try {
          const response = await api.post<ApiResponse<Pet>>(
            "/pets",
            {
              name: petName,
              type: petType,
              breed: petBreed,
              age: petAge ? Number(petAge) : undefined,
              sex: petSex,
            },
            {
              headers: createAuthHeaders(session.token),
            },
          );

          const nextPet = response.data.data;
          setPets((currentPets) => [...currentPets, nextPet]);
          setSelectedPetId(nextPet.id);
          setPetName("");
          setPetType("");
          setPetBreed("");
          setPetAge("");
          setPetSex("unknown");
          setMessage(`${nextPet.name} is now ready for booking.`);
        } catch (error) {
          setErrorMessage(getApiErrorMessage(error, "Unable to add this pet."));
        }
      })();
    });
  }

  function handleCreateBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setMessage(null);

    if (!session?.token) {
      return;
    }

    startBookingTransition(() => {
      void (async () => {
        try {
          const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`);
          const response = await api.post<ApiResponse<Booking>>(
            "/bookings",
            {
              doctorProfileId: selectedDoctorId,
              petId: selectedPetId,
              scheduledAt: scheduledAt.toISOString(),
              consultationMode,
              notes: bookingNotes,
            },
            {
              headers: createAuthHeaders(session.token),
            },
          );

          const nextBooking = response.data.data;
          setBookings((currentBookings) =>
            [...currentBookings, nextBooking].sort((left, right) =>
              left.scheduledAt.localeCompare(right.scheduledAt),
            ),
          );
          setBookingNotes("");
          setMessage("Booking created successfully with pending status.");
        } catch (error) {
          setErrorMessage(
            getApiErrorMessage(error, "Unable to create that booking."),
          );
        }
      })();
    });
  }

  if (isLoading || (shouldLoadWorkspace && !hasLoadedWorkspace)) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Loading booking tools and your latest pet data.
          </p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
            Booking access
          </p>
          <h1 className="mt-4 [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            Sign in to book appointments for your pets.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            The booking flow is now connected to live auth, pet creation, and appointment APIs. Sign in as a pet owner or create a new account to continue.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/login?next=/booking"
              className="rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Sign in to continue
            </Link>
            <Link
              href="/doctors"
              className="rounded-full border border-[color:var(--pc-line)] px-5 py-3 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
            >
              Browse doctors first
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (user?.role !== "user") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
            Role restriction
          </p>
          <h1 className="mt-4 [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            Booking is currently reserved for pet owner accounts.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            You are signed in as <strong className="text-[color:var(--pc-ink)]">{user?.role}</strong>. Doctors can manage bookings from their dashboard and admins can monitor them from the admin view.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={user?.role === "doctor" ? "/dashboard/doctor" : "/dashboard/admin"}
              className="rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Open your dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Booking workspace
        </p>
        <h1 className="max-w-4xl [font-family:var(--font-display)] text-4xl leading-tight text-[color:var(--pc-ink)] sm:text-5xl">
          Create appointments, add pets, and track every booking status in one place.
        </h1>
        <p className="max-w-3xl text-base leading-8 text-[color:var(--pc-muted)] sm:text-lg">
          This is the first working appointment flow for Pet Care. It is connected to live authentication, doctor selection, pet records, and protected booking endpoints.
        </p>
      </section>

      {message ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--pc-surface)] text-[color:var(--pc-emerald)]">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">Add a pet</h2>
                <p className="text-sm text-[color:var(--pc-muted)]">
                  You need at least one pet profile before you can create a booking.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddPet} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                placeholder="Pet name"
                className="rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
                required
              />
              <input
                value={petType}
                onChange={(event) => setPetType(event.target.value)}
                placeholder="Pet type"
                className="rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
                required
              />
              <input
                value={petBreed}
                onChange={(event) => setPetBreed(event.target.value)}
                placeholder="Breed (optional)"
                className="rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
              />
              <input
                value={petAge}
                onChange={(event) => setPetAge(event.target.value)}
                placeholder="Age"
                type="number"
                min="0"
                className="rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
              />
              <select
                value={petSex}
                onChange={(event) =>
                  setPetSex(event.target.value as "male" | "female" | "unknown")
                }
                className="rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
              >
                <option value="unknown">Sex unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <button
                type="submit"
                disabled={isSubmittingPet}
                className="rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingPet ? "Saving pet..." : "Save pet"}
              </button>
            </form>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--pc-surface)] text-[color:var(--pc-emerald)]">
                <PawPrint className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">Your pets</h2>
                <p className="text-sm text-[color:var(--pc-muted)]">
                  These profiles are available for booking right now.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {pets.length > 0 ? (
                pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="rounded-[1.5rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-4 text-sm text-[color:var(--pc-muted)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[color:var(--pc-ink)]">{pet.name}</p>
                        <p className="mt-1">
                          {pet.type}
                          {pet.breed ? ` · ${pet.breed}` : ""}
                          {typeof pet.age === "number" ? ` · ${pet.age} years` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[color:var(--pc-ink)]">
                        {pet.sex}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm leading-7 text-[color:var(--pc-muted)]">
                  Add your first pet to unlock booking creation.
                </div>
              )}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--pc-surface)] text-[color:var(--pc-emerald)]">
                <CalendarClock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">Create booking</h2>
                <p className="text-sm text-[color:var(--pc-muted)]">
                  Choose a doctor, pet, time, and consultation mode.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--pc-ink)]">Doctor</span>
                <select
                  value={selectedDoctorId}
                  onChange={(event) => {
                    setSelectedDoctorId(event.target.value);
                    setConsultationMode("Clinic");
                  }}
                  className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
                  required
                >
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} · {doctor.specialization}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--pc-ink)]">Pet</span>
                <select
                  value={selectedPetId}
                  onChange={(event) => setSelectedPetId(event.target.value)}
                  className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
                  required
                >
                  <option value="" disabled>
                    Select a pet
                  </option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} · {pet.type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--pc-ink)]">Date</span>
                <input
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                  type="date"
                  min={getTomorrowDate()}
                  className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--pc-ink)]">Time</span>
                <select
                  value={bookingTime}
                  onChange={(event) => setBookingTime(event.target.value)}
                  className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
                  required
                >
                  {timeOptions.map((timeOption) => (
                    <option key={timeOption} value={timeOption}>
                      {timeOption}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--pc-ink)]">
                  Consultation mode
                </span>
                <select
                  value={consultationMode}
                  onChange={(event) =>
                    setConsultationMode(event.target.value as "Clinic" | "Video")
                  }
                  className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
                >
                  {(selectedDoctor?.consultationModes ?? ["Clinic"]).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-[color:var(--pc-ink)]">Notes</span>
                <textarea
                  value={bookingNotes}
                  onChange={(event) => setBookingNotes(event.target.value)}
                  rows={4}
                  placeholder="Tell the doctor what is going on with your pet."
                  className="w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none focus:border-[color:var(--pc-sky)]"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmittingBooking || pets.length === 0}
                className="rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingBooking ? "Creating booking..." : "Create booking"}
              </button>
            </form>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--pc-surface)] text-[color:var(--pc-emerald)]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">Your bookings</h2>
                <p className="text-sm text-[color:var(--pc-muted)]">
                  Pending appointments appear here immediately after creation.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-[1.5rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[color:var(--pc-ink)]">
                          {booking.doctor.name}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                          {booking.doctor.specialization} · {booking.pet.name} · {booking.consultationMode}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClasses(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-[color:var(--pc-muted)]">
                      {formatDateTime(booking.scheduledAt)}
                    </p>
                    {booking.notes ? (
                      <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                        {booking.notes}
                      </p>
                    ) : null}
                    {booking.rejectionReason ? (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {booking.rejectionReason}
                      </div>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm leading-7 text-[color:var(--pc-muted)]">
                  No bookings yet. Create your first appointment from the form above.
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
