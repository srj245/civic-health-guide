import PageHero from "@/components/sections/PageHero";
import AffectedSection from "@/components/sections/AffectedSection";
import Section from "@/components/layout/Section";
import { usePageTitle } from "@/hooks/usePageTitle";

const Affected = () => {
  usePageTitle("Who's affected", "See how healthcare legislation impacts students, families, workers, and seniors.");

  return (
    <div className="bg-background">
      <PageHero badge="Who it touches" title="Who's affected" subtitle="How health legislation lands on students, families, seniors, workers, and veterans." />
      <Section first id="affected">
        <AffectedSection />
      </Section>
    </div>
  );
};

export default Affected;
