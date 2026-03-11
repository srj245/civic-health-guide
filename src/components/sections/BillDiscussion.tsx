import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Send, Trash2, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBillComments } from "@/hooks/useBillComments";
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

const BillDiscussion = ({ billId }: Props) => {
  const { user } = useAuth();
  const { comments, loading, submitting, addComment, deleteComment, commentCount } = useBillComments(billId);
  const [newComment, setNewComment] = useState("");
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

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      toast({ title: "Comment deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Community Discussion
        {commentCount > 0 && (
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            {commentCount}
          </span>
        )}
      </h3>

      {/* Comment input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(user.email || "?")}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your perspective on this bill..."
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              maxLength={500}
              disabled={submitting}
            />
            <Button type="submit" size="sm" disabled={!newComment.trim() || submitting} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => navigate("/auth")}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
        >
          <LogIn className="w-4 h-4" />
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

      {/* Comments list */}
      {!loading && comments.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(comment.user_email)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground truncate">
                    {comment.user_email.split("@")[0]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
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
