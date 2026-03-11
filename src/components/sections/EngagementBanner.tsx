import { useEffect, useState } from "react";
import { MessageSquare, Bookmark, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  comments: number;
  trackedBills: number;
  subscribers: number;
}

const EngagementBanner = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const [commentsRes, trackedRes, subsRes] = await Promise.all([
        supabase.from("bill_comments").select("id", { count: "exact", head: true }),
        supabase.from("tracked_bills").select("id", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        comments: commentsRes.count ?? 0,
        trackedBills: trackedRes.count ?? 0,
        subscribers: subsRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  const items = [
    { icon: MessageSquare, value: stats.comments, label: "Community Comments" },
    { icon: Bookmark, value: stats.trackedBills, label: "Bills Tracked" },
    { icon: Users, value: stats.subscribers, label: "Engaged Citizens" },
  ];

  return (
    <section className="px-6 py-8 md:px-10">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
          <p className="text-sm font-medium text-primary mb-4 text-center uppercase tracking-wide">Live Community Impact</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {items.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <item.icon className="w-5 h-5 text-primary mb-1" />
                <span className="text-2xl md:text-3xl font-bold text-foreground">{item.value}</span>
                <span className="text-xs md:text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngagementBanner;
