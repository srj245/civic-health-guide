import { Search, BookOpen, HeartHandshake } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Read the bill",
    description: "We pull health-related bills from Congress.gov as they move and translate them into plain English.",
  },
  {
    icon: BookOpen,
    title: "See who it touches",
    description: "Students, families, veterans, seniors: find out whether a bill changes anything for you.",
  },
  {
    icon: HeartHandshake,
    title: "Act on it",
    description: "Find care nearby, message your representative, or share what you learned.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="border-t border-border px-6 py-14 md:px-10 md:py-20" aria-labelledby="how-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="how-heading" className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          How CivicCare works
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-sm font-medium text-foreground"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h3 className="font-medium text-foreground">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorksSection;
