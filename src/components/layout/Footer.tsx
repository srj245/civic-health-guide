import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    resources: [
      { name: "Health News", href: "/news" },
      { name: "Find Care", href: "/care" },
      { name: "Who's Affected", href: "/affected" },
      { name: "Take Action", href: "/#action" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Mission", href: "/about" },
      { name: "Contact", href: "/#action" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/#" },
      { name: "Terms of Service", href: "/#" },
      { name: "Accessibility", href: "/#" },
    ],
  };

  const handleNav = (href: string) => {
    if (href.startsWith("/#")) {
      const hash = href.slice(1);
      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  const renderLinks = (links: { name: string; href: string }[]) =>
    links.map((link) => (
      <li key={link.name}>
        <button
          onClick={() => handleNav(link.href)}
          className="text-sm text-background/60 hover:text-background transition-colors"
        >
          {link.name}
        </button>
      </li>
    ));

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => handleNav("/")} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CivicCare</span>
            </button>
            <p className="text-sm text-background/60 leading-relaxed">
              Making healthcare policy accessible to everyone. Nonpartisan, inclusive, and built for everyday people.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-background/90">Resources</h4>
            <ul className="space-y-2">{renderLinks(footerLinks.resources)}</ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-background/90">Company</h4>
            <ul className="space-y-2">{renderLinks(footerLinks.company)}</ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-background/90">Legal</h4>
            <ul className="space-y-2">{renderLinks(footerLinks.legal)}</ul>
          </div>
        </div>

        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} CivicCare. All rights reserved.
          </p>
          <p className="text-sm text-background/50">
            Made with care for informed citizens everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
