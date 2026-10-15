import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import RepCard from "@/components/sections/RepCard";
import RepDetailModal from "@/components/sections/RepDetailModal";
import { usePageTitle } from "@/hooks/usePageTitle";
import { STATE_NAMES, US_STATES, isSenator, type Representative } from "@/lib/reps";
import { useRepLookup } from "@/hooks/useRepLookup";

type Mode = "zip" | "state";

const Representatives = () => {
  usePageTitle("Find Your Representatives", "Look up your congressional representatives and send them a message about health policy.");
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>("zip");
  const [zip, setZip] = useState(() => params.get("zip") ?? "");
  const [state, setState] = useState("");
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const { members, location, loading, error, searched, lookup } = useRepLookup();
  const run = lookup;

  useEffect(() => {
    const z = params.get("zip");
    if (z && /^\d{5}$/.test(z)) lookup({ zip: z });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "zip") {
      run({ zip }); // the hook validates the ZIP and sets the error
    } else if (state) {
      run({ state });
    }
  };

  const senators = members.filter(isSenator);
  const house = members.filter((m) => !isSenator(m));

  return (
    <div className="bg-background">
      <PageHero
        badge="Take action"
        title="Your representatives"
        subtitle="Find the senators and House member who vote on health legislation for you, and send them a message."
      />

      <section className="px-6 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-1 rounded-md border border-border p-1 w-fit" role="tablist" aria-label="Lookup method">
            {(["zip", "state"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "zip" ? "By ZIP code" : "By state"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-4 flex max-w-lg flex-col gap-3 sm:flex-row">
            {mode === "zip" ? (
              <div className="flex-1">
                <label htmlFor="rep-zip" className="sr-only">
                  ZIP code
                </label>
                <Input
                  id="rep-zip"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                  placeholder="ZIP code"
                />
              </div>
            ) : (
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="flex-1" aria-label="State">
                  <SelectValue placeholder="Choose a state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATE_NAMES[s]} ({s})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="submit" disabled={loading || (mode === "zip" ? zip.length < 5 : !state)}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Find
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {loading && (
            <div className="mt-8 grid gap-4 md:grid-cols-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <Skeleton className="h-14 w-14 rounded-md" />
                  <Skeleton className="mt-3 h-4 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loading && searched && !error && members.length === 0 && (
            <p className="mt-8 text-sm text-muted-foreground">No current members found. Try another ZIP or state.</p>
          )}

          {!loading && members.length > 0 && (
            <div className="mt-8 space-y-10">
              {location && (
                <p className="text-sm text-muted-foreground">
                  {location.city ? `${location.city}, ` : ""}
                  {STATE_NAMES[location.state] ?? location.state}
                  {location.district ? ` · District ${location.districtLabel}` : ""}
                </p>
              )}
              {house.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-foreground">
                    House of Representatives{house.length > 1 ? ` (${house.length})` : ""}
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-stagger>
                    {house.map((rep) => (
                      <RepCard key={rep.bioguideId ?? rep.name} rep={rep} onShowBills={setSelectedRep} />
                    ))}
                  </div>
                </div>
              )}
              {senators.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-foreground">Senate</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-stagger>
                    {senators.map((rep) => (
                      <RepCard key={rep.bioguideId ?? rep.name} rep={rep} onShowBills={setSelectedRep} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {selectedRep && (
        <RepDetailModal
          repName={selectedRep.name}
          repUrl={selectedRep.url}
          open={Boolean(selectedRep)}
          onOpenChange={(open) => !open && setSelectedRep(null)}
        />
      )}
    </div>
  );
};

export default Representatives;
