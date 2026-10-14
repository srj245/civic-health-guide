import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface CareResult {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  totalRatings: number;
  isOpen: boolean | null;
  lat: number;
  lng: number;
  types: string[];
}

interface SearchParams {
  zipCode: string;
  category: string | null;
  lowCostOnly: boolean;
  includeTelehealth: boolean;
}

const FRIENDLY_ERROR = "We couldn't load care results right now. Please try again in a moment.";

export function useCareFinder() {
  const [results, setResults] = useState<CareResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("find-care", { body: params });

      if (fnError) {
        let message = FRIENDLY_ERROR;
        if (fnError instanceof FunctionsHttpError) {
          try {
            const body = await fnError.context.json();
            if (body?.error) message = body.error;
          } catch { /* keep friendly default */ }
        }
        console.error("find-care failed:", fnError);
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);

      setResults(data.results || []);
    } catch (err: unknown) {
      setError((err instanceof Error && err.message) || FRIENDLY_ERROR);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, searched, search };
}
