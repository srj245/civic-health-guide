import { Check, Eye, Keyboard, Monitor, Volume2 } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import { SectionHeading, Surface } from "@/components/ui/primitives";
import { usePageTitle } from "@/hooks/usePageTitle";

const LAST_UPDATED = "October 15, 2026";

const features = [
  {
    icon: Keyboard,
    title: "Keyboard navigation",
    desc: "Clickable cards, buttons, and links are reachable with Tab and activated with Enter or Space. A skip-to-content link is the first focusable element on every page.",
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
    desc: "The layout works from phone widths to large monitors. Dark is the default and a light theme is one click away in the header.",
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
  "Body and small text checked for WCAG AA contrast in both themes",
  "Light and dark themes",
];

const notYet = [
  "We have not completed a formal WCAG 2.1 AA audit. Text contrast was checked with a tool for the common surfaces; decorative elements were not.",
  "Third-party content, such as the map, depends on those providers' accessibility.",
];

const Accessibility = () => {
  usePageTitle("Accessibility", "What CivicCare does today for accessibility, and what is still missing.");
  return (
    <div>
      <PageHero
        badge="Commitment"
        title="Accessibility statement"
        subtitle="What CivicCare does today for people using keyboards, screen readers, and reduced-motion settings, and what still needs work."
      />

      <Section first width="narrow" className="space-y-16">
        <Reveal>
          <SectionHeading
            eyebrow="Our approach"
            title="Honest, not aspirational"
            lede="We aim for the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. This page lists only what the current code actually does, so you know what to expect."
          />
        </Reveal>

        <Reveal stagger className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Surface key={f.title} padding="md">
              <f.icon className="mb-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-lg text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </Surface>
          ))}
        </Reveal>

        <Reveal>
          <SectionHeading title="What is in place" />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-md border border-border p-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <SectionHeading title="Known gaps" />
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-muted-foreground">
            {notYet.map((item) => (
              <li key={item} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <Surface padding="lg">
            <h2 className="text-2xl tracking-tight text-foreground">Found a barrier?</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              If something on CivicCare is hard to use with assistive technology, open an issue on the project repository or
              contact the team. We would rather hear about it than guess.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Last updated {LAST_UPDATED}.</p>
          </Surface>
        </Reveal>
      </Section>
    </div>
  );
};

export default Accessibility;
