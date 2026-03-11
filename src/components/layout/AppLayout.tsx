import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Search, LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-background px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-48"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[150px]">
                    {user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5">
                    <LogOut className="w-4 h-4" /> Sign out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="gap-1.5">
                  <LogIn className="w-4 h-4" /> Sign in
                </Button>
              )}
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
