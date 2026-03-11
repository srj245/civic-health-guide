import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface DiscussedBill {
  bill_id: string;
  comment_count: number;
}

const MostDiscussedSection = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<DiscussedBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostDiscussed = async () => {
      try {
        const { data, error } = await supabase
          .from("bill_comments")
          .select("bill_id");

        if (error) throw error;

        // Count comments per bill
        const counts = new Map<string, number>();
        (data || []).forEach((row) => {
          counts.set(row.bill_id, (counts.get(row.bill_id) || 0) + 1);
        });

        const sorted = Array.from(counts.entries())
          .map(([bill_id, comment_count]) => ({ bill_id, comment_count }))
          .sort((a, b) => b.comment_count - a.comment_count)
          .slice(0, 4);

        setBills(sorted);
      } catch (err) {
        console.error("Failed to fetch most discussed bills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMostDiscussed();
  }, []);

  if (!loading && bills.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Most Discussed
            </h2>
            <p className="text-sm text-muted-foreground">
              Bills sparking the most community conversation
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bills.map((bill, index) => (
              <Card
                key={bill.bill_id}
                className="cursor-pointer group hover:shadow-card-hover transition-all duration-300 border-border hover:border-primary/30"
                onClick={() => navigate("/news")}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono"
                    >
                      #{index + 1}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {bill.comment_count}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {bill.bill_id}
                  </p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-3 transition-all duration-300 group-hover:translate-x-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MostDiscussedSection;
