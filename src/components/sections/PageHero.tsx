import { type LucideIcon } from "lucide-react";

interface PageHeroProps {
  icon?: LucideIcon;
  badge?: string;
  title: string;
  subtitle: string;
}

/** Consistent page header used by every top-level page. */
const PageHero = ({ badge, title, subtitle }: PageHeroProps) => {
  return (
    <header className="px-6 pb-10 pt-14 text-center md:px-10 md:pb-14 md:pt-20">
      <div className="mx-auto max-w-3xl">
        {badge && <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">{badge}</p>}
        <h1 className="page-h1 text-foreground">{title}</h1>
        <p className="hero-sub mx-auto">{subtitle}</p>
      </div>
    </header>
  );
};

export default PageHero;
