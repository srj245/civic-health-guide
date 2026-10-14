import { Link } from "react-router-dom";
import { TrendingUp, Users, MapPin, Calculator, ArrowRight } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import DistrictDashboard from "@/components/sections/DistrictDashboard";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import FaqSection from "@/components/sections/FaqSection";
import ActionSection from "@/components/sections/ActionSection";
import { usePageTitle } from "@/hooks/usePageTitle";

const quickActions = [
  {
    icon: TrendingUp,
    title: "Health bills",
    description: "What Congress is voting on, explained.",
    href: "/news",
  },
  {
    icon: Users,
    title: "Who's affected",
    description: "Students, families, seniors, workers.",
    href: "/affected",
  },
  {
    icon: MapPin,
    title: "Find care",
    description: "Clinics and services near you.",
    href: "/care",
  },
  {
    icon: Calculator,
    title: "Your impact",
    description: "Which bills matter for your situation.",
    href: "/impact",
  },
];

const Index = () => {
  usePageTitle("", "CivicCare makes healthcare policy accessible. Track health bills, find care, and contact your representatives.");

  return (
    <div className="bg-background">
      <HeroSection />

      <section className="px-6 py-12 md:px-10" aria-labelledby="start-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="start-heading" className="mb-6 text-xl font-semibold text-foreground">
            Start here
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <action.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-foreground">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DistrictDashboard />
      <HowItWorksSection />
      <ActionSection />
      <FaqSection />
    </div>
  );
};

export default Index;
