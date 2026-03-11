import { Search, BookOpen, HeartHandshake } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Browse Updates",
    description: "We pull real-time bills from Congress and translate them into plain English.",
  },
  {
    icon: BookOpen,
    step: "2",
    title: "Understand the Impact",
    description: "See who's affected—students, families, veterans, seniors—and how.",
  },
  {
    icon: HeartHandshake,
    step: "3",
    title: "Find Care & Act",
    description: "Locate local resources, contact your rep, or share with your community.",
  },
];

const HowItWorksSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Simple & Transparent</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            How CivicCare Works
          </h2>
        </div>
        <div ref={ref} className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative text-center group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease-out ${i * 0.15}s, transform 0.5s ease-out ${i * 0.15}s`,
              }}
            >
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border"
                  style={{
                    transform: visible ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: `transform 0.6s ease-out ${0.3 + i * 0.2}s`,
                  }}
                />
              )}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors relative">
                <s.icon
                  className="w-7 h-7 text-primary"
                  style={{
                    animation: visible ? `bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${0.2 + i * 0.15}s both` : 'none',
                  }}
                />
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
                  style={{
                    animation: visible ? `bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${0.3 + i * 0.15}s both` : 'none',
                  }}
                >
                  {s.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
