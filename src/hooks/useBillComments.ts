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
  score: number;
  userVote: number; // -1, 0, or 1
}

interface CommentVote {
  id: string;
  user_id: string;
  comment_id: string;
  vote: number;
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
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("bill_comments")
        .select("*")
        .eq("bill_id", billId)
        .order("created_at", { ascending: true });
      if (commentsError) throw commentsError;

      const rawComments = (commentsData || []) as any[];
      if (rawComments.length === 0) { setComments([]); setLoading(false); return; }

      // Fetch all votes for these comments
      const commentIds = rawComments.map((c) => c.id);
      const { data: votesData } = await supabase
        .from("comment_votes")
        .select("*")
        .in("comment_id", commentIds);

      const votes = (votesData || []) as CommentVote[];

      // Aggregate votes per comment
      const scoreMap = new Map<string, number>();
      const userVoteMap = new Map<string, number>();
      for (const v of votes) {
        scoreMap.set(v.comment_id, (scoreMap.get(v.comment_id) || 0) + v.vote);
        if (user && v.user_id === user.id) {
          userVoteMap.set(v.comment_id, v.vote);
        }
      }

      const enriched: BillComment[] = rawComments.map((c) => ({
        ...c,
        score: scoreMap.get(c.id) || 0,
        userVote: userVoteMap.get(c.id) || 0,
      }));

      // Sort by score descending, then by date
      enriched.sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setComments(enriched);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [billId, user]);

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

  const vote = useCallback(async (commentId: string, direction: 1 | -1) => {
    if (!user) return;
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.userVote === direction) {
        // Remove vote (toggle off)
        await supabase.from("comment_votes").delete().eq("user_id", user.id).eq("comment_id", commentId);
      } else if (comment.userVote !== 0) {
        // Change vote direction
        await supabase.from("comment_votes").update({ vote: direction }).eq("user_id", user.id).eq("comment_id", commentId);
      } else {
        // New vote
        await supabase.from("comment_votes").insert({ user_id: user.id, comment_id: commentId, vote: direction });
      }
      // Optimistic update
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const oldVote = c.userVote;
          const newVote = oldVote === direction ? 0 : direction;
          return { ...c, userVote: newVote, score: c.score - oldVote + newVote };
        }).sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );
    } catch (err) {
      console.error("Failed to vote:", err);
      fetchComments(); // revert on error
    }
  }, [user, comments, fetchComments]);

  return { comments, loading, submitting, addComment, deleteComment, vote, commentCount: comments.length };
}
