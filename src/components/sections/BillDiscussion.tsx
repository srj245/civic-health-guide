import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Send, Trash2, LogIn, ChevronUp, ChevronDown, Reply, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import { useBillComments, type BillComment } from "@/hooks/useBillComments";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

function getInitials(email: string) {
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

interface Props {
  billId: string | null;
}

interface CommentNodeProps {
  comment: BillComment;
  depth: number;
  user: User | null;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (t: string) => void;
  onReplySubmit: (parentId: string) => void;
  onDelete: (id: string) => void;
  onVote: (id: string, dir: 1 | -1) => void;
  submitting: boolean;
}

const CommentNode = ({
  comment, depth, user, replyingTo, setReplyingTo, replyText, setReplyText,
  onReplySubmit, onDelete, onVote, submitting,
}: CommentNodeProps) => {
  const maxDepth = 3;

  return (
    <div className={depth > 0 ? "ml-6 pl-3 border-l-2 border-border/50" : ""}>
      <div className="flex gap-2 group py-1.5">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-0 shrink-0 pt-0.5">
          <button
            type="button"
            aria-pressed={comment.userVote === 1}
            onClick={() => onVote(comment.id, 1)}
            className={`p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              comment.userVote === 1 ? "text-primary" : "text-muted-foreground/50 hover:text-primary"
            }`}
            aria-label="Upvote"
          >
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span aria-label={`Score ${comment.score}`} className={`text-xs font-semibold tabular-nums leading-none ${
            comment.score > 0 ? "text-primary" : comment.score < 0 ? "text-destructive" : "text-muted-foreground"
          }`}>
            {comment.score}
          </span>
          <button
            type="button"
            aria-pressed={comment.userVote === -1}
            onClick={() => onVote(comment.id, -1)}
            className={`p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              comment.userVote === -1 ? "text-destructive" : "text-muted-foreground/50 hover:text-destructive"
            }`}
            aria-label="Downvote"
          >
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" aria-hidden="true">
          {getInitials(comment.user_email)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-foreground truncate">
              {comment.user_email.split("@")[0]}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
            {user && depth < maxDepth && (
              <button
                type="button"
                aria-expanded={replyingTo === comment.id}
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Reply className="w-3 h-3" aria-hidden="true" /> Reply
              </button>
            )}
            {user?.id === comment.user_id && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity rounded p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Delete comment"
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mt-0.5">
            {comment.content}
          </p>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="flex gap-2 mt-2">
              <label htmlFor={`reply-${comment.id}`} className="sr-only">Reply to {comment.user_email.split("@")[0]}</label>
              <input
                id={`reply-${comment.id}`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user_email.split("@")[0]}...`}
                className="flex-1 bg-secondary rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={500}
                disabled={submitting}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onReplySubmit(comment.id); } }}
              />
              <Button type="button" size="sm" className="h-7 px-2" disabled={!replyText.trim() || submitting} onClick={() => onReplySubmit(comment.id)} aria-label="Post reply">
                <Send className="w-3 h-3" aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 px-1.5" onClick={() => setReplyingTo(null)} aria-label="Cancel reply">
                <X className="w-3 h-3" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              user={user}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onReplySubmit={onReplySubmit}
              onDelete={onDelete}
              onVote={onVote}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BillDiscussion = ({ billId }: Props) => {
  const { user } = useAuth();
  const { comments, loading, submitting, addComment, deleteComment, vote, commentCount } = useBillComments(billId);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment(newComment);
      setNewComment("");
    } catch {
      toast({ title: "Failed to post comment", variant: "destructive" });
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyText.trim()) return;
    try {
      await addComment(replyText, parentId);
      setReplyText("");
      setReplyingTo(null);
    } catch {
      toast({ title: "Failed to post reply", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      toast({ title: "Comment deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleVote = (commentId: string, direction: 1 | -1) => {
    if (!user) {
      toast({ title: "Sign in to vote" });
      return;
    }
    vote(commentId, direction);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4" aria-hidden="true" />
        Community Discussion
        {commentCount > 0 && (
          <span className="text-xs text-muted-foreground font-normal">
            ({commentCount})
          </span>
        )}
      </h3>

      {/* Top-level comment input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0" aria-hidden="true">
            {getInitials(user.email || "?")}
          </div>
          <div className="flex-1 flex gap-2">
            <label htmlFor="new-comment" className="sr-only">Add a comment</label>
            <input
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your perspective on this bill..."
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={500}
              disabled={submitting}
            />
            <Button type="submit" size="sm" disabled={!newComment.trim() || submitting} className="shrink-0" aria-label="Post comment">
              <Send className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-secondary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          Sign in to join the discussion
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Threaded comments */}
      {!loading && comments.length > 0 && (
        <div className="max-h-80 overflow-y-auto space-y-1">
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              user={user}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onReplySubmit={handleReplySubmit}
              onDelete={handleDelete}
              onVote={handleVote}
              submitting={submitting}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && comments.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">
          No comments yet. Be the first to share your perspective!
        </p>
      )}
    </div>
  );
};

export default BillDiscussion;
