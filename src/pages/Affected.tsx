import PageHero from "@/components/sections/PageHero";
import AffectedSection from "@/components/sections/AffectedSection";
import { usePageTitle } from "@/hooks/usePageTitle";

const Affected = () => {
  usePageTitle("Who's Affected", "See how healthcare legislation impacts students, families, workers, and seniors.");

  return (
    <div className="bg-background">
      <PageHero badge="Who it touches" title="Who's affected" subtitle="How health legislation lands on students, families, seniors, workers, and veterans." />
      <AffectedSection />
    </div>
  );
};

export default Affected;
