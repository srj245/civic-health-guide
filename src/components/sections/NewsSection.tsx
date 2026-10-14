import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowRight, FileText, Bookmark, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useHealthBills, type Bill } from "@/hooks/useCongressApi";
import { useTrackedBills } from "@/hooks/useTrackedBills";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BillDetailModal from "./BillDetailModal";

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
  const { bills: allBills, loading, error } = useHealthBills(24);
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
      toast({ title: tracked ? "Bill tracked!" : "Bill untracked", description: bill.title });
    } catch {
      toast({ title: "Error", description: "Failed to update tracking.", variant: "destructive" });
    }
  };


  return (
    <section id="news" className="py-6 md:py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto mb-6">
          <label htmlFor="bill-search" className="sr-only">Search bills</label>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="bill-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, topic, or bill number"
              className="pl-9"
            />
          </div>
          {!loading && !error && (
            <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
              {q ? `${bills.length} of ${allBills.length} bills match` : `${allBills.length} recent health bills from Congress.gov`}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-border/50 bg-card">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-24 mb-3" />
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unable to load bills from Congress. Please try again later.</p>
          </div>
        )}

        {!loading && !error && q && bills.length === 0 && (
          <p className="max-w-5xl mx-auto text-sm text-muted-foreground">No bills match "{query}".</p>
        )}

        {/* Bills Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {bills.map((bill, index) => (
              <Card
                key={bill.id}
                role="button"
                tabIndex={0}
                className="group cursor-pointer border-border bg-card transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => handleReadMore(bill)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleReadMore(bill); } }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs font-medium">
                      {getBillCategory(bill.title)}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {bill.type.toUpperCase()}{bill.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {bill.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  {bill.latestAction && (
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                      {bill.latestAction.text}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Latest action: {formatActionDate(bill.latestAction?.actionDate || bill.updateDate) ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary flex items-center gap-1">
                        View details
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                      <button
                        onClick={(e) => handleTrack(e, bill)}
                        className="p-1 rounded-md hover:bg-secondary transition-colors"
                        aria-label={isTracked(bill.id) ? "Untrack bill" : "Track bill"}
                      >
                        <Bookmark className={`w-4 h-4 ${isTracked(bill.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-10">
          <a
            href="https://www.congress.gov/search?q=%7B%22congress%22%3A%22119%22%2C%22source%22%3A%22legislation%22%2C%22subject%22%3A%22Health%22%7D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300 animate-underline"
          >
            View all health legislation on Congress.gov
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Bill Detail Modal */}
      <BillDetailModal
        bill={selectedBill}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
};

export default NewsSection;
