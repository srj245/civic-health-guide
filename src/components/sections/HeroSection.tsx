import { useRef } from "react";
import { Link } from "react-router-dom";
import { useHealthBills } from "@/hooks/useCongressApi";
import { useMagnetic } from "@/hooks/usePointerEffects";

const NBSP = " ";
const sentence = (s: string) => s.split(" ").join(NBSP);

/** Live bill titles sliding across the horizon. Duplicated once for a seamless loop. */
const BillTicker = () => {
  const { bills, loading } = useHealthBills(8);
  if (loading || bills.length === 0) return null;
  const items = [...bills, ...bills];
  return (
    <div className="ticker" aria-label="Latest health bills in Congress">
      <div className="ticker-track">
        {items.map((bill, i) => (
          <Link key={`${bill.id}-${i}`} to="/news" className="ticker-item" aria-hidden={i >= bills.length}>
            <span className="ticker-id">
              {bill.type} {bill.number}
            </span>
            <span className="ticker-title">{bill.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const HeroSection = () => {
  const btn = useRef<HTMLAnchorElement>(null);
  useMagnetic(btn, 0.16);

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="sky" aria-hidden="true">
        <span className="sky-stars" />
        <span className="sky-stars sky-stars-2" />
        <span className="sky-aurora" />
      </div>

      <div className="hero-gap" aria-hidden="true" />

      <p className="hero-eyebrow io" data-io="eyebrow">
        <span className="hero-dot" />
        Live from the 119th Congress
      </p>

      <h1 id="hero-heading" className="hero-h1">
        <span className="l l1">
          <span className="li" data-io="line1">
            Know what Congress is doing
          </span>
        </span>
        <span className="l l2">
          <span className="li" data-io="line2">
            to your health care.
          </span>
        </span>
      </h1>

      <p className="hero-sub io" data-io="sub">
        {sentence("Then do something about it.")} {sentence("We’ll show you how.")}
      </p>

      <Link ref={btn} to="/news" className="hero-btn io" data-io="btn">
        Browse health bills
      </Link>

      <Link to="/care" className="hero-link io" data-io="link">
        Find care near me
        <svg viewBox="0 0 11 12.6" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-io="arrow">
          <path d="M5.5 .4V12M1 7.5L5.5 12L10 7.5" />
        </svg>
      </Link>

      <div className="hero-field">
        <div className="io" data-io="ticker">
          <BillTicker />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
