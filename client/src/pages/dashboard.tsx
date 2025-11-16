import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Users, Calendar, DollarSign, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalMembers: number;
  upcomingEvents: number;
  activeCampaigns: number;
  pendingApplications: number;
  recentActivity: Array<{
    type: string;
    message: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const statCards = [
    {
      title: "Total Members",
      value: stats?.totalMembers || 0,
      icon: Users,
      color: "var(--accent-9)",
      link: "/members",
    },
    {
      title: "Upcoming Events",
      value: stats?.upcomingEvents || 0,
      icon: Calendar,
      color: "var(--success-9)",
      link: "/events",
    },
    {
      title: "Active Campaigns",
      value: stats?.activeCampaigns || 0,
      icon: DollarSign,
      color: "var(--warning-a11)",
      link: "/campaigns",
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      icon: MessageSquare,
      color: "var(--danger-9)",
      link: "/applications",
    },
  ];

  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
          Dashboard
        </h1>
        <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
          Overview of your club's activity
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 elevated-card animate-pulse">
              <div className="h-16 bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.link}>
              <a data-testid={`card-stat-${stat.title.toLowerCase().replace(/ /g, '-')}`}>
                <Card className="p-6 elevated-card hover-elevate active-elevate-2 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                        {stat.title}
                      </p>
                      <p className="fui-r-size-6 fui-r-weight-semi-bold mt-2" style={{ color: 'var(--gray-12)' }}>
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: stat.color + '20' }}
                    >
                      <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 elevated-card">
          <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link href="/events/create">
              <a data-testid="button-create-event">
                <Button variant="outline" className="w-full justify-start hover-elevate">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
              </a>
            </Link>
            <Link href="/campaigns/create">
              <a data-testid="button-create-campaign">
                <Button variant="outline" className="w-full justify-start hover-elevate">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Start Fundraising Campaign
                </Button>
              </a>
            </Link>
            <Link href="/announcements/create">
              <a data-testid="button-create-announcement">
                <Button variant="outline" className="w-full justify-start hover-elevate">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Announcement
                </Button>
              </a>
            </Link>
          </div>
        </Card>

        <Card className="p-6 elevated-card">
          <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
            Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover-elevate" style={{ backgroundColor: 'var(--gray-a2)' }}>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-a3)' }}>
                    <span className="fui-r-size-1" style={{ color: 'var(--accent-9)' }}>
                      {activity.type === 'event' ? 'E' : activity.type === 'campaign' ? 'C' : 'A'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
                      {activity.message}
                    </p>
                    <p className="fui-r-size-1 mt-1" style={{ color: 'var(--gray-11)' }}>
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
