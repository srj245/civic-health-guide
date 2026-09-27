import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowRight, FileText, Bookmark } from "lucide-react";
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
  const { bills, loading, error } = useHealthBills(8);
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
    <section id="news" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">

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

        {/* Bills Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {bills.map((bill, index) => (
              <Card
                key={bill.id}
                className="group cursor-pointer border-border/50 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 stagger-child"
                style={{ '--stagger-i': index } as React.CSSProperties}
                onClick={() => handleReadMore(bill)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs font-medium animate-bounce-in" style={{ animationDelay: `${index * 0.05 + 0.2}s` }}>
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
                      <button 
                        className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all duration-300"
                      >
                        View details
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
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
