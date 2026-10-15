import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  /** Accessible name for the group. */
  label: string;
  className?: string;
}

/** One hairline-bordered switch for list/map, ZIP/state, and similar choices. Full width on phones. */
export function SegmentedControl<T extends string>({ value, onChange, options, label, className }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex w-full rounded-md border border-border p-0.5 sm:w-auto", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm transition-colors",
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.icon && <o.icon className="h-4 w-4" aria-hidden="true" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
