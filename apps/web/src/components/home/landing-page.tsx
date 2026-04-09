"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  HeartPulse,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import { mockDoctors } from "@/data/mock-doctors";

const featureCards = [
  {
    title: "Book trusted vets fast",
    description:
      "Browse by specialization, compare availability, and move from discovery to booking in a few calm steps.",
    icon: CalendarDays,
  },
  {
    title: "Chat and follow up",
    description:
      "Keep conversations going after the appointment with doctor-to-owner messaging and medical context.",
    icon: MessageCircleMore,
  },
  {
    title: "Remote care ready",
    description:
      "Support consultations through scheduled video sessions when clinic visits are not the best first step.",
    icon: Video,
  },
  {
    title: "Medical records in one place",
    description:
      "Pets, prescriptions, reviews, reminders, and history stay connected instead of scattered across channels.",
    icon: HeartPulse,
  },
];

const workflowSteps = [
  "Pet owners explore doctors and choose the best-fit specialist.",
  "Appointments are booked against real availability with status tracking.",
  "Doctors consult, chat, and issue prescriptions from one dashboard.",
  "Admin monitors the platform and manages users, doctors, and bookings.",
];

const stats = [
  { label: "Roles supported", value: "3" },
  { label: "Core modules", value: "10+" },
  { label: "Consultation modes", value: "Clinic + Video" },
];

export function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="space-y-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--pc-line)] bg-white/85 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-[color:var(--pc-muted)] uppercase shadow-[0_12px_35px_rgba(8,47,73,0.08)]">
            <Sparkles className="h-4 w-4 text-[color:var(--pc-emerald)]" />
            Modern veterinary care platform
          </div>

          <div className="space-y-5">
            <h1 className="max-w-4xl [font-family:var(--font-display)] text-5xl leading-[1.02] text-[color:var(--pc-ink)] sm:text-6xl lg:text-7xl">
              Calm booking, clearer care, and better follow-up for every pet.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--pc-muted)] sm:text-xl">
              Pet Care gives owners, vets, and one central admin team a clean shared system for appointments, consultations, chat, prescriptions, and medical history.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/doctors"
              className="rounded-full bg-[color:var(--pc-ink)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Browse doctors
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border border-[color:var(--pc-line)] bg-white/90 px-6 py-3 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
            >
              Open dashboards
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.75rem] border border-[color:var(--pc-line)] bg-white/85 p-5 shadow-[0_18px_40px_rgba(8,47,73,0.08)]"
              >
                <p className="text-3xl font-semibold text-[color:var(--pc-ink)]">{stat.value}</p>
                <p className="mt-2 text-sm text-[color:var(--pc-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-[linear-gradient(160deg,rgba(15,118,110,0.95),rgba(59,130,246,0.9))] p-7 text-white shadow-[0_35px_100px_rgba(8,47,73,0.22)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_38%)]" />
          <div className="relative space-y-6">
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                    Live platform snapshot
                  </p>
                  <p className="mt-2 text-2xl font-semibold">Remote-first care flow</p>
                </div>
                <ShieldCheck className="h-10 w-10 text-white/80" />
              </div>
            </div>

            <div className="grid gap-4">
              {mockDoctors.slice(0, 3).map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.16 + index * 0.1 }}
                  className="rounded-[1.5rem] border border-white/10 bg-white/12 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{doctor.name}</p>
                      <p className="text-sm text-white/70">{doctor.specialization}</p>
                    </div>
                    <div className="rounded-full bg-white/14 px-3 py-2 text-xs font-medium">
                      {doctor.nextAvailable}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        {featureCards.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 + index * 0.08 }}
              className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/85 p-6 shadow-[0_22px_65px_rgba(8,47,73,0.08)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--pc-surface)] text-[color:var(--pc-emerald)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-[color:var(--pc-ink)]">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                {feature.description}
              </p>
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2.25rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface-strong)] p-7 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
            Product workflow
          </p>
          <h2 className="mt-4 [font-family:var(--font-display)] text-3xl text-[color:var(--pc-ink)]">
            Each role moves through one connected care loop.
          </h2>
          <div className="mt-6 space-y-4">
            {workflowSteps.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-[1.5rem] border border-white/70 bg-white/90 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--pc-ink)] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-[color:var(--pc-muted)]">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <div className="flex items-center gap-3 text-[color:var(--pc-emerald)]">
              <Stethoscope className="h-5 w-5" />
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--pc-muted)]">
                Public discovery
              </p>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-[color:var(--pc-ink)]">
              Browse by specialization with real doctor profile detail.
            </h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
              The first delivered slice includes doctor listing, filtering, and profile screens, giving the public-facing side of the platform a real start.
            </p>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <div className="flex items-center gap-3 text-[color:var(--pc-sky)]">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--pc-muted)]">
                Technical foundation
              </p>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-[color:var(--pc-ink)]">
              Next.js frontend, Express API, Mongo models, and Socket.io groundwork.
            </h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
              We now have a runnable two-app workspace that can grow into auth, booking, dashboards, prescriptions, and live chat without redoing the base.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
