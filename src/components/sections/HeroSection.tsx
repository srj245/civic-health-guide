import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import RepCard from "@/components/sections/RepCard";
import RepDetailModal from "@/components/sections/RepDetailModal";
import { savedZip, useRepLookup } from "@/hooks/useRepLookup";
import { STATE_NAMES, type Representative } from "@/lib/reps";
import { useT } from "@/i18n";

const NBSP = " ";
const sentence = (s: string) => s.split(" ").join(NBSP);

/**
 * The first screen does one thing: enter a ZIP, see your district and the
 * three people who vote on health bills for you.
 */
const HeroSection = () => {
  const [zip, setZip] = useState(savedZip);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const { members, location, unresolved, loading, error, searched, lookup, reset } = useRepLookup();
  const t = useT();

  useEffect(() => {
    if (/^\d{5}$/.test(zip)) lookup({ zip });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeLabel = location
    ? `${location.city ? `${location.city}, ` : ""}${STATE_NAMES[location.state] ?? location.state}`
    : "";

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-gap" aria-hidden="true" />

      <h1 id="hero-heading" className="hero-h1">
        <span className="l l1">
          <span className="li" data-io="line1">
            {t("hero.line1")}
          </span>
        </span>
        <span className="l l2">
          <span className="li" data-io="line2">
            {t("hero.line2")}
          </span>
        </span>
      </h1>

      <p className="hero-sub io" data-io="sub">
        {sentence(t("hero.sub1"))} {sentence(t("hero.sub2"))}
      </p>

      <form
        className="hero-form io"
        data-io="btn"
        onSubmit={(e) => {
          e.preventDefault();
          lookup({ zip });
        }}
      >
        <label htmlFor="hero-zip" className="sr-only">
          {t("hero.zipLabel")}
        </label>
        <input
          id="hero-zip"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
          placeholder={t("hero.zipPlaceholder")}
          className="hero-input"
        />
        <button type="submit" className="hero-btn" disabled={loading || zip.length < 5}>
          {loading ? t("hero.lookingUp") : t("hero.findReps")}
        </button>
      </form>

      <Link to="/news" className="hero-link io" data-io="link">
        {t("hero.browseFirst")}
        <svg viewBox="0 0 11 12.6" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-io="arrow">
          <path d="M5.5 .4V12M1 7.5L5.5 12L10 7.5" />
        </svg>
      </Link>

      <div className="hero-field">
        {error && (
          <p className="hero-error" role="alert">
            {error}
          </p>
        )}

        {loading && (
          <div className="hero-results" aria-busy="true" aria-label={t("hero.loadingReps")}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <Skeleton className="h-14 w-14 rounded-md" />
                <Skeleton className="mt-3 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && !error && location && (
          <div className="hero-results-wrap">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-foreground">
                <span className="font-medium">{unresolved ? placeLabel : t("hero.district", { label: location.districtLabel })}</span>
                {!unresolved && <span className="text-muted-foreground"> · {placeLabel}</span>}
              </p>
              <button
                type="button"
                onClick={() => {
                  setZip("");
                  reset();
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("hero.changeZip")}
              </button>
            </div>
            {unresolved && (
              <p className="mt-1 text-left text-xs text-muted-foreground">
                {t("hero.unresolved")}
              </p>
            )}
            {members.length > 0 ? (
              <div className="hero-results" data-stagger>
                {members.map((rep) => (
                  <RepCard key={rep.bioguideId ?? rep.name} rep={rep} onShowBills={setSelectedRep} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">{t("hero.noMembers")}</p>
            )}
            <Link to="/news" className="hero-link mt-6">
              {t("hero.seeBills")}
              <svg viewBox="0 0 11 12.6" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5.5 .4V12M1 7.5L5.5 12L10 7.5" />
              </svg>
            </Link>
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

export default HeroSection;
