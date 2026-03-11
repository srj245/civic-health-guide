import { Shield, Check, Eye, Keyboard, Monitor, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHero from "@/components/sections/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";

const features = [
  {
    icon: Keyboard,
    title: "Keyboard Navigation",
    desc: "Every interactive element is reachable and operable via keyboard. Skip-to-content links let users bypass repetitive navigation.",
  },
  {
    icon: Eye,
    title: "Color Contrast",
    desc: "All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) in both light and dark modes.",
  },
  {
    icon: Volume2,
    title: "Screen Reader Support",
    desc: "Semantic HTML, ARIA labels, and roles ensure assistive technologies can interpret every page accurately.",
  },
  {
    icon: Monitor,
    title: "Responsive Design",
    desc: "The interface adapts to any screen size—from mobile phones to ultrawide monitors—without loss of content or functionality.",
  },
];

const checklist = [
  "Skip-to-content link on every page",
  "Focus-visible outlines on all interactive elements",
  "Alt text on all informational images",
  "Semantic heading hierarchy (single H1 per page)",
  "ARIA labels on icon-only buttons",
  "Reduced-motion media query support",
  "Form labels associated with inputs",
  "Color is never the sole means of conveying information",
  "Dark mode with proper contrast",
  "Touch targets meet 44×44px minimum",
];

const Accessibility = () => {
  usePageTitle("Accessibility", "CivicCare's commitment to digital accessibility and WCAG AA compliance.");
  return (
    <div className="bg-background animate-fade-in">
      <PageHero
        icon={Shield}
        badge="Commitment"
        title="Accessibility Statement"
        subtitle="CivicCare is committed to making healthcare policy accessible to everyone—including people with disabilities."
      />

      <section className="px-6 py-12 md:px-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Intro */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Our Approach</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              We design and develop CivicCare following the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. Accessibility isn't an afterthought—it's built into every component, page, and interaction from the start.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="border-border">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Compliance Checklist</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="text-xl font-bold text-foreground">Found a Barrier?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you encounter any accessibility issues while using CivicCare, we want to know. Please reach out so we can address it promptly and improve the experience for everyone.
            </p>
            <p className="text-sm text-muted-foreground">
              This statement was last updated on {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accessibility;
