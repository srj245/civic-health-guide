import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowRight, FileText } from "lucide-react";
import { useHealthBills, type Bill } from "@/hooks/useCongressApi";
import BillDetailModal from "./BillDetailModal";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getBillCategory(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('medicare')) return 'Medicare';
  if (titleLower.includes('medicaid')) return 'Medicaid';
  if (titleLower.includes('mental health')) return 'Mental Health';
  if (titleLower.includes('drug') || titleLower.includes('prescription')) return 'Prescription Drugs';
  if (titleLower.includes('insurance')) return 'Health Insurance';
  if (titleLower.includes('veteran')) return 'Veterans Health';
  return 'Health Policy';
}

const NewsSection = () => {
  const { bills, loading, error } = useHealthBills(8);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleReadMore = (bill: Bill) => {
    setSelectedBill(bill);
    setModalOpen(true);
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
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatTimeAgo(bill.updateDate)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        2 min read
                      </span>
                    </div>
                    <button 
                      className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all duration-300"
                    >
                      View details
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-10">
          <a
            href="https://congress.gov/search?q=%7B%22congress%22%3A%22118%22%2C%22source%22%3A%22legislation%22%2C%22subject%22%3A%22Health%22%7D"
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
