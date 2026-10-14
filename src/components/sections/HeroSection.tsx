import { Link } from "react-router-dom";

const NBSP = " ";
const sentence = (s: string) => s.split(" ").join(NBSP);

const HeroSection = () => {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-gap" aria-hidden="true" />

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

      <Link to="/news" className="hero-btn io" data-io="btn">
        Browse health bills
      </Link>

      <Link to="/care" className="hero-link io" data-io="link">
        Find care near me
        <svg viewBox="0 0 11 12.6" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-io="arrow">
          <path d="M5.5 .4V12M1 7.5L5.5 12L10 7.5" />
        </svg>
      </Link>

      <div className="hero-field" aria-hidden="true" />
    </section>
  );
};

export default HeroSection;
