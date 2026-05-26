"use client";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ── documentation.ai palette (matched exactly to components/editor/documentation.tsx) ──
//   heading #09090b · body #5e5e5e · faint #959595 · accent (orange) #f97d00
//   primary btn #000/white (pill) · secondary btn #f5f3f1/#000 (pill)
//   surfaces: white / #f8f8f8 · cards #fcfcfc with #ebebeb borders · icon chip #f8f4e5

const AUDIENCES = [
  {
    num: "01",
    title: "Designers & PMs",
    text: "Mark up mockups, point out friction in flows, and ship feedback that the whole team can read at a glance.",
  },
  {
    num: "02",
    title: "Developers & QA",
    text: "Capture bug screenshots, circle the offending pixel, and drop them straight into a ticket — no desktop app required.",
  },
  {
    num: "03",
    title: "Support & Marketing",
    text: "Redact sensitive data, add callouts, and craft polished walkthrough images for help docs and announcements.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Upload your screenshot",
    text: "Drop in a PNG, JPG, GIF, or WebP from your device — or paste a direct image URL. Files never leave your browser.",
  },
  {
    num: "2",
    title: "Annotate with the toolbar",
    text: "Draw, type, highlight, blur sensitive areas, or stamp arrows, rectangles, and circles in any color you pick.",
  },
  {
    num: "3",
    title: "Save the polished image",
    text: "Crop, rotate, swap the background, and export a clean PNG ready to paste into a ticket, doc, or chat thread.",
  },
];

const FEATURES = [
  {
    icon: "✎",
    title: "Full Annotation Toolkit",
    text: "Pen, text, highlight, blur, rectangles, circles, and arrows — everything you need to call out exactly what matters.",
  },
  {
    icon: "✦",
    title: "Background & Padding Studio",
    text: "Drop your screenshot onto a solid color, gradient, or custom backdrop with adjustable padding and corner radius.",
  },
  {
    icon: "↓",
    title: "One-Click Export",
    text: "Save a print-ready PNG in a single click — no watermarks, no sign-up, no compression surprises.",
  },
  {
    icon: "◐",
    title: "Crop, Rotate & Undo",
    text: "Trim to the perfect frame, rotate in 90° steps, and step back through every edit with full undo and redo history.",
  },
];

const FAQS = [
  {
    q: "Is this screenshot editor free?",
    a: "Yes — it's 100% free with no signup, no ads, and no usage limits. Every tool, including export, is available without paying.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. There's no sign-up or login — open the page, drop in a screenshot, and start editing immediately.",
  },
  {
    q: "Is my image private?",
    a: "Yes. Your screenshot is loaded into your browser and edited locally. Nothing is uploaded to a server, so your image stays on your device.",
  },
  {
    q: "Which image formats are supported?",
    a: "PNG, JPG, GIF, and WebP. You can upload from your device or paste a direct URL to any publicly accessible image.",
  },
  {
    q: "Can I blur out sensitive information?",
    a: "Yes. The blur tool lets you mask emails, names, tokens, or any region of the screenshot before you share it.",
  },
  {
    q: "Can I change the background of my screenshot?",
    a: "Yes. Drop your screenshot onto a solid color or custom image background, then dial in the padding and corner radius for a polished look.",
  },
];

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f4e5] dark:bg-white dark:bg-[#1e1e1e]/10 text-base text-[#f97d00]">
      {children}
    </span>
  );
}

