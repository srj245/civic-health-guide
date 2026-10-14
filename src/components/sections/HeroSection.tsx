import { Link } from "react-router-dom";
import { ArrowRight, FileText, MapPin, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealthBills } from "@/hooks/useCongressApi";

const proofPoints = [
  { icon: FileText, text: "Live bills from Congress.gov, summarized in plain English" },
  { icon: MapPin, text: "Clinics, mental health services, and low-cost care near you" },
  { icon: Megaphone, text: "Your representatives, and a message ready to send" },
];

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const HeroSection = () => {
  const { bills, loading } = useHealthBills(3);

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-primary">
              Health policy, in plain English
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
              Know what Congress is doing to your health care. Then do something about it.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              CivicCare reads the bills so you don&apos;t have to. See which ones affect you, find care in your
              community, and reach the people who represent you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/news">
                  Browse health bills
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/care">Find care near me</Link>
              </Button>
            </div>
            <ul className="mt-10 space-y-3">
              {proofPoints.map((p) => (
                <li key={p.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <p.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-lg border border-border bg-card" aria-labelledby="live-bills-heading">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 id="live-bills-heading" className="text-sm font-semibold text-foreground">
                Latest health bills in Congress
              </h2>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                Live
              </span>
            </div>
            <ol className="divide-y divide-border">
              {loading
                ? [0, 1, 2].map((i) => (
                    <li key={i} className="px-5 py-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="mt-2 h-3 w-1/2" />
                    </li>
                  ))
                : bills.map((bill) => (
                    <li key={bill.id}>
                      <Link
                        to="/news"
                        className="block px-5 py-4 transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                      >
                        <p className="text-xs font-medium text-muted-foreground">
                          {bill.type} {bill.number}
                          {bill.latestAction?.actionDate && ` · ${formatDate(bill.latestAction.actionDate)}`}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">
                          {bill.title}
                        </p>
                      </Link>
                    </li>
                  ))}
              {!loading && bills.length === 0 && (
                <li className="px-5 py-6 text-sm text-muted-foreground">
                  Couldn&apos;t reach Congress.gov right now. Try again in a moment.
                </li>
              )}
            </ol>
            <div className="border-t border-border px-5 py-3">
              <Link to="/news" className="text-sm font-medium text-primary hover:underline">
                See all health bills
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
