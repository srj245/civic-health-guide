import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RepCard from "@/components/sections/RepCard";
import RepDetailModal from "@/components/sections/RepDetailModal";
import { STATE_NAMES, type DistrictLocation, type Representative, type RepLookupResponse } from "@/lib/reps";
import type { Bill } from "@/hooks/useCongressApi";

const STORAGE_KEY = "civiccare_zip";

const DistrictDashboard = () => {
  const [zip, setZip] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [location, setLocation] = useState<DistrictLocation | null>(null);
  const [unresolved, setUnresolved] = useState(false);
  const [reps, setReps] = useState<Representative[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);

  const reset = () => {
    setZip("");
    setLocation(null);
    setReps([]);
    setBills([]);
    setSearched(false);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  };

  const lookup = useCallback(async (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!/^\d{5}$/.test(cleaned)) {
      setError("Enter a 5-digit ZIP code.");
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      localStorage.setItem(STORAGE_KEY, cleaned);
    } catch {
      /* storage unavailable */
    }

    try {
      const [repsResult, billsResult] = await Promise.all([
        supabase.functions.invoke<RepLookupResponse>("find-representatives", { body: { zip: cleaned } }),
        supabase.functions.invoke<{ bills?: Bill[] }>("congress-api", { body: { action: "health-bills", limit: 6 } }),
      ]);

      if (repsResult.error) throw new Error("We couldn't look up that ZIP code right now.");
      if (repsResult.data?.error) throw new Error(repsResult.data.error);

      setLocation(repsResult.data?.location ?? null);
      setUnresolved(Boolean(repsResult.data?.districtUnresolved));
      setReps(repsResult.data?.members ?? []);
      setBills(billsResult.data?.bills ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setReps([]);
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-run a saved ZIP on first render.
  useEffect(() => {
    if (/^\d{5}$/.test(zip)) lookup(zip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeLabel = location
    ? `${location.city ? `${location.city}, ` : ""}${STATE_NAMES[location.state] ?? location.state}`
    : "";

  return (
    <section className="border-t border-border px-6 py-14 md:px-10 md:py-20" aria-labelledby="district-heading">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 id="district-heading" className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            Who represents you
          </h2>
          <p className="mt-2 text-muted-foreground">
            Enter your ZIP code. We find your congressional district and the three people who vote on
            these bills for you.
          </p>
        </div>

        <form
          className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            lookup(zip);
          }}
        >
          <div className="relative flex-1">
            <label htmlFor="district-zip" className="sr-only">
              ZIP code
            </label>
            <Input
              id="district-zip"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              placeholder="ZIP code"
              className="pr-9 text-base tracking-wide"
            />
            {zip && (
              <button
                type="button"
                onClick={reset}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear ZIP code"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={loading || zip.length < 5}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Look up
          </Button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading && (
          <div className="mt-8 grid gap-4 md:grid-cols-3" aria-busy="true" aria-label="Loading representatives">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <Skeleton className="h-14 w-14 rounded-md" />
                <Skeleton className="mt-3 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && !error && (
          <div className="mt-8 space-y-12">
            {location && (
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-medium text-foreground">
                    {unresolved ? `${placeLabel}` : `District ${location.districtLabel}`}
                  </h3>
                  {!unresolved && <span className="text-sm text-muted-foreground">{placeLabel}</span>}
                </div>
                {unresolved && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    We found your state but couldn't pin the district for this ZIP. Showing your senators.
                  </p>
                )}
                {reps.length > 0 ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-3" data-stagger>
                    {reps.map((rep) => (
                      <RepCard key={rep.bioguideId ?? rep.name} rep={rep} onShowBills={setSelectedRep} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No current members found for this ZIP.</p>
                )}
              </div>
            )}

            {bills.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-foreground">Health bills they are voting on</h3>
                <ul className="mt-4 divide-y divide-border border-y border-border" data-stagger>
                  {bills.map((bill) => (
                    <li key={bill.id}>
                      <Link to="/news" className="block py-3 transition-[padding,background-color] duration-300 hover:bg-secondary/60 hover:pl-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {bill.type} {bill.number}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">{bill.title}</p>
                        {bill.latestAction?.text && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{bill.latestAction.text}</p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/news">
                    All health bills
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedRep && (
        <RepDetailModal
          repName={selectedRep.name}
          repUrl={selectedRep.url}
          open={Boolean(selectedRep)}
          onOpenChange={(open) => !open && setSelectedRep(null)}
        />
      )}
    </section>
  );
};

export default DistrictDashboard;
