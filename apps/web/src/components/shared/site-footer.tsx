import Link from "next/link";

const footerLinks = [
  { href: "/doctors", label: "Browse doctors" },
  { href: "/booking", label: "Book consultation" },
  { href: "/chat", label: "Chat support" },
  { href: "/dashboard/admin", label: "Admin overview" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--pc-line)] bg-[color:var(--pc-surface)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--pc-muted)] uppercase">
            Pet Care Platform
          </p>
          <h2 className="[font-family:var(--font-display)] text-2xl text-[color:var(--pc-ink)]">
            Veterinary booking, consultation, and follow-up care in one calm workflow.
          </h2>
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Built as a single-platform system for pet owners, doctors, and one central admin team.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[color:var(--pc-muted)]">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[color:var(--pc-ink)]">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
