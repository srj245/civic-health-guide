import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

export interface BillComment {
  id: string;
  user_id: string;
  bill_id: string;
  content: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  score: number;
  userVote: number;
  replies: BillComment[];
}

type CommentRow = Database["public"]["Tables"]["bill_comments"]["Row"];
type CommentInsert = Database["public"]["Tables"]["bill_comments"]["Insert"];

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
      const { data: commentsData, error: commentsError } = await supabase
        .from("bill_comments")
        .select("*")
        .eq("bill_id", billId)
        .order("created_at", { ascending: true });
      if (commentsError) throw commentsError;

      const rawComments = (commentsData || []) as CommentRow[];
      if (rawComments.length === 0) { setComments([]); setLoading(false); return; }

      // Fetch vote totals and the current user's own votes
      const commentIds = rawComments.map((c) => c.id);
      const [{ data: scoresData }, { data: myVotes }] = await Promise.all([
        supabase.rpc("get_comment_scores", { _comment_ids: commentIds }),
        user
          ? supabase.from("comment_votes").select("*").eq("user_id", user.id).in("comment_id", commentIds)
          : Promise.resolve({ data: [] as CommentVote[] }),
      ]);

      const scoreMap = new Map<string, number>();
      const userVoteMap = new Map<string, number>();
      for (const s of (scoresData || []) as { comment_id: string; score: number }[]) {
        scoreMap.set(s.comment_id, Number(s.score));
      }
      for (const v of (myVotes || []) as CommentVote[]) {
        userVoteMap.set(v.comment_id, v.vote);
      }

      // Enrich with scores
      const enriched: BillComment[] = rawComments.map((c) => ({
        ...c,
        score: scoreMap.get(c.id) || 0,
        userVote: userVoteMap.get(c.id) || 0,
        replies: [],
      }));

      // Build tree: separate root comments and replies
      const byId = new Map<string, BillComment>();
      enriched.forEach((c) => byId.set(c.id, c));

      const roots: BillComment[] = [];
      for (const c of enriched) {
        if (c.parent_id && byId.has(c.parent_id)) {
          byId.get(c.parent_id)!.replies.push(c);
        } else {
          roots.push(c);
        }
      }

      // Sort roots by score desc, replies by date asc (already ordered)
      roots.sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setComments(roots);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [billId, user]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  useEffect(() => {
    if (!billId) return;
    const channel = supabase
      .channel(`bill-comments-${billId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bill_comments", filter: `bill_id=eq.${billId}` }, () => { fetchComments(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [billId, fetchComments]);

  const addComment = useCallback(async (content: string, parentId?: string) => {
    if (!user || !billId || !content.trim()) return;
    setSubmitting(true);
    try {
      const row: CommentInsert = {
        user_id: user.id,
        bill_id: billId,
        content: content.trim(),
        user_email: (user.email || "Anonymous").split("@")[0] || "Anonymous",
      };
      if (parentId) row.parent_id = parentId;
      const { error } = await supabase.from("bill_comments").insert(row);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to add comment:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [user, billId]);

  const deleteComment = useCallback(async (commentId: string) => {
    const { error } = await supabase.from("bill_comments").delete().eq("id", commentId);
    if (error) throw error;
  }, []);

  // Flatten all comments to find for vote
  const allComments = useCallback((): BillComment[] => {
    const flat: BillComment[] = [];
    const walk = (list: BillComment[]) => { for (const c of list) { flat.push(c); walk(c.replies); } };
    walk(comments);
    return flat;
  }, [comments]);

  const vote = useCallback(async (commentId: string, direction: 1 | -1) => {
    if (!user) return;
    const all = allComments();
    const comment = all.find((c) => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.userVote === direction) {
        await supabase.from("comment_votes").delete().eq("user_id", user.id).eq("comment_id", commentId);
      } else if (comment.userVote !== 0) {
        await supabase.from("comment_votes").update({ vote: direction }).eq("user_id", user.id).eq("comment_id", commentId);
      } else {
        await supabase.from("comment_votes").insert({ user_id: user.id, comment_id: commentId, vote: direction });
      }
      fetchComments();
    } catch (err) {
      console.error("Failed to vote:", err);
      fetchComments();
    }
  }, [user, allComments, fetchComments]);

  // Count all comments including replies
  const totalCount = useCallback(() => {
    let count = 0;
    const walk = (list: BillComment[]) => { for (const c of list) { count++; walk(c.replies); } };
    walk(comments);
    return count;
  }, [comments]);

  return { comments, loading, submitting, addComment, deleteComment, vote, commentCount: totalCount() };
}
