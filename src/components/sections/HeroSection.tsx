import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Search, Users } from "lucide-react";

const fullText = "Understand How Government Decisions Affect Your Health";

const HeroSection = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 35);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!typingDone) return;
    const blink = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(blink);
  }, [typingDone]);

  const features = [
    { icon: Search, label: "Plain English Explanations", desc: "No law degree needed" },
    { icon: Users, label: "See Who's Affected", desc: "Students, families, seniors" },
    { icon: Shield, label: "Find Local Resources", desc: "Clinics, services, support" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Animated mesh orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px] animate-orb-1 top-[-10%] left-[-5%]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-accent/20 blur-[100px] animate-orb-2 bottom-[5%] right-[-5%]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-primary-foreground/10 blur-[80px] animate-orb-3 top-[40%] left-[50%]" />
      </div>

      {/* Radial overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.1)_0%,_transparent_50%)]" />

      {/* Parallax decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-24 h-24 border-2 border-primary-foreground/10 rounded-full top-[15%] right-[10%] animate-float" />
        <div className="absolute w-16 h-16 border border-primary-foreground/10 rounded-lg top-[60%] left-[8%] animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute w-10 h-10 bg-accent/20 rounded-full top-[25%] left-[20%] animate-float" style={{ animationDelay: "0.8s" }} />
        <div className="absolute w-6 h-6 bg-primary-foreground/10 rounded-full bottom-[30%] right-[25%] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-bounce-in">
            <Shield className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Nonpartisan • Accessible • For Everyone</span>
          </div>

          {/* Typewriter Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 min-h-[3.5em] md:min-h-[2.5em]">
            <span className="gradient-text-animated">{displayedText}</span>
            <span
              className={`inline-block w-[3px] h-[1em] bg-accent ml-1 align-middle transition-opacity duration-100 ${showCursor ? "opacity-100" : "opacity-0"}`}
            />
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            CivicCare translates complex healthcare policies and news into plain English—and connects you to real care in your community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" onClick={() => navigate("/news")} className="shimmer-hover group">
              Explore Health Updates
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
            <Button variant="hero" size="xl" onClick={() => navigate("/care")} className="shimmer-hover group shadow-xl hover:shadow-2xl">
              Find Care Near Me
              <Search className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {features.map((item, i) => (
              <div
                key={item.label}
                className="flex flex-col items-center p-4 rounded-2xl glassmorphism-card hover:-translate-y-1 transition-all duration-300 stagger-child"
                style={{ '--stagger-i': i + 4 } as React.CSSProperties}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-3 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-1">{item.label}</h3>
                <p className="text-sm text-primary-foreground/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
