/**
 * CivicCare UI primitives.
 *
 * Rules every screen follows:
 * - Type scale, four steps: h1 is PageHero only; h2 `text-2xl tracking-tight md:text-3xl`
 *   (weight 400); h3 `text-lg` (font-medium allowed here only); body `text-base`,
 *   small `text-sm`; `text-xs` only for metadata (bill codes, dates, counts).
 *   Never `text-[10px]`; never text or icon opacity below /60.
 * - Accent: `text-accent hover:text-foreground` for links and arrow CTAs.
 *   `primary` (white) belongs to Button only. Selected state is
 *   `border-foreground bg-secondary`, never a primary tint.
 * - No color fills on tiles or chips. Semantic colors appear only as a dot or ring.
 *   The 911/988 links in `text-destructive` are the one exception.
 * - `rounded-md` everywhere. No shadows except the `.lift` hover.
 * - Sentence case for headings and buttons. Weights 400 and 500 only.
 * - Sections only through <Section>; no `container`, no nested max-widths.
 */
import { forwardRef, type ElementType, type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/* ---------- Text ---------- */

export const Eyebrow = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm uppercase tracking-wide text-muted-foreground", className)} {...rest} />
);

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  as?: "h2" | "h3";
  className?: string;
}

export const SectionHeading = ({ id, eyebrow, title, lede, as: Tag = "h2", className }: SectionHeadingProps) => (
  <div className={className}>
    {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
    <Tag id={id} className={Tag === "h2" ? "text-2xl tracking-tight text-foreground md:text-3xl" : "text-lg text-foreground"}>
      {title}
    </Tag>
    {lede && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>}
  </div>
);

/* ---------- Surfaces ---------- */

type SurfaceVariant = "static" | "interactive" | "inset";
type SurfacePadding = "none" | "sm" | "md" | "lg";

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
  children?: ReactNode;
  /** Pass-through for `as={Link}` / `as="a"`. */
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const surfaceVariant: Record<SurfaceVariant, string> = {
  static: "rounded-md border border-border bg-card",
  interactive:
    "rounded-md border border-border bg-card lift cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  inset: "rounded-md border border-border bg-secondary/40",
};

const surfacePadding: Record<SurfacePadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export const Surface = forwardRef<HTMLElement, SurfaceProps>(
  ({ as: Tag = "div", variant = "static", padding = "md", className, children, ...rest }, ref) => (
    <Tag ref={ref} className={cn(surfaceVariant[variant], surfacePadding[padding], className)} {...rest}>
      {children}
    </Tag>
  ),
);
Surface.displayName = "Surface";

/* ---------- Chips, tiles, stats ---------- */

export type Tone = "neutral" | "info" | "success" | "warning" | "destructive";

const toneDot: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

/** Neutral outline tag. A tone only changes the dot; the fill never changes. */
export const Chip = ({ tone = "neutral", dot = false, className, children, ...rest }: ChipProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs text-foreground",
      className,
    )}
    {...rest}
  >
    {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneDot[tone])} aria-hidden="true" />}
    {children}
  </span>
);

interface IconTileProps {
  icon: LucideIcon;
  size?: "sm" | "md";
  className?: string;
}

export const IconTile = ({ icon: Icon, size = "sm", className }: IconTileProps) => (
  <span
    className={cn(
      "flex shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground",
      size === "sm" ? "h-9 w-9" : "h-11 w-11",
      className,
    )}
    aria-hidden="true"
  >
    <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
  </span>
);

export const Stat = ({ value, label }: { value: ReactNode; label: string }) => (
  <div className="rounded-md border border-border p-4 text-center">
    <p className="text-2xl tabular-nums text-foreground">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
  </div>
);

/* ---------- Forms ---------- */

export const FieldLabel = ({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-2 block text-sm text-foreground", className)} {...rest} />
);

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
}

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(({ icon: Icon, className, ...rest }, ref) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    <Input ref={ref} className={cn("pl-9", className)} {...rest} />
  </div>
));
IconInput.displayName = "IconInput";
