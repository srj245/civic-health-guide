import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/layout/Section";
import { SectionHeading } from "@/components/ui/primitives";
import { useT } from "@/i18n";

const faqs = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
] as const;

const FaqSection = () => {
  const t = useT();
  return (
    <Section rule tint id="faq" aria-labelledby="faq-heading">
      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        <Reveal>
          <SectionHeading id="faq-heading" title={t("faq.heading")} />
        </Reveal>
        <Reveal stagger delay={100}>
        <Accordion type="single" collapsible className="divide-y divide-border border-y border-border">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-0">
              <AccordionTrigger className="py-4 text-left font-medium text-foreground hover:no-underline">
                {t(faq.q)}
              </AccordionTrigger>
              <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                {t(faq.a)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </Reveal>
      </div>
    </Section>
  );
};

export default FaqSection;
