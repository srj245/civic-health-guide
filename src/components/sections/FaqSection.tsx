import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Is CivicCare a political or partisan site?",
    a: "No. CivicCare is completely nonpartisan. We present legislative facts and plain-English summaries without political commentary or endorsements.",
  },
  {
    q: "Where does the bill data come from?",
    a: "All legislative data is sourced directly from the official Congress.gov API, ensuring accuracy and timeliness.",
  },
  {
    q: "How do I find healthcare resources near me?",
    a: "Use the \"Find Care\" section to search by zip code. We'll show you community health centers, mental health services, and other local resources.",
  },
  {
    q: "Is CivicCare free to use?",
    a: "Yes, CivicCare is completely free. Our mission is to make health policy information accessible to everyone.",
  },
  {
    q: "How often is the data updated?",
    a: "Bill information is updated daily from Congress.gov. Healthcare resource directories are refreshed regularly to keep listings accurate.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-14 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Common Questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-5 data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
