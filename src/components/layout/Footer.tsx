import { Heart } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    resources: [
      { name: "Health News", href: "/news" },
      { name: "Find Care", href: "/care" },
      { name: "Who's Affected", href: "/affected" },
      { name: "Take Action", href: "/#action" },
    ],
    company: [
      { name: "About Us", href: "/#" },
      { name: "Our Mission", href: "/#" },
      { name: "Contact", href: "/#action" },
      { name: "Careers", href: "/#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/#" },
      { name: "Terms of Service", href: "/#" },
      { name: "Accessibility", href: "/#" },
    ],
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CivicCare</span>
            </a>
            <p className="text-sm text-background/60 leading-relaxed">
              Making healthcare policy accessible to everyone. Nonpartisan, inclusive, and built for everyday people.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-background/90">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-background/90">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-background/90">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
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
