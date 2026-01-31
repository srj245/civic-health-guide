import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, Mail, Vote, Share2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const actions = [
  {
    icon: Mail,
    title: "Contact Your Representatives",
    description: "Send a pre-written message about health issues that matter to you",
    cta: "Find Your Rep",
    color: "bg-primary",
  },
  {
    icon: Vote,
    title: "Check Your Voter Registration",
    description: "Make sure you're registered and ready to vote on health-related measures",
    cta: "Check Status",
    color: "bg-success",
  },
  {
    icon: Share2,
    title: "Share & Educate Others",
    description: "Help friends and family understand important health policy changes",
    cta: "Share CivicCare",
    color: "bg-info",
  },
];

const ActionSection = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleActionClick = (actionTitle: string) => {
    toast({
      title: "Coming Soon!",
      description: `${actionTitle} feature will be available soon.`,
    });
  };

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Please enter a valid email",
        description: "We need your email address to send you updates.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "You're subscribed!",
      description: "You'll receive weekly health policy digests.",
    });
    setEmail("");
  };

  return (
    <section id="action" className="py-20 md:py-28 bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30">
              <Megaphone className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">Take Action</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Turn Awareness into Impact
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Knowledge is power. Here are concrete ways you can make your voice heard on health issues that affect your community.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {actions.map((action, index) => (
              <div
                key={action.title}
                onClick={() => handleActionClick(action.title)}
                className="p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <action.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                  {action.title}
                </h3>
                <p className="text-primary-foreground/70 text-sm mb-5 leading-relaxed">
                  {action.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground group-hover:gap-2.5 transition-all">
                  {action.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="p-8 rounded-3xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-primary-foreground mb-3">
                Stay Informed, Stay Empowered
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                Get weekly digests of health policy updates tailored to your interests. No spam, just clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-primary-foreground/20 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
                />
                <Button variant="hero" size="lg" className="whitespace-nowrap" onClick={handleSubscribe}>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-primary-foreground/60 mt-4">
                By subscribing, you agree to receive emails from CivicCare. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActionSection;
