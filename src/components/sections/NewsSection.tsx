import { useState } from "react";
import Section from "@/components/layout/Section";
import { Chip, IconInput, Surface } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowRight, FileText, Bookmark, Search, RefreshCw } from "lucide-react";
import { useI18n } from "@/i18n";
import type { MessageKey } from "@/i18n/messages";
import { useBillSearch, useHealthBills, type Bill } from "@/hooks/useCongressApi";
import { useTrackedBills } from "@/hooks/useTrackedBills";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BillDetailModal from "./BillDetailModal";
import BillTimeline from "@/components/sections/BillTimeline";

function formatActionDate(dateString: string | undefined, locale: string): string | null {
  if (!dateString) return null;
  const d = new Date(`${dateString.slice(0, 10)}T12:00:00`);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

/** Message key for the topic chip on a bill card, derived from its title. */
function getBillCategory(title: string): MessageKey {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("medicare")) return "bills.category.medicare";
  if (titleLower.includes("medicaid")) return "bills.category.medicaid";
  if (titleLower.includes("mental health")) return "bills.category.mentalHealth";
  if (titleLower.includes("prescription") || titleLower.includes("drug pricing") || titleLower.includes("insulin")) return "bills.category.prescriptionDrugs";
  if (titleLower.includes("health insurance") || titleLower.includes("health coverage")) return "bills.category.healthInsurance";
  if (titleLower.includes("veteran")) return "bills.category.veteransHealth";
  return "bills.category.healthPolicy";
}

type T = ReturnType<typeof useI18n>["t"];

/** Localized "just now" / "4 min ago" for a timestamp in ms. */
function timeAgoLocalized(ms: number, t: T): string {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 45) return t("time.justNow");
  const m = Math.round(s / 60);
  if (m < 60) return t("time.minAgo", { n: m });
  const h = Math.round(m / 60);
  if (h < 24) return t("time.hAgo", { n: h });
  return t("time.dAgo", { n: Math.round(h / 24) });
}

const NewsSection = () => {
  const { t, ui } = useI18n();
  const locale = ui === "es" ? "es" : "en-US";
  const { bills: allBills, total, loading, refreshing, error, updatedAt, refetch } = useHealthBills(100);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const bills = q
    ? allBills.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          `${b.type}${b.number}`.toLowerCase().includes(q.replace(/[\s.]/g, "")) ||
          t(getBillCategory(b.title)).toLowerCase().includes(q),
      )
    : allBills;
  // When the health list has no match, search the full recent list on the server.
  const search = useBillSearch(q && bills.length === 0 ? query : "");
  const shown = bills.length > 0 ? bills : search.results;
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { toggleTrack, isTracked } = useTrackedBills();
  const { toast } = useToast();

  const handleReadMore = (bill: Bill) => {
    setSelectedBill(bill);
    setModalOpen(true);
  };

  const handleTrack = async (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: t("bills.toast.signIn"), description: t("bills.toast.signInBody") });
      return;
    }
    try {
      const tracked = await toggleTrack(bill);
      toast({ title: tracked ? t("bills.toast.tracked") : t("bills.toast.untracked"), description: bill.title });
    } catch {
      toast({ title: t("bills.toast.error"), description: t("bills.toast.trackFailed"), variant: "destructive" });
    }
  };

  return (
    <Section first id="news">
      <div className="mb-6">
        <label htmlFor="bill-search" className="sr-only">{t("bills.search.label")}</label>
        <div className="max-w-md">
          <IconInput
            icon={Search}
            id="bill-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("bills.search.placeholder")}
          />
        </div>
        {!loading && !error && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-live="polite">
            <span>{q ? t("bills.meta.match", { shown: bills.length, all: allBills.length }) : t("bills.meta.total", { total })}</span>
            {updatedAt && <span>{t("bills.meta.updated", { when: timeAgoLocalized(updatedAt, t) })}</span>}
            <Button type="button" variant="ghost" size="sm" onClick={() => refetch()} disabled={refreshing} aria-label={t("bills.refreshLabel")}>
              <RefreshCw className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
              {refreshing ? t("common.refreshing") : t("common.refresh")}
            </Button>
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Surface key={i} padding="md">
              <Skeleton className="mb-3 h-5 w-24" />
              <Skeleton className="mb-4 h-6 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Surface>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <EmptyState
          variant="error"
          icon={FileText}
          title={t("common.couldntReach")}
          body={t("common.tryMoment")}
          action={<Button variant="outline" onClick={() => refetch()}>{t("common.retry")}</Button>}
        />
      )}

      {!loading && !error && q && bills.length === 0 && search.loading && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t("bills.notInList.searching")}
        </p>
      )}

      {!loading && !error && q && bills.length === 0 && !search.loading && shown.length > 0 && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t("bills.notInList.found", { n: shown.length, query })}
        </p>
      )}

      {!loading && !error && q && shown.length === 0 && !search.loading && (
        <EmptyState
          compact
          title={t("bills.empty.title")}
          body={search.enabled ? t("bills.empty.bodyAll", { query }) : t("bills.empty.bodyHealth", { query })}
          action={
            <Button asChild variant="outline">
              <a href={`https://www.congress.gov/search?q=${encodeURIComponent(JSON.stringify({ source: "legislation", search: query }))}`} target="_blank" rel="noopener noreferrer">
                {t("bills.searchAll")}
              </a>
            </Button>
          }
        />
      )}

      {/* Bills grid */}
      {!loading && !error && shown.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2" data-stagger>
          {shown.map((bill) => (
            <Surface
              key={bill.id}
              variant="interactive"
              padding="md"
              role="button"
              tabIndex={0}
              className="group flex flex-col"
              onClick={() => handleReadMore(bill)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleReadMore(bill); } }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <Chip>{t(getBillCategory(bill.title))}</Chip>
                <span className="font-mono text-xs text-muted-foreground">
                  {bill.type.toUpperCase()}{bill.number}
                </span>
              </div>
              <h3 className="line-clamp-2 text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
                {bill.title}
              </h3>
              {bill.latestAction && (
                <p className="mb-4 mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {bill.latestAction.text}
                </p>
              )}

              <BillTimeline latestActionText={bill.latestAction?.text} type={bill.type} compact className="mb-3" />

              {/* Footer */}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {t("bills.latestActionDate", { date: formatActionDate(bill.latestAction?.actionDate || bill.updateDate, locale) ?? "—" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-accent">
                    {t("bills.viewDetails")}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => handleTrack(e, bill)}
                    aria-label={isTracked(bill.id) ? t("bills.untrack") : t("bills.track")}
                  >
                    <Bookmark className={isTracked(bill.id) ? "fill-current text-foreground" : ""} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}

      {/* View all link */}
      <div className="mt-10 text-center">
        <a
          href="https://www.congress.gov/search?q=%7B%22congress%22%3A%22119%22%2C%22source%22%3A%22legislation%22%2C%22subject%22%3A%22Health%22%7D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent transition-colors hover:text-foreground"
        >
          {t("bills.viewAll")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <BillDetailModal
        bill={selectedBill}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </Section>
  );
};

export default NewsSection;
