import { Search, BookOpen, HeartHandshake } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/primitives";
import { useT } from "@/i18n";

const steps = [
  { icon: Search, title: "how.step1Title", description: "how.step1Desc" },
  { icon: BookOpen, title: "how.step2Title", description: "how.step2Desc" },
  { icon: HeartHandshake, title: "how.step3Title", description: "how.step3Desc" },
] as const;

const HowItWorksSection = () => {
  const t = useT();
  return (
    <Section rule id="how-it-works" aria-labelledby="how-heading">
      <div>
        <Reveal>
          <SectionHeading id="how-heading" title={t("how.heading")} />
        </Reveal>
        <Reveal as="ol" stagger delay={100} className="mt-10 grid gap-10 md:grid-cols-3">
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
                  <s.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <h3 className="text-lg text-foreground">{t(s.title)}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.description)}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </Section>
  );
};

export default HowItWorksSection;
