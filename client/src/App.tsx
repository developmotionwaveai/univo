import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Members from "@/pages/members";
import Applications from "@/pages/applications";
import Events from "@/pages/events";
import EventCreate from "@/pages/event-create";
import EventDetail from "@/pages/event-detail";
import Campaigns from "@/pages/campaigns";
import CampaignCreate from "@/pages/campaign-create";
import CampaignDetail from "@/pages/campaign-detail";
import Announcements from "@/pages/announcements";
import AnnouncementCreate from "@/pages/announcement-create";
import Notifications from "@/pages/notifications";
import NotFound from "@/pages/not-found";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function AppHeader() {
  const { user } = useAuth();
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header
      className="flex items-center justify-between p-4 border-b"
      style={{ borderColor: 'var(--stroke)', backgroundColor: 'var(--panel-solid)' }}
    >
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Link href="/notifications">
          <a data-testid="button-notifications">
            <Button variant="ghost" size="icon" className="relative hover-elevate">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[var(--danger-9)] text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </a>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "260px",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div id="dashboard-grid" className="flex h-screen w-full">
        <AppSidebar />
        <div id="dashboard-content" className="flex flex-col flex-1 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--gray-2)' }}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/members">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Members />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/applications">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Applications />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/events">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Events />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/events/create">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <EventCreate />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/events/:id">
        {() => <ProtectedRoute component={EventDetail} />}
      </Route>

      <Route path="/campaigns">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Campaigns />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/campaigns/create">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <CampaignCreate />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/campaigns/:id">
        {() => <ProtectedRoute component={CampaignDetail} />}
      </Route>

      <Route path="/announcements">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Announcements />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/announcements/create">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <AnnouncementCreate />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/notifications">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
