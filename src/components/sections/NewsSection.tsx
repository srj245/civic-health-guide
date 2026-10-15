import { useState } from "react";
import Section from "@/components/layout/Section";
import { Chip, IconInput, Surface } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowRight, FileText, Bookmark, Search, RefreshCw } from "lucide-react";
import { timeAgo } from "@/lib/time";
import { useHealthBills, type Bill } from "@/hooks/useCongressApi";
import { useTrackedBills } from "@/hooks/useTrackedBills";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BillDetailModal from "./BillDetailModal";
import BillTimeline from "@/components/sections/BillTimeline";

function formatActionDate(dateString?: string): string | null {
  if (!dateString) return null;
  const d = new Date(`${dateString.slice(0, 10)}T12:00:00`);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getBillCategory(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('medicare')) return 'Medicare';
  if (titleLower.includes('medicaid')) return 'Medicaid';
  if (titleLower.includes('mental health')) return 'Mental Health';
  if (titleLower.includes('prescription') || titleLower.includes('drug pricing') || titleLower.includes('insulin')) return 'Prescription Drugs';
  if (titleLower.includes('health insurance') || titleLower.includes('health coverage')) return 'Health Insurance';
  if (titleLower.includes('veteran')) return 'Veterans Health';
  return 'Health Policy';
}

const NewsSection = () => {
  const { bills: allBills, total, loading, refreshing, error, updatedAt, refetch } = useHealthBills(100);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const bills = q
    ? allBills.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          `${b.type}${b.number}`.toLowerCase().includes(q.replace(/[\s.]/g, "")) ||
          getBillCategory(b.title).toLowerCase().includes(q),
      )
    : allBills;
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { toggleTrack, isTracked } = useTrackedBills();
  const { toast } = useToast();

  const handleReadMore = (bill: Bill) => {
    setSelectedBill(bill);
    setModalOpen(true);
  };

  const handleTrack = async (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in required", description: "Create an account to track bills." });
      return;
    }
    try {
      const tracked = await toggleTrack(bill);
      toast({ title: tracked ? "Bill tracked" : "Bill untracked", description: bill.title });
    } catch {
      toast({ title: "Error", description: "Failed to update tracking.", variant: "destructive" });
    }
  };

  return (
    <Section first id="news">
      <div className="mb-6">
        <label htmlFor="bill-search" className="sr-only">Search bills</label>
        <div className="max-w-md">
          <IconInput
            icon={Search}
            id="bill-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, topic, or bill number"
          />
        </div>
        {!loading && !error && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-live="polite">
            <span>{q ? `${bills.length} of ${allBills.length} bills match` : `${total} health bills from the 2,000 most recently updated in Congress`}</span>
            {updatedAt && <span>· Updated {timeAgo(updatedAt)}</span>}
            <Button type="button" variant="ghost" size="sm" onClick={() => refetch()} disabled={refreshing} aria-label="Refresh bills">
              <RefreshCw className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Surface key={i} padding="md">
              <Skeleton className="mb-3 h-5 w-24" />
              <Skeleton className="mb-4 h-6 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Surface>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <EmptyState
          variant="error"
          icon={FileText}
          title="Couldn't reach Congress.gov"
          body="Try again in a moment."
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      )}

      {!loading && !error && q && bills.length === 0 && (
        <EmptyState compact title="No bills match" body={`Nothing matches "${query}". Try a different keyword or bill number.`} />
      )}

      {/* Bills grid */}
      {!loading && !error && bills.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2" data-stagger>
          {bills.map((bill) => (
            <Surface
              key={bill.id}
              variant="interactive"
              padding="md"
              role="button"
              tabIndex={0}
              className="group flex flex-col"
              onClick={() => handleReadMore(bill)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleReadMore(bill); } }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <Chip>{getBillCategory(bill.title)}</Chip>
                <span className="font-mono text-xs text-muted-foreground">
                  {bill.type.toUpperCase()}{bill.number}
                </span>
              </div>
              <h3 className="line-clamp-2 text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
                {bill.title}
              </h3>
              {bill.latestAction && (
                <p className="mb-4 mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {bill.latestAction.text}
                </p>
              )}

              <BillTimeline latestActionText={bill.latestAction?.text} type={bill.type} compact className="mb-3" />

              {/* Footer */}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    Latest action: {formatActionDate(bill.latestAction?.actionDate || bill.updateDate) ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-accent">
                    View details
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => handleTrack(e, bill)}
                    aria-label={isTracked(bill.id) ? "Untrack bill" : "Track bill"}
                  >
                    <Bookmark className={isTracked(bill.id) ? "fill-current text-foreground" : ""} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}

      {/* View all link */}
      <div className="mt-10 text-center">
        <a
          href="https://www.congress.gov/search?q=%7B%22congress%22%3A%22119%22%2C%22source%22%3A%22legislation%22%2C%22subject%22%3A%22Health%22%7D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent transition-colors hover:text-foreground"
        >
          View all health legislation on Congress.gov
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <BillDetailModal
        bill={selectedBill}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </Section>
  );
};

export default NewsSection;
