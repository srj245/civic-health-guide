import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillDetails, type Bill } from "@/hooks/useCongressApi";
import { useBillSummary } from "@/hooks/useBillSummary";
import { useTrackedBills } from "@/hooks/useTrackedBills";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, FileText, Users, ExternalLink, Sparkles, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import BillDiscussion from "./BillDiscussion";

interface BillDetailModalProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

const BillDetailModal = ({ bill, open, onOpenChange }: BillDetailModalProps) => {
  const { bill: details, loading, error } = useBillDetails(bill?.id || null);
  const { summary: aiSummary, loading: aiLoading, error: aiError, summarize } = useBillSummary();
  const { toggleTrack, isTracked } = useTrackedBills();
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-generate AI summary when details load
  useEffect(() => {
    if (details && open) {
      summarize(
        details.title || bill?.title || '',
        details.summary ? stripHtml(details.summary) : undefined,
        details.latestAction?.text
      );
    }
  }, [details, open]);

  const handleShare = async () => {
    const title = bill?.title || 'Health Bill';
    const text = aiSummary?.plainEnglish || `Check out this health bill: ${title}`;
    const url = `https://congress.gov/bill/${details?.congress || 118}th-congress/${details?.type === 'hr' ? 'house-bill' : 'senate-bill'}/${details?.number}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast({ title: "Copied to clipboard!", description: "Share link copied." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-8">
            {bill?.title || "Bill Details"}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {error && (
          <div className="text-destructive text-sm py-4">
            Failed to load bill details: {error}
          </div>
        )}

        {!loading && !error && details && (
          <div className="space-y-6">
            {/* Bill ID and Status */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                {details.type?.toUpperCase()}{details.number}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {details.congress}th Congress
              </Badge>
              {details.policyArea?.name && (
                <Badge className="text-sm bg-primary/10 text-primary">
                  {details.policyArea.name}
                </Badge>
              )}
            </div>

            {/* AI Plain English Summary */}
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h3 className="font-semibold flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                Plain English Summary
              </h3>
              {aiLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
              {aiError && (
                <p className="text-sm text-muted-foreground">Unable to generate summary. {aiError}</p>
              )}
              {aiSummary && (
                <>
                  <p className="text-sm text-foreground leading-relaxed">{aiSummary.plainEnglish}</p>
                  <div className="mt-3 pt-3 border-t border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">How does this affect you?</p>
                    <p className="text-sm text-foreground leading-relaxed">{aiSummary.impact}</p>
                  </div>
                </>
              )}
            </div>

            {/* Official Summary */}
            {details.summary && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Official Summary
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {stripHtml(details.summary)}
                </p>
              </div>
            )}

            {/* Latest Action */}
            {details.latestAction && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Latest Action
                </h3>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm font-medium">
                    {details.latestAction.actionDate}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {details.latestAction.text}
                  </p>
                </div>
              </div>
            )}

            {/* Sponsors */}
            {details.sponsors && details.sponsors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Sponsors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {details.sponsors.map((sponsor, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {sponsor.firstName} {sponsor.lastName} ({sponsor.party}-{sponsor.state})
                    </span>
                  ))}
                </div>
                {details.cosponsors && details.cosponsors > 0 && (
                  <p className="text-xs text-muted-foreground">
                    + {details.cosponsors} co-sponsors
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {bill && (
                <Button
                  variant={isTracked(bill.id) ? "default" : "outline"}
                  className="flex-1"
                  onClick={async () => {
                    if (!user) {
                      toast({ title: "Sign in required", description: "Create an account to track bills." });
                      return;
                    }
                    try {
                      const tracked = await toggleTrack(bill);
                      toast({ title: tracked ? "Bill tracked!" : "Bill untracked" });
                    } catch {
                      toast({ title: "Error", variant: "destructive" });
                    }
                  }}
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${isTracked(bill.id) ? "fill-current" : ""}`} />
                  {isTracked(bill.id) ? "Tracking" : "Track Bill"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.open(`https://congress.gov/bill/${details.congress}th-congress/${details.type === 'hr' ? 'house-bill' : 'senate-bill'}/${details.number}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Congress.gov
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Community Discussion */}
            <div className="pt-2 border-t border-border">
              <BillDiscussion billId={bill?.id || null} />
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailModal;