function Eyebrow({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", center && "justify-center")}>
      <span className="size-1.5 shrink-0 rounded-full bg-[#f97d00]" />
      <span className="font-mono text-[12px] uppercase tracking-[0.02em] text-[#5e5e5e] dark:text-white/70">
        {children}
      </span>
    </div>
  );
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to edit and annotate a screenshot online",
  step: STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export function LandingContent({
  onChooseFile,
}: {
  onChooseFile?: () => void;
}) {
  return (
    <div className="bg-white dark:bg-[#1e1e1e] text-[#09090b] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      {/* ── Hero ── */}
      <header className="bg-white dark:bg-[#1e1e1e] py-20 text-center md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex justify-center">
            <Eyebrow center>100% Free · No Sign-Up · Private</Eyebrow>
          </div>

          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[#09090b] dark:text-white md:text-[3.25rem]">
            Free Online <span className="text-[#f97d00]">Screenshot Editor</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#5e5e5e] dark:text-white/70 md:text-xl">
            <strong className="font-semibold text-[#09090b] dark:text-white">
              Edit, annotate, and beautify screenshots right in your browser.
            </strong>{" "}
            Add text, arrows, highlights, and blur to mask sensitive details;
            drop your image onto a custom background; then export a polished
            PNG — all without uploading anything to a server.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onChooseFile}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full bg-[#000] px-6 text-white hover:bg-[#1d1816] dark:bg-white dark:text-black dark:hover:bg-white/90"
              )}
            >
              Upload a Screenshot — It&apos;s Free
            </button>
          </div>
        </div>
      </header>

      {/* ── Audience Cards ── */}
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="mb-3">
          <Eyebrow center>Built For</Eyebrow>
        </div>
        <h2 className="text-center text-2xl font-bold text-[#09090b] dark:text-white md:text-3xl">
          One Editor, Every Screenshot Workflow
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-[#5e5e5e] dark:text-white/70">
          The Online Screenshot Editor works for anyone who needs to mark up an
          image — designers reviewing flows, engineers filing bugs, and support
          teams writing help docs — all in the same fast, distraction-free
          canvas.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {AUDIENCES.map((card) => (
            <div
              key={card.num}
              className="rounded-2xl border border-[#ebebeb] dark:border-white/10 bg-[#fcfcfc] dark:bg-[#262626] p-6"
            >
              <span className="font-mono text-xs font-bold text-[#f97d00]">
                {card.num}
              </span>
              <h3 className="mt-1 text-base font-semibold text-[#09090b] dark:text-white">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5e5e5e] dark:text-white/70">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#f8f8f8] dark:bg-[#181818] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-3">
            <Eyebrow>Getting Started</Eyebrow>
          </div>
          <h2 className="text-2xl font-bold text-[#09090b] dark:text-white md:text-3xl">
            How Does the Screenshot Editor Work?
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#5e5e5e] dark:text-white/70">
            The screenshot editor works in three steps: upload your image,
            annotate it with the on-canvas toolbar, then export the finished
            result as a PNG. No setup, install, or sign-up is required.
          </p>

          <ol className="mt-10 space-y-8">
            {STEPS.map((step) => (
              <li key={step.num} className="flex items-start gap-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#000] text-sm font-bold text-white dark:bg-white dark:text-black">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#09090b] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#5e5e5e] dark:text-white/70">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="mb-3">
          <Eyebrow>Features</Eyebrow>
        </div>
        <h2 className="text-2xl font-bold text-[#09090b] dark:text-white md:text-3xl">
          Why Choose Our Screenshot Editor?
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5e5e5e] dark:text-white/70">
          Choose this screenshot editor because it is free, private, and runs
          entirely in your browser — with a full annotation toolkit, custom
          backgrounds and padding, one-click PNG export, and instant undo, while
          nothing you edit is ever sent to a server.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[#ebebeb] dark:border-white/10 bg-[#fcfcfc] dark:bg-[#262626] p-6"
            >
              <FeatureIcon>{f.icon}</FeatureIcon>
              <h3 className="mt-4 text-base font-semibold text-[#09090b] dark:text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5e5e5e] dark:text-white/70">
                {f.text}
              </p>
            </div>
          ))}

          <div className="rounded-2xl border border-[#ebebeb] dark:border-white/10 bg-[#fcfcfc] dark:bg-[#262626] p-6 sm:col-span-2">
            <div className="flex items-start gap-5">
              <FeatureIcon>◉</FeatureIcon>
              <div>
                <h3 className="text-base font-semibold text-[#09090b] dark:text-white">
                  Private by Design
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5e5e5e] dark:text-white/70">
                  Your screenshot is loaded into your browser and never
                  uploaded. Edits, blurs, and exports all happen on your device,
                  so sensitive information stays with you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="mb-3">
          <Eyebrow>FAQ</Eyebrow>
        </div>
        <h2 className="text-2xl font-bold text-[#09090b] dark:text-white md:text-3xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-10 space-y-8">
          {FAQS.map((item) => (
            <div key={item.q}>
              <h3 className="text-base font-semibold text-[#09090b] dark:text-white">
                {item.q}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5e5e5e] dark:text-white/70">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section className="bg-[#f8f8f8] dark:bg-[#181818] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-[#09090b] dark:text-white md:text-3xl">
            About
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5e5e5e] dark:text-white/70">
            Online Screenshot Editor is 100% free, requires no account, and runs
            entirely in your browser. It&apos;s built for anyone who wants a
            fast, distraction-free way to mark up, beautify, and share
            screenshots.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <Separator className="bg-[#ebebeb] dark:bg-white/10" />
      <footer className="bg-white dark:bg-[#1e1e1e] py-8 text-center text-sm text-[#959595] dark:text-white/50">
        <p>
          © {new Date().getFullYear()} Screenshot Editor. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
