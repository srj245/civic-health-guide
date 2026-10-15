import { STAGES, billStage, isResolution, stageIndex } from "@/lib/bill-stage";
import { cn } from "@/lib/utils";

interface BillTimelineProps {
  latestActionText?: string | null;
  type?: string;
  /** Compact draws dots only, with the current stage named once. */
  compact?: boolean;
  className?: string;
}

/**
 * Six dots for the six stages a bill can reach. Filled dots are behind or at
 * the current stage. Reads at a glance where "Referred to the Committee on
 * Energy and Commerce" actually leaves a bill.
 */
const BillTimeline = ({ latestActionText, type, compact = false, className }: BillTimelineProps) => {
  const stage = billStage(latestActionText, type);
  const current = stageIndex(stage);
  const stages = isResolution(type) ? STAGES.slice(0, 3) : STAGES;
  const label =
    isResolution(type) && current >= 2 ? "Agreed to" : stages[Math.min(current, stages.length - 1)].label;

  return (
    <div className={cn("flex items-center gap-2", className)} role="img" aria-label={`Status: ${label}`}>
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
