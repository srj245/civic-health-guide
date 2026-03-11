import { Home, TrendingUp, Users, MapPin, Megaphone, Info, Bookmark, Calculator, Heart } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTrackedBills } from "@/hooks/useTrackedBills";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Health News", url: "/news", icon: TrendingUp },
  { title: "Who's Affected", url: "/affected", icon: Users },
  { title: "Find Care", url: "/care", icon: MapPin },
  { title: "Your Reps", url: "/representatives", icon: Megaphone },
  { title: "Impact Calculator", url: "/impact", icon: Calculator },
  { title: "About", url: "/about", icon: Info },
];

const personalNav = [
  { title: "My Dashboard", url: "/dashboard", icon: Bookmark },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();
  const { count } = useTrackedBills();

  const renderItem = (item: typeof mainNav[0], badge?: number) => {
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
            {!collapsed && (
              <span className="flex-1 flex items-center justify-between">
                {item.title}
                {badge != null && badge > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[10px] h-5 min-w-5 px-1.5">
                    {badge}
                  </Badge>
                )}
              </span>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

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
              {mainNav.map((item) => renderItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50">Personal</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {personalNav.map((item) =>
                  renderItem(item, item.url === "/dashboard" ? count : undefined)
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
