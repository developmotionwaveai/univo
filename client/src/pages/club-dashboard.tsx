import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, Calendar, Megaphone, DollarSign, FileText, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClubDashboardStats {
  totalMembers: number;
  pendingApplications: number;
  upcomingEvents: number;
  activeAnnouncements: number;
  pendingDues: number;
}

export default function ClubDashboard() {
  const [, params] = useRoute('/club/:id/dashboard');
  const clubId = params?.id;

  const { data: club, isLoading: clubLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}`);
      return res.json();
    },
    enabled: !!clubId,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['club-stats', clubId],
    queryFn: async () => {
      const [membersRes, applicationsRes, eventsRes, announcementsRes, duesRes] = await Promise.all([
        fetch(`/api/clubs/${clubId}/members`),
        fetch(`/api/clubs/${clubId}/applications`),
        fetch(`/api/clubs/${clubId}/events`),
        fetch(`/api/clubs/${clubId}/announcements`),
        fetch(`/api/clubs/${clubId}/dues`),
      ]);

      const members = await membersRes.json();
      const applications = await applicationsRes.json();
      const events = await eventsRes.json();
      const announcements = await announcementsRes.json();
      const dues = await duesRes.json();

      return {
        totalMembers: members.length,
        pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
        upcomingEvents: events.filter((e: any) => new Date(e.date) > new Date()).length,
        activeAnnouncements: announcements.length,
        pendingDues: dues.filter((d: any) => d.is_active).length,
      };
    },
    enabled: !!clubId,
  });

  if (clubLoading) {
    return <div className="p-4">Loading club dashboard...</div>;
  }

  if (!club) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Club not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{club.name} Dashboard</h1>
        <p className="text-gray-600">Manage your club operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats?.pendingApplications || 0}</div>
            <p className="text-xs text-gray-600">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingEvents || 0}</div>
            <p className="text-xs text-gray-600">Upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAnnouncements || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Dues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingDues || 0}</div>
            <p className="text-xs text-gray-600">Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="dues">Dues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Club Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600">{club.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {club.category && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Category</h4>
                    <p className="text-sm text-gray-600">{club.category}</p>
                  </div>
                )}
                {club.email && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Email</h4>
                    <p className="text-sm text-gray-600">{club.email}</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full">
                Edit Club Details
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href={`/club/${clubId}/create-event`}>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
              <Link href={`/club/${clubId}/create-announcement`}>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </Link>
              <Link href={`/club/${clubId}/manage-dues`}>
                <Button className="w-full">Manage Dues</Button>
              </Link>
              <Link href={`/club/${clubId}/manage-members`}>
                <Button className="w-full">Manage Members</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Club Members</CardTitle>
              <CardDescription>Manage your club members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Members management interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Review and manage join applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Applications management interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>Create and manage club events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Events management interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Send announcements to club members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Announcements management interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dues Management</CardTitle>
              <CardDescription>Set up and track membership dues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Dues management interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
