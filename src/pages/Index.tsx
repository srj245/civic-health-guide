import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, MapPin, Megaphone, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/sections/HeroSection";
import StatisticsSection from "@/components/sections/StatisticsSection";
import DistrictDashboard from "@/components/sections/DistrictDashboard";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import FaqSection from "@/components/sections/FaqSection";
import ActionSection from "@/components/sections/ActionSection";
import MostDiscussedSection from "@/components/sections/MostDiscussedSection";
import EngagementBanner from "@/components/sections/EngagementBanner";
import OnboardingTour from "@/components/sections/OnboardingTour";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTilt } from "@/hooks/useTilt";
import { useRef } from "react";

const quickActions = [
  {
    icon: TrendingUp,
    title: "Explore Health Bills",
    description: "Track real-time legislation from Congress",
    href: "/news",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Who's Affected",
    description: "See how policies impact your community",
    href: "/affected",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: MapPin,
    title: "Find Care",
    description: "Discover clinics and resources near you",
    href: "/care",
    color: "bg-success/10 text-success",
  },
  {
    icon: Megaphone,
    title: "Take Action",
    description: "Contact reps and make your voice heard",
    href: "/#action",
    color: "bg-warning/10 text-warning-foreground",
  },
];

const TiltCard = ({ action, index, onClick }: { action: typeof quickActions[0]; index: number; onClick: () => void }) => {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt<HTMLDivElement>(6);

  return (
    <Card
      ref={ref}
      className="cursor-pointer hover:shadow-card-hover transition-all duration-300 group border-border hover:border-primary/30 stagger-child focus-visible:ring-2 focus-visible:ring-primary will-change-transform"
      style={{ '--stagger-i': index, transition: 'transform 0.15s ease-out, box-shadow 0.3s' } as React.CSSProperties}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <CardContent className="p-5">
        <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}>
          <action.icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {action.title}
        </h3>
        <p className="text-sm text-muted-foreground">{action.description}</p>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-3 transition-all duration-300 group-hover:translate-x-1" />
      </CardContent>
    </Card>
  );
};

const Index = () => {
  const navigate = useNavigate();
  usePageTitle("", "CivicCare makes healthcare policy accessible. Track health bills, find care, and contact your representatives.");

  const handleClick = (href: string) => {
    if (href.startsWith("/#")) {
      document.querySelector(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <div className="bg-background animate-fade-in">
      <OnboardingTour />
      {/* Full-screen Hero */}
      <HeroSection />

      {/* Quick Actions */}
      <section className="px-6 py-10 md:px-10 md:py-14">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <TiltCard
                key={action.title}
                action={action}
                index={index}
                onClick={() => handleClick(action.href)}
              />
            ))}
          </div>
        </div>
      </section>

      <EngagementBanner />
      <StatisticsSection />
      <MostDiscussedSection />
      <DistrictDashboard />
      <HowItWorksSection />
      <ActionSection />
      <FaqSection />
    </div>
  );
};

export default Index;
