import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4" role="banner">
            <SidebarTrigger aria-label="Toggle sidebar" />
            <div className="flex items-center gap-2">
              {user ? (
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5">
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="gap-1.5">
                  <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in
                </Button>
              )}
              <ThemeToggle />
            </div>
          </header>
          <main id="main-content" className="flex-1" role="main">
            {children}
          </main>
          <Footer />
        </div>
      </div>
      <ChatWidget />
    </SidebarProvider>
  );
};

export default AppLayout;
