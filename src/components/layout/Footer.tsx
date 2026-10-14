import { Link } from "react-router-dom";

const columns = [
  {
    heading: "Explore",
    links: [
      { name: "Health bills", href: "/news" },
      { name: "Who's affected", href: "/affected" },
      { name: "Find care", href: "/care" },
      { name: "Your representatives", href: "/representatives" },
      { name: "Impact calculator", href: "/impact" },
    ],
  },
  {
    heading: "CivicCare",
    links: [
      { name: "About", href: "/about" },
      { name: "Accessibility", href: "/accessibility" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background px-6 py-10 md:px-10" role="contentinfo">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-lg font-bold text-foreground">CivicCare</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Health legislation in plain English, with the resources to act on it. Nonpartisan and free.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Bill data from Congress.gov. Care listings from Google Places. CivicCare is not legal or medical advice.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className="text-sm font-semibold text-foreground">{col.heading}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href + link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-border pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} CivicCare. Built for the Congressional App Challenge.
      </div>
    </footer>
  );
};

export default Footer;
