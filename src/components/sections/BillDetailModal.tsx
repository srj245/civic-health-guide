import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BillTimeline from "@/components/sections/BillTimeline";
import { Chip, Eyebrow, Surface } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillDetails, type Bill } from "@/hooks/useCongressApi";
import { useBillSummary } from "@/hooks/useBillSummary";
import { useTrackedBills } from "@/hooks/useTrackedBills";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, FileText, Users, ExternalLink, Sparkles, Share2, Bookmark, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import BillDiscussion from "./BillDiscussion";
import { escapeHtml, ordinal } from "@/lib/format";
import { useI18n } from "@/i18n";
import { languageByCode } from "@/i18n/languages";

interface BillDetailModalProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

const BillDetailModal = ({ bill, open, onOpenChange }: BillDetailModalProps) => {
  const { t, language } = useI18n();
  const { bill: details, loading, error } = useBillDetails(bill?.id || null);
  const { summary: aiSummary, loading: aiLoading, error: aiError, summarize } = useBillSummary();
  const { toggleTrack, isTracked } = useTrackedBills();
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-generate AI summary when details load
  useEffect(() => {
    if (details && open) {
      summarize(
        details.title || bill?.title || '',
        details.summary ? stripHtml(details.summary) : undefined,
        details.latestAction?.text
      );
    }
  }, [details, open]);

  const congressLabel = (congress: number | string) => t("bills.detail.congress", { ordinal: ordinal(congress) });

  const handlePrint = () => {
    const title = escapeHtml(bill?.title || t("bills.detail.fallbackTitle"));
    const summary = escapeHtml(aiSummary?.plainEnglish || "");
    const impact = escapeHtml(aiSummary?.impact || "");
    const official = escapeHtml(details?.summary ? stripHtml(details.summary) : "");
    const billCode = escapeHtml(`${details?.type?.toUpperCase() || ""}${details?.number || ""}`);
    const congressBadge = details?.congress ? escapeHtml(congressLabel(details.congress)) : "";
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html lang="${escapeHtml(language)}"><head><title>${title}</title>
        <style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a1a}
        h1{font-size:1.4em;margin-bottom:0.5em}h2{font-size:1.1em;margin-top:1.5em;color:#333}
        p{line-height:1.6;color:#444}hr{border:none;border-top:1px solid #ddd;margin:1.5em 0}
        .badge{display:inline-block;background:#f0f0f0;padding:2px 10px;border-radius:12px;font-size:0.85em;margin-right:6px}
        @media print{body{margin:20px}}</style></head><body>
        <h1>${title}</h1>
        <span class="badge">${billCode}</span>
        <span class="badge">${congressBadge}</span>
        ${summary ? `<h2>${escapeHtml(t("bills.detail.plainSummary"))}</h2><p>${summary}</p>` : ""}
        ${impact ? `<h2>${escapeHtml(t("bills.detail.impact"))}</h2><p>${impact}</p>` : ""}
        ${official ? `<hr><h2>${escapeHtml(t("bills.detail.officialSummary"))}</h2><p>${official}</p>` : ""}
        <hr><p style="font-size:0.85em;color:#888">${escapeHtml(t("bills.detail.generatedBy"))} · ${escapeHtml(window.location.host)}</p>
        </body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const billTypeSlug: Record<string, string> = {
    hr: "house-bill", s: "senate-bill", hres: "house-resolution", sres: "senate-resolution",
    hjres: "house-joint-resolution", sjres: "senate-joint-resolution",
    hconres: "house-concurrent-resolution", sconres: "senate-concurrent-resolution",
  };
  const congressUrl = `https://www.congress.gov/bill/${details?.congress || 119}th-congress/${billTypeSlug[(details?.type || bill?.type || "hr").toLowerCase()] || "house-bill"}/${details?.number || bill?.number || ""}/text`;

  const handleShare = async () => {
    const title = bill?.title || t("bills.detail.fallbackTitle");
    const text = aiSummary?.plainEnglish || t("bills.detail.shareText", { title });
    const url = congressUrl;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast({ title: t("bills.toast.copied"), description: t("bills.toast.copiedBody") });
    }
  };

  const tracked = bill ? isTracked(bill.id) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bill?.title || t("bills.detail.title")}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {error && (
          <p className="py-4 text-sm text-destructive" role="alert">
            {t("bills.detail.loadFailed", { error })}
          </p>
        )}

        {!loading && !error && details && (
          <div className="space-y-6">
            {/* Bill ID and status */}
            <div className="flex flex-wrap gap-2">
              <Chip>{details.type?.toUpperCase()}{details.number}</Chip>
              <Chip>{congressLabel(details.congress)}</Chip>
              {details.policyArea?.name && (
                <Chip tone="info" dot>{details.policyArea.name}</Chip>
              )}
            </div>

            {/* AI plain English summary */}
            <Surface variant="inset" padding="md" className="space-y-2">
              <h3 className="flex items-center gap-2 text-lg text-foreground">
                <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {t("bills.detail.plainSummary")}
              </h3>
              {aiLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
              {aiError && (
                <p className="text-sm text-muted-foreground">{t("bills.detail.summaryFailed", { error: aiError })}</p>
              )}
              {aiSummary && (
                <>
                  <p className="text-sm leading-relaxed text-foreground">{aiSummary.plainEnglish}</p>
                  <div className="mt-3 border-t border-border pt-3">
                    <Eyebrow className="mb-1">{t("bills.detail.impact")}</Eyebrow>
                    <p className="text-sm leading-relaxed text-foreground">{aiSummary.impact}</p>
                  </div>
                  {language !== "en" && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t("common.generatedIn", { language: languageByCode(language).name })}
                    </p>
                  )}
                  <p className={`${language !== "en" ? "mt-1" : "mt-3"} text-xs text-muted-foreground`}>
                    {t("bills.detail.aiNote")}{" "}
                    <a
                      href={congressUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      {t("bills.detail.aiNoteLink")}
                    </a>
                    .
                  </p>
                </>
              )}
            </Surface>

            {/* Official summary */}
            {details.summary && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-lg text-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {t("bills.detail.officialSummary")}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {stripHtml(details.summary)}
                </p>
              </div>
            )}

            {/* Latest action */}
            {details.latestAction && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-lg text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {t("bills.detail.latestAction")}
                </h3>
                <BillTimeline latestActionText={details.latestAction.text} type={details.type} className="pb-1" />
                <Surface variant="inset" padding="sm">
                  <p className="text-sm text-foreground">
                    {details.latestAction.actionDate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {details.latestAction.text}
                  </p>
                </Surface>
              </div>
            )}

            {/* Sponsors */}
            {details.sponsors && details.sponsors.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-lg text-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {t("bills.detail.sponsors")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {details.sponsors.map((sponsor, idx) => (
                    <Chip key={idx}>
                      {sponsor.firstName} {sponsor.lastName} ({sponsor.party}-{sponsor.state})
                    </Chip>
                  ))}
                </div>
                {details.cosponsors && details.cosponsors > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("bills.detail.cosponsors", { n: details.cosponsors })}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {bill && (
                <Button
                  variant={tracked ? "default" : "outline"}
                  className="w-full min-w-[10rem] sm:w-auto sm:flex-1"
                  onClick={async () => {
                    if (!user) {
                      toast({ title: t("bills.toast.signIn"), description: t("bills.toast.signInBody") });
                      return;
                    }
                    try {
                      const nowTracked = await toggleTrack(bill);
                      toast({ title: nowTracked ? t("bills.toast.tracked") : t("bills.toast.untracked") });
                    } catch {
                      toast({ title: t("bills.toast.error"), variant: "destructive" });
                    }
                  }}
                >
                  <Bookmark className={tracked ? "fill-current" : ""} aria-hidden="true" />
                  {tracked ? t("bills.tracked") : t("bills.track")}
                </Button>
              )}
              <Button asChild variant="outline">
                <a href={congressUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" />
                  {t("common.congressGov")}
                </a>
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 aria-hidden="true" />
                {t("common.share")}
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrint} aria-label={t("bills.detail.print")}>
                <Printer aria-hidden="true" />
              </Button>
            </div>

            {/* Community discussion */}
            <div className="border-t border-border pt-4">
              <BillDiscussion billId={bill?.id || null} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailModal;
