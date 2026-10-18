import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";

interface BillSummary {
  plainEnglish: string;
  impact: string;
}

/** Generates the plain-language summary in the user's chosen content language. */
export function useBillSummary() {
  const { language } = useI18n();
  const [summary, setSummary] = useState<BillSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (title: string, officialSummary?: string, latestAction?: string) => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("summarize-bill", {
        body: { title, summary: officialSummary, latestAction, language },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setSummary(data);
    } catch (e: unknown) {
      setError((e instanceof Error && e.message) || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error, summarize, language };
}
