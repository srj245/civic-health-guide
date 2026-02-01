import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillDetails, type Bill } from "@/hooks/useCongressApi";
import { Calendar, FileText, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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

            {/* Summary */}
            {details.summary && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Summary
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

            {/* External Link */}
            {details.url && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(`https://congress.gov/bill/${details.congress}th-congress/${details.type === 'hr' ? 'house-bill' : 'senate-bill'}/${details.number}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Congress.gov
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailModal;
