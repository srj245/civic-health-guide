import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { Surface } from "@/components/ui/primitives";
import Section from "@/components/layout/Section";
import { Search, Users } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import RepCard from "@/components/sections/RepCard";
import RepDetailModal from "@/components/sections/RepDetailModal";
import { usePageTitle } from "@/hooks/usePageTitle";
import { STATE_NAMES, US_STATES, isSenator, type Representative } from "@/lib/reps";
import { useRepLookup } from "@/hooks/useRepLookup";

type Mode = "zip" | "state";

const Representatives = () => {
  usePageTitle("Your representatives", "Look up your congressional representatives and send them a message about health policy.");
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>("zip");
  const [zip, setZip] = useState(() => params.get("zip") ?? "");
  const [state, setState] = useState("");
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const { members, location, unresolved, loading, error, searched, lookup } = useRepLookup();
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

      <Section first>
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          label="Lookup method"
          options={[
            { value: "zip", label: "By ZIP code" },
            { value: "state", label: "By state" },
          ]}
        />

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
              <Surface key={i} padding="md">
                <Skeleton className="h-14 w-14 rounded-md" />
                <Skeleton className="mt-3 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </Surface>
            ))}
          </div>
        )}

        {!loading && searched && !error && members.length === 0 && (
          <EmptyState compact icon={Users} title="No current members found" body="Try another ZIP or state." className="mt-8" />
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
            {unresolved && (
              <p className="-mt-6 text-sm text-muted-foreground">
                We found your state but couldn&apos;t pin the district for this ZIP. Showing your senators.
              </p>
            )}
            {house.length > 0 && (
              <div>
                <h2 className="text-2xl tracking-tight text-foreground">
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
                <h2 className="text-2xl tracking-tight text-foreground">Senate</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-stagger>
                  {senators.map((rep) => (
                    <RepCard key={rep.bioguideId ?? rep.name} rep={rep} onShowBills={setSelectedRep} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

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
