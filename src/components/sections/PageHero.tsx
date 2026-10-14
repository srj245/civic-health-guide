import { type LucideIcon } from "lucide-react";

interface PageHeroProps {
  icon?: LucideIcon;
  badge?: string;
  title: string;
  subtitle: string;
}

/** Consistent page header used by every top-level page. The title rises out of a mask. */
const PageHero = ({ badge, title, subtitle }: PageHeroProps) => {
  return (
    <header className="px-6 pb-10 pt-14 text-center md:px-10 md:pb-14 md:pt-20">
      <div className="mx-auto max-w-3xl">
        {badge && <p className="page-eyebrow mb-4 text-sm uppercase tracking-wide text-muted-foreground">{badge}</p>}
        <h1 className="page-h1 text-foreground">
          <span className="l">
            <span className="li">{title}</span>
          </span>
        </h1>
        <p className="hero-sub page-sub mx-auto">{subtitle}</p>
        <div className="page-rule mx-auto mt-8 h-px w-24 bg-border" aria-hidden="true" />
      </div>
    </header>
  );
};

export default PageHero;
