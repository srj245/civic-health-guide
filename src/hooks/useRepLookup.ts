import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DistrictLocation, Representative, RepLookupResponse } from "@/lib/reps";

export const ZIP_STORAGE_KEY = "civiccare_zip";

export function savedZip(): string {
  try {
    return localStorage.getItem(ZIP_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

/** Finds a district's members by ZIP, or a whole state's delegation. */
export function useRepLookup() {
  const [members, setMembers] = useState<Representative[]>([]);
  const [location, setLocation] = useState<DistrictLocation | null>(null);
  const [unresolved, setUnresolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const lookup = useCallback(async (body: { zip: string } | { state: string }) => {
    if ("zip" in body) {
      if (!/^\d{5}$/.test(body.zip)) {
        setError("Enter a 5-digit ZIP code.");
        return;
      }
      try {
        localStorage.setItem(ZIP_STORAGE_KEY, body.zip);
      } catch {
        /* storage unavailable */
      }
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke<RepLookupResponse>("find-representatives", { body });
      if (fnError) throw new Error("We couldn't reach the representative directory. Please try again.");
      if (data?.error) throw new Error(data.error);
      setMembers(data?.members ?? []);
      setLocation(data?.location ?? null);
      setUnresolved(Boolean(data?.districtUnresolved));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMembers([]);
      setLocation(null);
      setUnresolved(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMembers([]);
    setLocation(null);
    setUnresolved(false);
    setError(null);
    setSearched(false);
    try {
      localStorage.removeItem(ZIP_STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { members, location, unresolved, loading, error, searched, lookup, reset };
}
