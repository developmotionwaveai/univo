import {
  Home,
  Users,
  FileText,
  Calendar,
  Plus,
  Ticket,
  DollarSign,
  TrendingUp,
  Heart,
  Bell,
  MessageSquare,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const navigation = [
  {
    group: "General",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Members", url: "/members", icon: Users },
      { title: "Applications", url: "/applications", icon: FileText },
    ],
  },
  {
    group: "Events",
    items: [
      { title: "All Events", url: "/events", icon: Calendar },
      { title: "Create Event", url: "/events/create", icon: Plus },
    ],
  },
  {
    group: "Fundraising",
    items: [
      { title: "Campaigns", url: "/campaigns", icon: TrendingUp },
      { title: "Create Campaign", url: "/campaigns/create", icon: DollarSign },
    ],
  },
  {
    group: "Announcements",
    items: [
      { title: "All Announcements", url: "/announcements", icon: MessageSquare },
      { title: "Create Announcement", url: "/announcements/create", icon: Plus },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-[var(--stroke)]">
      <SidebarHeader className="border-b border-[var(--stroke)] p-4">
        <Link href="/dashboard">
          <a className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg p-2" data-testid="link-logo">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">U</span>
            </div>
            <div className="flex flex-col">
              <span className="fui-r-size-3 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                Univo
              </span>
              <span className="fui-r-size-1" style={{ color: 'var(--gray-11)' }}>
                Campus Clubs
              </span>
            </div>
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-3">
        {navigation.map((section) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel className="px-3 py-2 fui-r-size-1 fui-r-weight-semi-bold" style={{ color: 'var(--gray-11)' }}>
              {section.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        data-active={isActive}
                        className="hover-elevate active-elevate-2"
                      >
                        <Link href={item.url}>
                          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl" data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}>
                            <item.icon className="h-4 w-4" style={{ color: isActive ? 'var(--accent-9)' : 'var(--gray-11)' }} />
                            <span className="fui-r-size-2" style={{ color: isActive ? 'var(--gray-12)' : 'var(--gray-11)' }}>
                              {item.title}
                            </span>
                          </a>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-[var(--stroke)] p-3">
        <div className="fui-r-size-1 px-3" style={{ color: 'var(--gray-11)' }}>
          © 2024 Univo
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
