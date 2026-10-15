import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  variant?: "empty" | "error";
  /** No border, less padding; for inside cards and dialogs. */
  compact?: boolean;
  className?: string;
}

/** The one empty / error presentation used everywhere. */
export const EmptyState = ({ icon: Icon, title, body, action, variant = "empty", compact, className }: EmptyStateProps) => (
  <div
    role={variant === "error" ? "alert" : undefined}
    className={cn(
      "text-center",
      compact ? "py-6" : "rounded-md border p-8",
      !compact && (variant === "error" ? "border-destructive/40" : "border-border"),
      className,
    )}
  >
    {Icon && (
      <Icon className={cn("mx-auto mb-3 h-6 w-6", variant === "error" ? "text-destructive" : "text-muted-foreground")} aria-hidden="true" />
    )}
    <h3 className="text-lg text-foreground">{title}</h3>
    {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);
