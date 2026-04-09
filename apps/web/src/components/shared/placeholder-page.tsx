import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  primaryAction: {
    href: string;
    label: string;
  };
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  highlights,
  primaryAction,
}: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <section className="space-y-5">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl [font-family:var(--font-display)] text-4xl leading-tight text-[color:var(--pc-ink)] sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-8 text-[color:var(--pc-muted)] sm:text-lg">
          {description}
        </p>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface-strong)] p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)] sm:grid-cols-2 sm:p-8">
        {highlights.map((highlight) => (
          <article
            key={highlight}
            className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 text-sm leading-7 text-[color:var(--pc-muted)]"
          >
            {highlight}
          </article>
        ))}
      </section>

      <div>
        <Link
          href={primaryAction.href}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          {primaryAction.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
