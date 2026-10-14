import { Shield, Check, Eye, Keyboard, Monitor, Volume2 } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";

const LAST_UPDATED = "October 14, 2026";

const features = [
  {
    icon: Keyboard,
    title: "Keyboard navigation",
    desc: "Clickable cards, buttons and links are reachable with Tab and activated with Enter or Space. A skip-to-content link is the first focusable element on every page.",
  },
  {
    icon: Eye,
    title: "Focus and motion",
    desc: "Interactive elements show a visible focus ring. When your system asks for reduced motion, page transitions and animations are turned off.",
  },
  {
    icon: Volume2,
    title: "Screen reader support",
    desc: "Pages use semantic HTML with one H1, labelled form inputs, aria-labels on icon-only buttons, and a live region that announces chat replies.",
  },
  {
    icon: Monitor,
    title: "Responsive and themed",
    desc: "The layout works from phone widths to large monitors, and a dark theme is available from the header toggle or your system setting.",
  },
];

const checklist = [
  "Skip-to-content link on every page",
  "Focus-visible outlines on interactive elements",
  "Semantic heading hierarchy (single H1 per page)",
  "ARIA labels on icon-only buttons",
  "prefers-reduced-motion disables animations and transitions",
  "Form inputs have a visible label or aria-label",
  "Keyboard-operable cards (Enter and Space)",
  "Streamed chat replies announced via aria-live",
  "Dark mode available",
];

const notYet = [
  "We have not completed a formal WCAG 2.1 AA audit. Colour contrast has been checked by eye, not by a tool, in both themes.",
  "Some tap targets, such as comment vote arrows, are smaller than the 44x44px recommendation.",
  "Images from third parties (for example maps) depend on those providers' accessibility.",
];

const Accessibility = () => {
  usePageTitle("Accessibility", "What CivicCare does today for accessibility, and what is still missing.");
  return (
    <div className="bg-background">
      <PageHero
        icon={Shield}
        badge="Commitment"
        title="Accessibility Statement"
        subtitle="What CivicCare does today for people using keyboards, screen readers and reduced-motion settings, and what still needs work."
      />

      <section className="px-6 py-14 md:px-10">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">Our approach</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Honest, not aspirational</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              We aim for the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. This page lists only what the
              current code actually does, so you know what to expect.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-5">
                <f.icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mb-1 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">What is in place</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Known gaps</h2>
            <ul className="max-w-3xl list-disc space-y-2 pl-5 text-muted-foreground">
              {notYet.map((item) => (
                <li key={item} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>

          <div className="max-w-3xl space-y-3 rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Found a barrier?</h2>
            <p className="leading-relaxed text-muted-foreground">
              If something on CivicCare is hard to use with assistive technology, please open an issue on the project
              repository or contact the team. We would rather hear about it than guess.
            </p>
            <p className="text-sm text-muted-foreground">Last updated {LAST_UPDATED}.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accessibility;
