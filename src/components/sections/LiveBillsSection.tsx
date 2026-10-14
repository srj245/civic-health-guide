import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealthBills } from "@/hooks/useCongressApi";

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** The latest health bills from Congress.gov, as a hairline list. */
const LiveBillsSection = () => {
  const { bills, loading } = useHealthBills(5);

  return (
    <section className="border-t border-border px-6 py-14 md:px-10 md:py-20" aria-labelledby="live-heading">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Live from Congress.gov</p>
          <h2 id="live-heading" className="mt-2 text-2xl tracking-tight text-foreground md:text-3xl">
            The latest health bills
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Fetched each time you open the page. Open one for the plain-English version.
          </p>
          <Link to="/news" className="mt-4 inline-block text-sm text-accent hover:text-foreground">
            See all health bills
          </Link>
        </div>
        <ol className="divide-y divide-border border-y border-border">
          {loading &&
            [0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="py-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </li>
            ))}
          {!loading &&
            bills.map((bill) => (
              <li key={bill.id}>
                <Link to="/news" className="group block py-4">
                  <p className="text-xs text-muted-foreground">
                    {bill.type} {bill.number}
                    {bill.latestAction?.actionDate && ` · ${formatDate(bill.latestAction.actionDate)}`}
                  </p>
                  <p className="mt-1 text-base leading-snug text-foreground group-hover:text-accent">{bill.title}</p>
                </Link>
              </li>
            ))}
          {!loading && bills.length === 0 && (
            <li className="py-6 text-sm text-muted-foreground">Couldn&apos;t reach Congress.gov right now.</li>
          )}
        </ol>
      </div>
    </section>
  );
};

export default LiveBillsSection;
