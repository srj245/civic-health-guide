import { type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children: ReactNode;
  /** Extra delay in ms before the rise starts. */
  delay?: number;
  /** When true, direct children rise one after another. */
  stagger?: boolean;
}

/** Rises into view when scrolled to. Children of a `stagger` Reveal animate in sequence. */
const Reveal = ({ as: Tag = "div", children, delay = 0, stagger = false, style, ...rest }: RevealProps) => {
  const ref = useReveal<HTMLElement>();
  const merged: CSSProperties | undefined = delay
    ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties)
    : style;
  return (
    <Tag ref={ref} style={merged} data-stagger={stagger ? "" : undefined} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;
