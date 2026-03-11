import { useState } from "react";
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

interface UseCareFinderReturn {
  results: CareResult[];
  loading: boolean;
  error: string | null;
  searched: boolean;
  search: (params: {
    zipCode: string;
    category: string | null;
    lowCostOnly: boolean;
    includeTelehealth: boolean;
  }) => Promise<void>;
}

export function useCareFinder(): UseCareFinderReturn {
  const [results, setResults] = useState<CareResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async (params: {
    zipCode: string;
    category: string | null;
    lowCostOnly: boolean;
    includeTelehealth: boolean;
  }) => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("find-care", {
        body: params,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResults(data.results || []);
    } catch (err: any) {
      console.error("Care search error:", err);
      setError(err.message || "Failed to search for care facilities");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, searched, search };
}
