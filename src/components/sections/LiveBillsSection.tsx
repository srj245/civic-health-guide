import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { useHealthBills } from "@/hooks/useCongressApi";
import { timeAgo } from "@/lib/time";
import BillTimeline from "@/components/sections/BillTimeline";

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Re-renders once a minute so "updated N min ago" stays honest. */
function useTick(ms = 60_000) {
  const [, setN] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setN((n) => n + 1), ms);
    return () => window.clearInterval(t);
  }, [ms]);
}

/** The latest health bills from Congress.gov, as a hairline list. */
const LiveBillsSection = () => {
  const { bills, total, loading, refreshing, error, updatedAt, refetch } = useHealthBills(6);
  useTick();

  return (
    <Section rule aria-labelledby="live-heading">
      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        <Reveal>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Live from Congress.gov</p>
          <h2 id="live-heading" className="mt-2 text-2xl tracking-tight text-foreground md:text-3xl">
            The latest health bills
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {total > 0
              ? `${total} health bills among the 1,000 most recently updated in Congress. Refreshes every 10 minutes.`
              : "Pulled from the 1,000 most recently updated bills in Congress."}
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            {updatedAt && <span aria-live="polite">Updated {timeAgo(updatedAt)}</span>}
            <Button type="button" variant="ghost" size="sm" onClick={() => refetch()} disabled={refreshing} aria-label="Refresh bills" className="h-7 px-2 text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </div>
          <Link to="/news" className="mt-4 inline-block text-sm text-accent hover:text-foreground">
            See all health bills
          </Link>
        </Reveal>
        <ol className="divide-y divide-border border-y border-border" data-stagger>
          {loading &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="py-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </li>
            ))}
          {!loading &&
            bills.map((bill) => (
              <li key={bill.id}>
                <Link to="/news" className="group block py-4 transition-[padding] duration-300 hover:pl-2">
                  <p className="text-xs text-muted-foreground">
                    {bill.type} {bill.number}
                    {bill.latestAction?.actionDate && ` · ${formatDate(bill.latestAction.actionDate)}`}
                  </p>
                  <p className="mt-1 text-base leading-snug text-foreground group-hover:text-accent">{bill.title}</p>
                  <BillTimeline latestActionText={bill.latestAction?.text} type={bill.type} compact className="mt-2" />
                </Link>
              </li>
            ))}
          {!loading && (error || bills.length === 0) && (
            <li className="py-6 text-sm text-muted-foreground">Couldn&apos;t reach Congress.gov right now.</li>
          )}
        </ol>
      </div>
    </Section>
  );
};

export default LiveBillsSection;
