import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Chip, Stat, Surface } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
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

  const totalBills = data ? data.sponsoredHealthBills + data.cosponsoredHealthBills : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{repName}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {error && <p className="py-4 text-sm text-destructive" role="alert">{error}</p>}

        {!loading && !error && data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Stat value={data.sponsoredHealthBills} label="Health bills sponsored" />
              <Stat value={data.cosponsoredHealthBills} label="Cosponsored" />
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Counts bills introduced in the {data.congress}th Congress whose titles are about health,
              from Congress.gov. Sponsoring a bill is not the same as voting on it.
              {data.truncated ? " This member has many bills, so counts may be a lower bound." : ""}
            </p>

            {data.sample.length > 0 ? (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg text-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Health bills ({data.sample.length}
                  {totalBills > data.sample.length ? ` of ${totalBills}` : ""})
                </h3>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {data.sample.map((bill, i) => (
                    <Surface key={i} variant="inset" padding="sm">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <Chip>{bill.type.toUpperCase()}{bill.number}</Chip>
                        <Chip className="capitalize">{bill.role}</Chip>
                      </div>
                      <p className="line-clamp-2 text-sm text-foreground">{bill.title}</p>
                      {bill.latestAction && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          Latest action: {bill.latestAction}
                        </p>
                      )}
                    </Surface>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                compact
                icon={FileText}
                title="No health bills yet"
                body="No health-related bills sponsored or cosponsored this Congress."
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RepDetailModal;
