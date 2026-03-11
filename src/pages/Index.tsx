import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, MapPin, Megaphone, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import StatisticsSection from "@/components/sections/StatisticsSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import FaqSection from "@/components/sections/FaqSection";
import ActionSection from "@/components/sections/ActionSection";

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

const Index = () => {
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    if (href.startsWith("/#")) {
      document.querySelector(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="bg-background">
      {/* Dashboard Hero */}
      <section className="px-6 py-10 md:px-10 md:py-14">
        <div className="max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome to <span className="text-primary">CivicCare</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            Understand how government decisions affect your health. Plain English, real resources.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="cursor-pointer hover:shadow-card-hover transition-all duration-200 group border-border hover:border-primary/30"
                onClick={() => handleClick(action.href)}
              >
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-3 transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <StatisticsSection />
      <HowItWorksSection />
      <ActionSection />
      <FaqSection />
    </div>
  );
};

export default Index;
