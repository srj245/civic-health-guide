import AffectedSection from "@/components/sections/AffectedSection";
import { usePageTitle } from "@/hooks/usePageTitle";

const Affected = () => {
  usePageTitle("Who's Affected", "See how healthcare legislation impacts students, families, workers, and seniors.");

  return (
    <div className="bg-background">
      <div className="px-6 py-8 md:px-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Who's Affected</h1>
        <p className="text-muted-foreground mb-6">See how healthcare legislation impacts different groups in your community.</p>
      </div>
      <AffectedSection />
    </div>
  );
};

export default Affected;
