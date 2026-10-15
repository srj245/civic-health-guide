import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import HeroSection from "@/components/sections/HeroSection";
import LiveBillsSection from "@/components/sections/LiveBillsSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import FaqSection from "@/components/sections/FaqSection";
import ActionSection from "@/components/sections/ActionSection";
import { usePageTitle } from "@/hooks/usePageTitle";

const quickActions = [
  { title: "Health bills", description: "What Congress is voting on, explained.", href: "/news" },
  { title: "Who's affected", description: "Students, families, seniors, workers.", href: "/affected" },
  { title: "Find care", description: "Clinics and services near you.", href: "/care" },
  { title: "Your impact", description: "Which bills matter for your situation.", href: "/impact" },
];

const Index = () => {
  usePageTitle("", "CivicCare makes healthcare policy accessible. Track health bills, find care, and contact your representatives.");

  return (
    <div>
      <HeroSection />
      <LiveBillsSection />

      <section className="border-t border-border px-6 py-14 md:px-10 md:py-20" aria-labelledby="start-heading">
        <div className="mx-auto max-w-6xl">
          <Reveal as="h2" id="start-heading" className="text-2xl tracking-tight text-foreground md:text-3xl">
            Start here
          </Reveal>
          <Reveal stagger delay={80} className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
               
                className="group nudge-down bg-background p-6 transition-colors duration-300 hover:bg-secondary"
              >
                <h3 className="text-lg text-foreground">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent">
                  Open
                  <svg viewBox="0 0 11 12.6" className="h-[0.85em] w-[0.68em]" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5.5 .4V12M1 7.5L5.5 12L10 7.5" />
                  </svg>
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <HowItWorksSection />
      <ActionSection />
      <FaqSection />
    </div>
  );
};

export default Index;
