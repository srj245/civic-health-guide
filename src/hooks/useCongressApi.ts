import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Bill {
  id: string;
  congress: number;
  type: string;
  number: number;
  title: string;
  latestAction?: {
    actionDate: string;
    text: string;
  };
  updateDate: string;
  url?: string;
}

export interface BillDetail extends Bill {
  summary?: string;
  sponsors?: Array<{
    firstName: string;
    lastName: string;
    party: string;
    state: string;
  }>;
  cosponsors?: number;
  committees?: Array<{ name: string }>;
  policyArea?: { name: string };
}

interface HealthBillsResponse {
  bills?: Bill[];
  total?: number;
  fetchedAt?: number;
  error?: string;
}

interface BillDetailResponse {
  bill?: BillDetail;
  error?: string;
}

const HEALTH_BILLS_LIMIT = 100;
const STALE_MS = 10 * 60 * 1000;

async function fetchHealthBills(): Promise<HealthBillsResponse> {
  const { data, error } = await supabase.functions.invoke<HealthBillsResponse>("congress-api", {
    body: { action: "health-bills", limit: HEALTH_BILLS_LIMIT },
  });
  if (error) throw new Error("Couldn't reach Congress.gov");
  if (data?.error) throw new Error(data.error);
  return data ?? {};
}

/**
 * Recent health bills, shared by every component on the page through one
 * React Query cache entry. Refetches in the background every 10 minutes while
 * the tab is visible and on window focus, so the list stays current without
 * each component firing its own request.
 */
export function useHealthBills(limit = 10) {
  const query = useQuery({
    queryKey: ["health-bills"],
    queryFn: fetchHealthBills,
    staleTime: STALE_MS,
    refetchInterval: STALE_MS,
    refetchOnWindowFocus: true,
  });
  const all = query.data?.bills ?? [];
  return {
    bills: all.slice(0, limit),
    total: query.data?.total ?? all.length,
    loading: query.isPending,
    refreshing: query.isFetching && !query.isPending,
    error: query.error ? query.error.message : null,
    updatedAt: query.dataUpdatedAt || null,
    refetch: () => query.refetch(),
  };
}

export function useBillDetails(billId: string | null, congress = "119") {
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) {
      setBill(null);
      return;
    }
    let cancelled = false;
    async function fetchBill() {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fnError } = await supabase.functions.invoke<BillDetailResponse>("congress-api", {
          body: { action: "bill-details", billId, congress },
        });
        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);
        if (!cancelled) setBill(data?.bill || null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch bill details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBill();
    return () => {
      cancelled = true;
    };
  }, [billId, congress]);

  return { bill, loading, error };
}
