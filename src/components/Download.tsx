import React from "react";
import Link from "next/link";
import { Glyph } from "./Logo";

const ANDROID = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";
const IOS = "https://apps.apple.com/us/app/chadwallet/id6757367474";

export function Download() {
  return (
    <section id="download" className="border-t border-ink-600">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="clip-chad relative overflow-hidden rounded-3xl border border-ink-500 bg-ink-800 p-10 sm:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-chad/10 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
              Put the terminal in your pocket.
            </h2>
            <p className="mt-4 text-lg text-muted">
              ChadWallet is free on iOS and Android. Same self-custody, same live
              data, built for one hand and a fast thumb.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <StoreButton
                href={IOS}
                kicker="Download on the"
                name="App Store"
                icon={
                  <path d="M16.36 1.43c0 1.14-.42 2.2-1.25 3.04-.99 1-2.13 1.58-3.37 1.48-.15-1.1.4-2.27 1.16-3.03.85-.86 2.3-1.5 3.46-1.49zM20.5 17.2c-.55 1.27-.82 1.84-1.53 2.96-.99 1.57-2.39 3.52-4.12 3.53-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.01-3.06-1.77-4.05-3.34C-.07 15.95-.36 10.8 1.4 8.06c1.25-1.94 3.22-3.08 5.07-3.08 1.89 0 3.07 1.04 4.63 1.04 1.51 0 2.43-1.04 4.62-1.04 1.65 0 3.4.9 4.64 2.46-4.08 2.24-3.42 8.07.14 9.76z" />
                }
              />
              <StoreButton
                href={ANDROID}
                kicker="Get it on"
                name="Google Play"
                icon={
                  <path d="M3.6 2.2c-.3.3-.5.8-.5 1.4v16.8c0 .6.2 1.1.5 1.4l.1.1L13 12.6v-.2L3.7 2.1l-.1.1zm12.7 7.1L5.5 3.1l9.3 9.4-.2.2 1.7-1.7zm3.4 1.9-2.4-1.4-1.9 1.9 1.9 1.9 2.4-1.4c.7-.4.7-1.1 0-1.5l-.1.5zm-5.8 2.9-9.3 9.4 10.8-6.2-1.5-1.5z" />
                }
              />
            </div>
            <p className="led mt-6 text-xs text-muted">
              Or just{" "}
              <Link href="/trade" className="text-chad underline">
                trade in your browser
              </Link>{" "}
              — no download required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreButton({
  href,
  kicker,
  name,
  icon,
}: {
  href: string;
  kicker: string;
  name: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-ink-500 bg-ink-900 px-5 py-3 transition hover:border-chad/60 hover:bg-ink-700"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-bone" aria-hidden>
        {icon}
      </svg>
      <span className="text-left">
        <span className="block text-[10px] uppercase tracking-wide text-muted">
          {kicker}
        </span>
        <span className="block font-display text-base font-bold text-bone">
          {name}
        </span>
      </span>
    </a>
  );
}

function FooterCol({
  label,
  links,
}: {
  label: string;
  links: { name: string; href: string; external?: boolean }[];
}) {
  return (
    <div className="flex min-w-40 flex-col items-start gap-2">
      <div className="font-mono text-sm text-muted/70">{label}</div>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          {...(l.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-sm text-bone/80 transition hover:text-bone"
        >
          {l.name}
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const copyright = `© ${year} ChadWallet`;

  return (
    <footer className="border-t border-ink-600 bg-ink-900 px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 sm:flex-row">
        {/* brand + tagline */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              aria-label="ChadWallet home"
              className="inline-flex items-center gap-2.5 text-bone"
            >
              <Glyph size={32} />
              <span className="font-display text-3xl font-extrabold tracking-tight text-bone">
                ChadWallet
              </span>
            </Link>
            <div className="text-2xl leading-7 tracking-tighter text-muted">
              where traders become legends.
            </div>
          </div>
          <div className="hidden text-sm text-muted/60 sm:block">{copyright}</div>
        </div>

        {/* link columns */}
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:gap-2">
          <FooterCol
            label="PRODUCT"
            links={[
              { name: "Terminal", href: "/trade" },
              { name: "Features", href: "#features" },
              { name: "Download", href: "#download" },
              { name: "FAQ", href: "#" },
            ]}
          />
          <FooterCol
            label="SOCIAL"
            links={[
              { name: "Discord", href: "#", external: true },
              { name: "X/Twitter", href: "#", external: true },
              { name: "Instagram", href: "#", external: true },
              { name: "Youtube", href: "#", external: true },
              { name: "LinkedIn", href: "#", external: true },
            ]}
          />
          <FooterCol
            label="LEGAL"
            links={[
              { name: "Privacy Policy", href: "#" },
              { name: "Terms of Service", href: "#" },
            ]}
          />
        </div>

        {/* mobile copyright */}
        <div className="block text-sm text-muted/60 sm:hidden">{copyright}</div>
      </div>
    </footer>
  );
}
