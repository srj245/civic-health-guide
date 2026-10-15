import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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
  const handle = comment.user_email.split("@")[0];

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-border pl-3" : ""}>
      <div className="group flex gap-2 py-1.5">
        {/* Vote buttons */}
        <div className="flex shrink-0 flex-col items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={comment.userVote === 1}
            onClick={() => onVote(comment.id, 1)}
            className={comment.userVote === 1 ? "text-foreground" : "text-muted-foreground"}
            aria-label="Upvote"
          >
            <ChevronUp aria-hidden="true" />
          </Button>
          <span
            aria-label={`Score ${comment.score}`}
            className={`text-sm tabular-nums leading-none ${comment.score < 0 ? "text-destructive" : "text-foreground"}`}
          >
            {comment.score}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={comment.userVote === -1}
            onClick={() => onVote(comment.id, -1)}
            className={comment.userVote === -1 ? "text-destructive" : "text-muted-foreground"}
            aria-label="Downvote"
          >
            <ChevronDown aria-hidden="true" />
          </Button>
        </div>

        {/* Avatar */}
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs text-foreground" aria-hidden="true">
          {getInitials(comment.user_email)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-xs font-medium text-foreground">{handle}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
            {user && depth < maxDepth && (
              <button
                type="button"
                aria-expanded={replyingTo === comment.id}
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-0.5 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Reply className="h-3 w-3" aria-hidden="true" /> Reply
              </button>
            )}
            {user?.id === comment.user_id && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="rounded-md p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 group-focus-within:opacity-100"
                aria-label="Delete comment"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-foreground">
            {comment.content}
          </p>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-2 flex items-center gap-2">
              <label htmlFor={`reply-${comment.id}`} className="sr-only">Reply to {handle}</label>
              <Input
                id={`reply-${comment.id}`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${handle}...`}
                className="h-9 flex-1"
                maxLength={500}
                disabled={submitting}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onReplySubmit(comment.id); } }}
              />
              <Button type="button" size="icon-sm" disabled={!replyText.trim() || submitting} onClick={() => onReplySubmit(comment.id)} aria-label="Post reply">
                <Send aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setReplyingTo(null)} aria-label="Cancel reply">
                <X aria-hidden="true" />
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
      <h3 className="flex items-center gap-2 text-lg text-foreground">
        <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        Discussion
        {commentCount > 0 && (
          <span className="text-xs text-muted-foreground">
            ({commentCount})
          </span>
        )}
      </h3>

      {/* Top-level comment input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs text-foreground" aria-hidden="true">
            {getInitials(user.email || "?")}
          </div>
          <label htmlFor="new-comment" className="sr-only">Add a comment</label>
          <Input
            id="new-comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your perspective on this bill..."
            className="h-10 flex-1"
            maxLength={500}
            disabled={submitting}
          />
          <Button type="submit" size="icon" disabled={!newComment.trim() || submitting} className="shrink-0" aria-label="Post comment">
            <Send aria-hidden="true" />
          </Button>
        </form>
      ) : (
        <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/auth")}>
          <LogIn aria-hidden="true" />
          Sign in to join the discussion
        </Button>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Threaded comments */}
      {!loading && comments.length > 0 && (
        <div className="max-h-80 space-y-1 overflow-y-auto">
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
        <EmptyState compact title="No comments yet" body="Be the first to share your perspective." />
      )}
    </div>
  );
};

export default BillDiscussion;
