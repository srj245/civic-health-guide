import { Home, TrendingUp, Users, MapPin, Megaphone, Heart, Info } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Health News", url: "/news", icon: TrendingUp },
  { title: "Who's Affected", url: "/affected", icon: Users },
  { title: "Find Care", url: "/care", icon: MapPin },
  { title: "Your Reps", url: "/representatives", icon: Megaphone },
  { title: "About", url: "/about", icon: Info },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <a href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sidebar-ring flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-sidebar-background" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">CivicCare</span>
          )}
        </a>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-[3px] border-sidebar-ring rounded-none rounded-r-lg"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <NavLink to={item.url} end={item.url === "/"}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/50 text-center">
            © 2026 CivicCare
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
