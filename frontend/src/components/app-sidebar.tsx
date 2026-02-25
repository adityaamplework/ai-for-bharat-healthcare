import {
  LayoutDashboard,
  Users,
  Leaf,
  UtensilsCrossed,
  ClipboardList,
  FlaskConical,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation } from "wouter";
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
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Prakriti Assessment", url: "/assessment", icon: FlaskConical },
  { title: "Food Database", url: "/foods", icon: Leaf },
  { title: "Diet Charts", url: "/diet-charts", icon: ClipboardList },
  { title: "Generate Diet", url: "/generate", icon: UtensilsCrossed },
  { title: "AI Assistant", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div>
            <h2
              className="text-sm font-semibold tracking-tight"
              data-testid="text-app-title"
            >
              AyurDiet AI
            </h2>
            <p className="text-xs text-muted-foreground">
              Ayurvedic Diet System
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  location === item.url ||
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link
                        href={item.url}
                        data-testid={`link-nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
