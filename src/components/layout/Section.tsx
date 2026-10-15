import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div";
  /** default = max-w-6xl, narrow = max-w-4xl, prose = max-w-3xl */
  width?: "default" | "narrow" | "prose";
  /** Subtle band background. */
  tint?: boolean;
  /** Hairline above the section (home-page rhythm). */
  rule?: boolean;
  /** Use directly after PageHero, which already pads the bottom. */
  first?: boolean;
  children: ReactNode;
}

const widths = {
  default: "max-w-6xl",
  narrow: "max-w-4xl",
  prose: "max-w-3xl",
} as const;

/** The only page-section wrapper. Owns horizontal padding, vertical rhythm, and width. */
const Section = ({ as: Tag = "section", width = "default", tint, rule, first, className, children, ...rest }: SectionProps) => (
  <Tag
    className={cn(
      "px-6 py-14 md:px-10 md:py-20",
      first && "pt-0 md:pt-0",
      rule && "border-t border-border",
      tint && "bg-secondary/40",
      className,
    )}
    {...rest}
  >
    <div className={cn("mx-auto", widths[width])}>{children}</div>
  </Tag>
);

export default Section;
