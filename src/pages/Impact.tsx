import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import ImpactForm from "@/components/sections/ImpactForm";
import ImpactResults from "@/components/sections/ImpactResults";
import PageHero from "@/components/sections/PageHero";
import { Calculator } from "lucide-react";

export interface ImpactProfile {
  ageRange: string;
  insuranceType: string;
  concerns: string[];
  state: string;
}

export interface ImpactResult {
  billTitle: string;
  billId: string;
  impact: string;
  relevance: "high" | "medium" | "low";
}

const Impact = () => {
  usePageTitle("Impact Calculator", "See how current health bills affect you personally.");
  const [profile, setProfile] = useState<ImpactProfile | null>(null);
  const [results, setResults] = useState<ImpactResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (p: ImpactProfile) => {
    setProfile(p);
    setLoading(true);
    setError(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error: fnError } = await supabase.functions.invoke("impact-calculator", {
        body: p,
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setResults(data?.results || []);
    } catch (e: any) {
      setError(e.message || "Failed to calculate impact");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProfile(null);
    setResults([]);
    setError(null);
  };

  return (
    <div className="bg-background animate-fade-in">
      <PageHero
        icon={Calculator}
        badge="Personalized"
        title="Impact Calculator"
        subtitle="Enter your situation and see which current health bills affect you most."
      />
      <section className="px-6 py-8 md:px-10">
        <div className="max-w-3xl mx-auto">
          {!profile ? (
            <ImpactForm onSubmit={handleSubmit} />
          ) : (
            <ImpactResults
              profile={profile}
              results={results}
              loading={loading}
              error={error}
              onReset={handleReset}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Impact;
