import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/sections/PageHero";
import AffectedSection from "@/components/sections/AffectedSection";
import { Users } from "lucide-react";

const Affected = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <PageHero
          icon={Users}
          badge="Who's Affected"
          title="See How Policies Impact You"
          subtitle="Explore how healthcare legislation affects different groups—students, families, seniors, veterans, and more."
        />
        <AffectedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Affected;
