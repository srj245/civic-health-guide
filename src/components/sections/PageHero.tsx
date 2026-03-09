import { type LucideIcon } from "lucide-react";

interface PageHeroProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle: string;
}

const PageHero = ({ icon: Icon, badge, title, subtitle }: PageHeroProps) => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
          <Icon className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">{badge}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-3xl mx-auto leading-tight">
          {title}
        </h1>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default PageHero;
