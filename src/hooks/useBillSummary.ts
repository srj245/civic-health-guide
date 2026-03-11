import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BillSummary {
  plainEnglish: string;
  impact: string;
}

export function useBillSummary() {
  const [summary, setSummary] = useState<BillSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (title: string, officialSummary?: string, latestAction?: string) => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('summarize-bill', {
        body: { title, summary: officialSummary, latestAction },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setSummary(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error, summarize };
}
