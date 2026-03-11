import { TrendingUp, Users, FileText, MapPin } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

interface StatConfig {
  icon: typeof FileText;
  endValue: number;
  suffix: string;
  label: string;
  desc: string;
  duration: number;
}

const stats: StatConfig[] = [
  { icon: FileText, endValue: 500, suffix: "+", label: "Bills Tracked", desc: "Health-related legislation monitored", duration: 2000 },
  { icon: Users, endValue: 26, suffix: "M+", label: "People Affected", desc: "Americans impacted by policy changes", duration: 1800 },
  { icon: MapPin, endValue: 50, suffix: "", label: "States Covered", desc: "Nationwide healthcare resource data", duration: 1600 },
  { icon: TrendingUp, endValue: 0, suffix: "Daily", label: "Updates", desc: "Real-time legislative tracking", duration: 0 },
];

function useCountUp(end: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || duration === 0) {
      if (start) setValue(end);
      return;
    }
    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return value;
}

function AnimatedStat({ stat }: { stat: StatConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(stat.endValue, stat.duration, visible);

  return (
    <div
      ref={ref}
      className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.3s' }}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <stat.icon className="w-6 h-6 text-primary" />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
        {stat.duration === 0 ? stat.suffix : `${count}${stat.suffix}`}
      </p>
      <p className="text-sm font-semibold text-foreground mt-1">{stat.label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{stat.desc}</p>
    </div>
  );
}

const StatisticsSection = () => {
  return (
    <section className="py-14 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">By the Numbers</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Health Policy at a Glance
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
