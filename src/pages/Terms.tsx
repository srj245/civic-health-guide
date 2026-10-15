import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import { usePageTitle } from "@/hooks/usePageTitle";

const sections = [
  {
    h: "Use of service",
    p: "CivicCare is a nonpartisan educational tool. You may use it to explore health legislation, find care resources, and take part in community discussions. You agree not to use the platform for harassment, misinformation, or any unlawful purpose.",
  },
  {
    h: "User content",
    p: "Comments and discussions you post are visible to other signed-in users. You retain ownership of your content but grant CivicCare a license to display it within the platform. We reserve the right to remove content that violates community guidelines.",
  },
  {
    h: "Disclaimer",
    p: "CivicCare provides AI-generated bill summaries for educational purposes only. They are not legal or medical advice. Always refer to the official Congress.gov text for authoritative information.",
  },
  {
    h: "Changes",
    p: "We may update these terms as the platform evolves. Continued use of CivicCare constitutes acceptance of any changes.",
  },
];

const Terms = () => {
  usePageTitle("Terms of service", "CivicCare terms of service and usage guidelines.");
  return (
    <div>
      <PageHero badge="Legal" title="Terms of service" subtitle="By using CivicCare, you agree to the following terms." />
      <Section first width="prose" className="space-y-10">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-2xl tracking-tight text-foreground">{s.h}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.p}</p>
          </div>
        ))}
        <p className="border-t border-border pt-4 text-sm text-muted-foreground">Last updated October 15, 2026</p>
      </Section>
    </div>
  );
};

export default Terms;
