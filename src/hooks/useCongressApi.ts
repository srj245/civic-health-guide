import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Bill {
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

interface BillDetail extends Bill {
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

interface CongressApiResponse {
  bills?: Bill[];
  bill?: BillDetail;
  subjects?: string[];
  error?: string;
}

export function useRecentBills(limit = 10) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBills() {
      try {
        setLoading(true);
        const { data, error: fnError } = await supabase.functions.invoke<CongressApiResponse>(
          'congress-api',
          { body: { action: 'recent-bills', limit } }
        );

        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);
        
        setBills(data?.bills || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    }

    fetchBills();
  }, [limit]);

  return { bills, loading, error, refetch: () => {} };
}

export function useHealthBills(limit = 10) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBills() {
      try {
        setLoading(true);
        const { data, error: fnError } = await supabase.functions.invoke<CongressApiResponse>(
          'congress-api',
          { body: { action: 'health-bills', limit } }
        );

        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);
        
        setBills(data?.bills || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health bills');
      } finally {
        setLoading(false);
      }
    }

    fetchBills();
  }, [limit]);

  return { bills, loading, error };
}

export function useBillDetails(billId: string | null, congress = '119') {
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) {
      setBill(null);
      return;
    }

    async function fetchBill() {
      try {
        setLoading(true);
        const { data, error: fnError } = await supabase.functions.invoke<CongressApiResponse>(
          'congress-api',
          { body: { action: 'bill-details', billId, congress } }
        );

        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);
        
        setBill(data?.bill || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bill details');
      } finally {
        setLoading(false);
      }
    }

    fetchBill();
  }, [billId, congress]);

  return { bill, loading, error };
}

export type { Bill, BillDetail };
