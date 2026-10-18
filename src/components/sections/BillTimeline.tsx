import { STAGES, billStage, isResolution, stageIndex, type BillStage } from "@/lib/bill-stage";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

interface BillTimelineProps {
  latestActionText?: string | null;
  type?: string;
  /** Compact draws dots only, with the current stage named once. */
  compact?: boolean;
  className?: string;
}

const STAGE_KEYS = {
  introduced: "stage.introduced",
  committee: "stage.committee",
  floor: "stage.floor",
  "other-chamber": "stage.other",
  president: "stage.president",
  law: "stage.law",
} as const satisfies Record<BillStage, string>;

/**
 * Six dots for the six stages a bill can reach. Filled dots are behind or at
 * the current stage. Reads at a glance where "Referred to the Committee on
 * Energy and Commerce" actually leaves a bill.
 */
const BillTimeline = ({ latestActionText, type, compact = false, className }: BillTimelineProps) => {
  const t = useT();
  const stage = billStage(latestActionText, type);
  const current = stageIndex(stage);
  const stages = isResolution(type) ? STAGES.slice(0, 3) : STAGES;
  const label =
    isResolution(type) && current >= 2
      ? t("stage.agreed")
      : t(STAGE_KEYS[stages[Math.min(current, stages.length - 1)].key]);

  return (
    <div className={cn("flex items-center gap-2", className)} role="img" aria-label={t("stage.statusLabel", { label })}>
      <ol className="flex items-center gap-1" aria-hidden="true">
        {stages.map((s, i) => (
          <li key={s.key} className="flex items-center gap-1">
            <span
              className={cn(
                "block h-1.5 w-1.5 rounded-full transition-colors",
                i < current && "bg-muted-foreground",
                i === current && (stage === "law" ? "bg-success" : "bg-foreground"),
                i > current && "border border-border",
              )}
            />
            {i < stages.length - 1 && <span className={cn("block h-px w-2", i < current ? "bg-muted-foreground" : "bg-border")} />}
          </li>
        ))}
      </ol>
      {compact ? (
        <span className="text-xs text-muted-foreground">{label}</span>
      ) : (
        <span className="text-sm text-foreground">{label}</span>
      )}
    </div>
  );
};

export default BillTimeline;
