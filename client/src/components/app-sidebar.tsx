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
  Compass,
  GripVertical,
  ChevronRight,
  CheckSquare,
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
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Club, ClubMember } from "@shared/schema";

const personalNavigation = [
  {
    group: "Personal",
    items: [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Discover Clubs", url: "/discover", icon: Compass },
      { title: "My Clubs", url: "/my-clubs", icon: Users },
      { title: "My Applications", url: "/my-applications", icon: CheckSquare },
      { title: "My Events", url: "/my-events", icon: Calendar },
      { title: "My Payments", url: "/my-payments", icon: DollarSign },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
];

function ClubNavigation({ clubs }: { clubs: Club[] }) {
  const [location] = useLocation();

  if (clubs.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 py-2 fui-r-size-1 fui-r-weight-semi-bold" style={{ color: 'var(--gray-11)' }}>
        Your Clubs
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {clubs.map((club) => {
            const clubDashboardUrl = `/club/${club.id}`;
            const isActive = location.startsWith(`/club/${club.id}`);
            
            return (
              <SidebarMenuItem key={club.id}>
                <SidebarMenuButton
                  asChild
                  data-active={isActive}
                  className="hover-elevate active-elevate-2"
                >
                  <Link href={clubDashboardUrl}>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full" data-testid={`link-club-${club.id}`}>
                      <div className="h-4 w-4 rounded bg-accent" style={{ backgroundColor: 'var(--accent-9)' }} />
                      <span className="fui-r-size-2 flex-1 truncate" style={{ color: isActive ? 'var(--gray-12)' : 'var(--gray-11)' }}>
                        {club.name}
                      </span>
                      {isActive && <ChevronRight className="h-4 w-4" style={{ color: 'var(--accent-9)' }} />}
                    </a>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch user's clubs
  const { data: userClubs = [] } = useQuery<Club[]>({
    queryKey: ["/api/user/clubs"],
    enabled: !!user,
  });

  // Fetch user's club roles
  const { data: clubRoles = [] } = useQuery<ClubMember[]>({
    queryKey: ["/api/user/club-roles"],
    enabled: !!user,
  });

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
        {/* Personal Navigation */}
        {personalNavigation.map((section) => (
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

        {/* Club-Specific Navigation - Only if user is in clubs */}
        {userClubs.length > 0 && <ClubNavigation clubs={userClubs} />}
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--stroke)] p-3 space-y-2">
        <Link href="/profile">
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover-elevate w-full" style={{ backgroundColor: 'var(--gray-a2)' }} data-testid="link-profile">
            <Settings className="h-4 w-4" style={{ color: 'var(--gray-11)' }} />
            <span className="fui-r-size-2 flex-1" style={{ color: 'var(--gray-12)' }}>
              {user?.firstName} {user?.lastName}
            </span>
          </a>
        </Link>
        <div className="fui-r-size-1 px-3" style={{ color: 'var(--gray-11)' }}>
          © 2024 Univo
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
