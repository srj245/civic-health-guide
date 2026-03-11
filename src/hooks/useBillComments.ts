import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BillComment {
  id: string;
  user_id: string;
  bill_id: string;
  content: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

export function useBillComments(billId: string | null) {
  const { user } = useAuth();
  const [comments, setComments] = useState<BillComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!billId) { setComments([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bill_comments")
        .select("*")
        .eq("bill_id", billId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setComments((data || []) as BillComment[]);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Realtime subscription
  useEffect(() => {
    if (!billId) return;
    const channel = supabase
      .channel(`bill-comments-${billId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bill_comments", filter: `bill_id=eq.${billId}` },
        () => { fetchComments(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [billId, fetchComments]);

  const addComment = useCallback(async (content: string) => {
    if (!user || !billId || !content.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bill_comments").insert({
        user_id: user.id,
        bill_id: billId,
        content: content.trim(),
        user_email: user.email || "Anonymous",
      });
      if (error) throw error;
    } catch (err) {
      console.error("Failed to add comment:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [user, billId]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { error } = await supabase.from("bill_comments").delete().eq("id", commentId);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to delete comment:", err);
      throw err;
    }
  }, []);

  return { comments, loading, submitting, addComment, deleteComment, commentCount: comments.length };
}
