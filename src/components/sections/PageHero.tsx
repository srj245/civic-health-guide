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
    <header className="border-b border-border px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        {badge && (
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">{badge}</p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground md:text-lg">{subtitle}</p>
      </div>
    </header>
  );
};

export default PageHero;
