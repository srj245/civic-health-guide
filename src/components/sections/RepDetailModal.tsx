import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RepBill {
  title: string;
  type: string;
  number: number;
  congress: number;
  role: "sponsor" | "cosponsor";
  introducedDate: string | null;
  latestAction: string | null;
  url: string | null;
}

interface RepBillsData {
  bioguideId: string;
  congress: number;
  sponsoredHealthBills: number;
  cosponsoredHealthBills: number;
  sample: RepBill[];
  truncated?: boolean;
}

interface Props {
  repName: string;
  repUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RepDetailModal = ({ repName, repUrl, open, onOpenChange }: Props) => {
  const [data, setData] = useState<RepBillsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !repUrl) return;
    setLoading(true);
    setError(null);

    const match = repUrl.match(/member\/([A-Z]\d{6})/);
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
      .catch((e: unknown) => setError((e instanceof Error && e.message) || "Failed to load this representative's bills"))
      .finally(() => setLoading(false));
  }, [open, repUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">{repName}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-medium text-foreground">{data.sponsoredHealthBills}</p>
                <p className="text-xs text-muted-foreground">Health bills sponsored this Congress</p>
              </div>
              <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-medium text-foreground">{data.cosponsoredHealthBills}</p>
                <p className="text-xs text-muted-foreground">Cosponsored</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Counts bills introduced in the {data.congress}th Congress whose titles are about health,
              from Congress.gov. Sponsoring a bill is not the same as voting on it.
              {data.truncated ? " This member has many bills, so counts may be a lower bound." : ""}
            </p>

            {data.sample.length > 0 ? (
              <div>
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" />
                  Health bills ({data.sample.length}
                  {data.sponsoredHealthBills + data.cosponsoredHealthBills > data.sample.length
                    ? ` of ${data.sponsoredHealthBills + data.cosponsoredHealthBills}`
                    : ""}
                  )
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data.sample.map((bill, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {bill.type.toUpperCase()}{bill.number}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">{bill.role}</Badge>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{bill.title}</p>
                      {bill.latestAction && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          Latest action: {bill.latestAction}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No health-related bills sponsored or cosponsored this Congress.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RepDetailModal;
