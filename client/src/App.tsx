import { useEffect, useState } from "react";
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
import Discover from "@/pages/discover";
import ClubDetail from "@/pages/club-detail";
import MyClubs from "@/pages/my-clubs";
import MyEvents from "@/pages/my-events";
import MyApplications from "@/pages/my-applications";
import MyPayments from "@/pages/my-payments";
import ClubDashboard from "@/pages/club-dashboard";
import ManageMembers from "@/pages/manage-members";
import ManageApplications from "@/pages/manage-applications";
import ManageDues from "@/pages/manage-dues";
import Profile from "@/pages/profile";
import CreateEvent from "@/pages/create-event";
import CreateAnnouncement from "@/pages/create-announcement";
import EventRSVP from "@/pages/event-rsvp";
import PaymentHistory from "@/pages/payment-history";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, setUser, logout } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validate session on mount
    const validateSession = async () => {
      if (!user) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          // Session is invalid, clear user
          logout();
        } else {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        // Session validation failed
        logout();
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, []);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg" style={{ color: "var(--gray-11)" }}>
          Loading...
        </div>
      </div>
    );
  }

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

      <Route path="/discover">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Discover />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/club/:id">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <ClubDetail />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/my-clubs">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <MyClubs />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/my-events">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <MyEvents />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/my-applications">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <MyApplications />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/my-payments">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <PaymentHistory />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/events/:id/rsvp">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <EventRSVP />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/club/:id/dashboard">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <ClubDashboard />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/club/:id/manage-members">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <ManageMembers />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/club/:id/manage-applications">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <ManageApplications />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/club/:id/manage-dues">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <ManageDues />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/club/:id/create-event">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <CreateEvent />
              </DashboardLayout>
            )}
          />
        )}
      </Route>

      <Route path="/club/:id/create-announcement">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <CreateAnnouncement />
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

      <Route path="/profile">
        {() => (
          <ProtectedRoute
            component={() => (
              <DashboardLayout>
                <Profile />
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
