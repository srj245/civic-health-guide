import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Chip, Surface, type Tone } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ImpactProfile, ImpactResult, ImpactSource } from "@/pages/Impact";
import { useT } from "@/i18n";
import type { MessageKey } from "@/i18n/messages";

interface Props {
  profile: ImpactProfile;
  results: ImpactResult[];
  sources?: ImpactSource[];
  loading: boolean;
  error: string | null;
  onReset: () => void;
}

const relevanceConfig: Record<ImpactResult["relevance"], { tone: Tone; label: MessageKey }> = {
  high: { tone: "destructive", label: "impact.high" },
  medium: { tone: "warning", label: "impact.medium" },
  low: { tone: "neutral", label: "impact.low" },
};

const ImpactResults = ({ profile, results, sources = [], loading, error, onReset }: Props) => {
  const { toast } = useToast();
  const t = useT();
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const insuranceLabel = t(`impact.ins.${profile.insuranceType}` as MessageKey);
  const profileLine = `${profile.ageRange} · ${insuranceLabel} · ${profile.state}`;

  const handleShare = async () => {
    const text = results
      .map((r) => t("impact.shareLine", { title: r.billTitle, level: t(relevanceConfig[r.relevance].label), impact: r.impact }))
      .join("\n");
    const title = t("impact.shareTitle");
    const full = `${title}\n${profileLine}\n\n${text}\n\n${t("impact.shareFooter")}`;
    if (navigator.share) {
      try { await navigator.share({ title, text: full }); } catch { /* user dismissed the share sheet */ }
    } else {
      await navigator.clipboard.writeText(full);
      toast({ title: t("impact.copiedTitle"), description: t("impact.copiedBody") });
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl tracking-tight text-foreground">{t("impact.results")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{profileLine}</p>
        </div>
        <div className="flex gap-2">
          {!loading && !error && results.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> {t("common.share")}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onReset}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("impact.startOver")}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <Surface key={i} padding="md">
              <Skeleton className="mb-3 h-6 w-48" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Surface>
          ))}
        </div>
      )}

      {error && (
        <EmptyState
          variant="error"
          title={error}
          action={<Button variant="outline" onClick={onReset}>{t("common.tryAgain")}</Button>}
        />
      )}

      {!loading && !error && results.length > 0 && (
        <div className="space-y-4" data-stagger>
          {results.map((result, i) => {
            const config = relevanceConfig[result.relevance];
            const source = sourceById.get(result.billId);
            return (
              <Surface key={i} padding="md">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-lg text-foreground">{result.billTitle}</h3>
                  <Chip tone={config.tone} dot className="shrink-0 self-start">
                    {t(config.label)}
                  </Chip>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{result.impact}</p>
                {source && (
                  <div className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    <p>
                      <span className="text-foreground">{t("impact.officialRecord")}</span>{" "}
                      {source.type}{source.number}, {t("impact.congressNth", { n: source.congress })}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:text-foreground"
                        >
                          {t("common.congressGov")} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </p>
                    {source.latestAction && (
                      <p>
                        <span className="text-foreground">{t("impact.latestAction")}</span>{" "}
                        {source.latestAction}
                        {source.latestActionDate ? ` (${source.latestActionDate})` : ""}
                      </p>
                    )}
                  </div>
                )}
              </Surface>
            );
          })}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <EmptyState
          title={t("impact.noneTitle")}
          body={t("impact.noneBody")}
          action={<Button variant="outline" onClick={onReset}>{t("impact.startOver")}</Button>}
        />
      )}
    </div>
  );
};

export default ImpactResults;
