import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, MapPin, Users, Calculator, X, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: TrendingUp,
    title: "Track Health Bills",
    description: "Browse real-time legislation from Congress, read AI-powered plain English summaries, and track the bills that matter to you.",
  },
  {
    icon: Users,
    title: "Contact Your Representatives",
    description: "Find your elected officials by state and send them a pre-written message about the health issues you care about.",
  },
  {
    icon: MapPin,
    title: "Find Care Near You",
    description: "Search for clinics, mental health services, and pharmacies in your area using our integrated care finder.",
  },
  {
    icon: Calculator,
    title: "See Your Personal Impact",
    description: "Use the Impact Calculator to discover which bills affect you based on your age, insurance, and health concerns.",
  },
];

const STORAGE_KEY = "civiccare_onboarding_done";

const OnboardingTour = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else dismiss();
  };

  if (!show) return null;

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-background border border-border shadow-xl p-8 animate-bounce-in">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{current.title}</h3>
          <p className="text-muted-foreground leading-relaxed mb-8">{current.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <Button onClick={next}>
            {step < steps.length - 1 ? (
              <>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
