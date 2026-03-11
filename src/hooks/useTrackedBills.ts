import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Bill } from "@/hooks/useCongressApi";

export interface TrackedBill {
  id: string;
  bill_id: string;
  bill_title: string;
  congress: number;
  bill_type: string;
  bill_number: number;
  latest_action_text: string | null;
  latest_action_date: string | null;
  created_at: string;
}

export function useTrackedBills() {
  const { user } = useAuth();
  const [trackedBills, setTrackedBills] = useState<TrackedBill[]>([]);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchTracked = useCallback(async () => {
    if (!user) {
      setTrackedBills([]);
      setTrackedIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tracked_bills")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const bills = (data || []) as TrackedBill[];
      setTrackedBills(bills);
      setTrackedIds(new Set(bills.map((b) => b.bill_id)));
    } catch (err) {
      console.error("Failed to fetch tracked bills:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTracked();
  }, [fetchTracked]);

  const toggleTrack = useCallback(
    async (bill: Bill) => {
      if (!user) return false;
      const billId = bill.id;

      if (trackedIds.has(billId)) {
        // Untrack
        const { error } = await supabase
          .from("tracked_bills")
          .delete()
          .eq("user_id", user.id)
          .eq("bill_id", billId);
        if (error) throw error;
        setTrackedBills((prev) => prev.filter((b) => b.bill_id !== billId));
        setTrackedIds((prev) => {
          const next = new Set(prev);
          next.delete(billId);
          return next;
        });
        return false; // now untracked
      } else {
        // Track
        const { error } = await supabase.from("tracked_bills").insert({
          user_id: user.id,
          bill_id: billId,
          bill_title: bill.title,
          congress: bill.congress,
          bill_type: bill.type,
          bill_number: bill.number,
          latest_action_text: bill.latestAction?.text || null,
          latest_action_date: bill.latestAction?.actionDate || null,
        });
        if (error) throw error;
        await fetchTracked();
        return true; // now tracked
      }
    },
    [user, trackedIds, fetchTracked]
  );

  const isTracked = useCallback(
    (billId: string) => trackedIds.has(billId),
    [trackedIds]
  );

  return { trackedBills, loading, toggleTrack, isTracked, count: trackedBills.length, refetch: fetchTracked };
}
