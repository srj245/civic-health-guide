import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RepBill {
  title: string;
  type: string;
  number: number;
  congress: number;
  role: string;
}

interface RepVoteData {
  healthBills: RepBill[];
  sponsoredCount: number;
  cosponsoredCount: number;
  score: number;
  scoreLabel: string;
}

interface Props {
  repName: string;
  repUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RepDetailModal = ({ repName, repUrl, open, onOpenChange }: Props) => {
  const [data, setData] = useState<RepVoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !repUrl) return;
    setLoading(true);
    setError(null);

    const match = repUrl.match(/member\/([A-Z]\d+)/);
    const bioguideId = match?.[1];
    if (!bioguideId) {
      setError("Unable to find member ID");
      setLoading(false);
      return;
    }

    supabase.functions
      .invoke("rep-votes", { body: { bioguideId } })
      .then(({ data: d, error: e }) => {
        if (e) throw e;
        if (d?.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e: any) => setError(e.message || "Failed to load voting data"))
      .finally(() => setLoading(false));
  }, [open, repUrl]);

  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-success/10 text-success border-success/20";
    if (score >= 4) return "bg-warning/10 text-warning-foreground border-warning/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{repName}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {error && <p className="text-destructive text-sm py-4">{error}</p>}

        {!loading && !error && data && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className={`rounded-xl border-2 p-5 text-center ${getScoreColor(data.score)}`}>
              <Award className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{data.score}/10</p>
              <p className="text-sm font-medium">{data.scoreLabel}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{data.sponsoredCount}</p>
                <p className="text-xs text-muted-foreground">Health Bills Sponsored</p>
              </div>
              <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{data.cosponsoredCount}</p>
                <p className="text-xs text-muted-foreground">Health Bills Cosponsored</p>
              </div>
            </div>

            {/* Bills List */}
            {data.healthBills.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" />
                  Health-Related Bills ({data.healthBills.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data.healthBills.map((bill, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {bill.type.toUpperCase()}{bill.number}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">{bill.role}</Badge>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{bill.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.healthBills.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No health-related bills found for this representative.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RepDetailModal;
