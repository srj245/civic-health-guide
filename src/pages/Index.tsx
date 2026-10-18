import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/primitives";
import HeroSection from "@/components/sections/HeroSection";
import LiveBillsSection from "@/components/sections/LiveBillsSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import FaqSection from "@/components/sections/FaqSection";
import ActionSection from "@/components/sections/ActionSection";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useT } from "@/i18n";

const quickActions = [
  { title: "start.billsTitle", description: "start.billsDesc", href: "/news" },
  { title: "start.affectedTitle", description: "start.affectedDesc", href: "/affected" },
  { title: "start.careTitle", description: "start.careDesc", href: "/care" },
  { title: "start.impactTitle", description: "start.impactDesc", href: "/impact" },
] as const;

const Index = () => {
  const t = useT();
  usePageTitle("", t("index.description"));

  return (
    <div>
      <HeroSection />
      <LiveBillsSection />

      <Section rule tint aria-labelledby="start-heading">
        <div>
          <Reveal>
            <SectionHeading id="start-heading" title={t("start.heading")} />
          </Reveal>
          <Reveal stagger delay={80} className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="group nudge-down bg-card p-6 transition-colors duration-300 hover:bg-secondary"
              >
                <h3 className="text-lg text-foreground">{t(action.title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(action.description)}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent">
                  {t("common.open")}
                  <svg viewBox="0 0 11 12.6" className="h-[0.85em] w-[0.68em]" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5.5 .4V12M1 7.5L5.5 12L10 7.5" />
                  </svg>
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
      </Section>

      <HowItWorksSection />
      <ActionSection />
      <FaqSection />
    </div>
  );
};

export default Index;
