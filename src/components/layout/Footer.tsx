import { Link } from "react-router-dom";

const links = [
  { name: "Bills", href: "/news" },
  { name: "Who's affected", href: "/affected" },
  { name: "Care", href: "/care" },
  { name: "Reps", href: "/representatives" },
  { name: "Impact", href: "/impact" },
  { name: "About", href: "/about" },
  { name: "Accessibility", href: "/accessibility" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border px-6 py-10 md:px-10" role="contentinfo">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} to={l.href} className="hover:text-foreground">
              {l.name}
            </Link>
          ))}
        </nav>
        <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
          Bill data from Congress.gov. Districts from the U.S. Census geocoder. Care listings from Google Places.
          CivicCare is nonpartisan and is not legal or medical advice.
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} CivicCare · Built for the Congressional App Challenge
        </p>
      </div>
    </footer>
  );
};

export default Footer;
