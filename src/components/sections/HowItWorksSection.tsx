import { Search, BookOpen, HeartHandshake } from "lucide-react";

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
  return (
    <section id="how-it-works" className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Simple & Transparent</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            How CivicCare Works
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
              )}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors relative">
                <s.icon className="w-7 h-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
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
