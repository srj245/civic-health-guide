import { useLocation } from "react-router-dom";
import Masthead from "@/components/layout/Masthead";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useIntro } from "@/hooks/useIntro";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const root = useIntro<HTMLDivElement>();

  return (
    <div ref={root} className="flex min-h-screen flex-col" data-route={pathname}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main-content" className="flex flex-1 flex-col" role="main">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default AppLayout;
