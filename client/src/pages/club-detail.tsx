import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Club, ClubMember, Event, Announcement } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, MessageSquare, Settings } from "lucide-react";
import { ApplicationFormDialog } from "@/components/application-form-dialog";

export default function ClubDetail() {
  const [, params] = useRoute("/club/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const clubId = params?.id || "";

  // Fetch club details
  const { data: club, isLoading: clubLoading } = useQuery<Club>({
    queryKey: [`/api/clubs/${clubId}`],
    enabled: !!clubId,
  });

  // Fetch club members
  const { data: clubMembers = [] } = useQuery<ClubMember[]>({
    queryKey: [`/api/clubs/${clubId}/members`],
    enabled: !!clubId,
  });

  // Fetch user's club role
  const { data: userClubRole } = useQuery<ClubMember | null>({
    queryKey: [`/api/clubs/${clubId}/user-role`],
    enabled: !!clubId && !!user,
  });

  // Fetch club events
  const { data: clubEvents = [] } = useQuery<Event[]>({
    queryKey: [`/api/clubs/${clubId}/events`],
    enabled: !!clubId,
  });

  // Fetch club announcements
  const { data: clubAnnouncements = [] } = useQuery<Announcement[]>({
    queryKey: [`/api/clubs/${clubId}/announcements`],
    enabled: !!clubId,
  });

  const handleApplicationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/clubs/${clubId}/user-role`] });
  };

  if (clubLoading || !club) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg" style={{ color: "var(--gray-11)" }}>
          Loading club...
        </div>
      </div>
    );
  }

  const isUserMember = userClubRole?.status === "active";
  const isUserOfficer = userClubRole?.role === "officer" || userClubRole?.role === "admin";

  return (
    <div className="p-6 space-y-6">
      {/* Club Header */}
      {club.banner && (
        <div className="h-48 rounded-lg overflow-hidden mb-4">
          <img
            src={club.banner}
            alt={club.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: "var(--gray-12)" }}>
            {club.name}
          </h1>
          {club.category && (
            <p
              className="mt-2 inline-block px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: "var(--accent-3)", color: "var(--accent-11)" }}
            >
              {club.category}
            </p>
          )}
          <p className="mt-4" style={{ color: "var(--gray-11)" }}>
            {club.description}
          </p>
        </div>

        {user && (
          <div className="flex gap-2">
            {isUserMember && isUserOfficer && (
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Club Settings
              </Button>
            )}
            {!isUserMember && (
              <ApplicationFormDialog
                clubId={clubId}
                clubName={club.name}
                onSubmitSuccess={handleApplicationSuccess}
              />
            )}
          </div>
        )}
      </div>

      {/* Club Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className="p-4 border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5" style={{ color: "var(--accent-9)" }} />
            <span style={{ color: "var(--gray-11)" }}>Members</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--gray-12)" }}>
            {clubMembers.length}
          </p>
        </Card>

        <Card
          className="p-4 border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5" style={{ color: "var(--success-9)" }} />
            <span style={{ color: "var(--gray-11)" }}>Upcoming Events</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--gray-12)" }}>
            {clubEvents.filter((e) => new Date(e.date) > new Date()).length}
          </p>
        </Card>

        <Card
          className="p-4 border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5" style={{ color: "var(--warning-a11)" }} />
            <span style={{ color: "var(--gray-11)" }}>Announcements</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--gray-12)" }}>
            {clubAnnouncements.length}
          </p>
        </Card>
      </div>

      {/* Tabs for club content */}
      {isUserMember && (
        <Tabs defaultValue="announcements" className="mt-6">
          <TabsList>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            {isUserOfficer && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            {clubAnnouncements.length === 0 ? (
              <p style={{ color: "var(--gray-11)" }}>No announcements yet</p>
            ) : (
              clubAnnouncements.map((ann) => (
                <Card
                  key={ann.id}
                  className="p-4 border border-[var(--stroke)]"
                  style={{ backgroundColor: "var(--panel-solid)" }}
                >
                  <h3 className="font-semibold" style={{ color: "var(--gray-12)" }}>
                    {ann.title}
                  </h3>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--gray-11)" }}
                  >
                    {ann.content}
                  </p>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {clubEvents.length === 0 ? (
              <p style={{ color: "var(--gray-11)" }}>No events scheduled</p>
            ) : (
              clubEvents.map((event) => (
                <Card
                  key={event.id}
                  className="p-4 border border-[var(--stroke)]"
                  style={{ backgroundColor: "var(--panel-solid)" }}
                >
                  <h3 className="font-semibold" style={{ color: "var(--gray-12)" }}>
                    {event.title}
                  </h3>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--gray-11)" }}
                  >
                    {new Date(event.date).toLocaleDateString()} at {event.location}
                  </p>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <p style={{ color: "var(--gray-11)" }} className="text-sm">
              {clubMembers.length} member{clubMembers.length !== 1 ? "s" : ""}
            </p>
            {clubMembers.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-lg flex items-center justify-between border border-[var(--stroke)]"
                style={{ backgroundColor: "var(--panel-solid)" }}
              >
                <span style={{ color: "var(--gray-12)" }}>{member.userId}</span>
                <span
                  className="text-sm px-2 py-1 rounded"
                  style={{ backgroundColor: "var(--accent-3)", color: "var(--accent-11)" }}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </TabsContent>

          {isUserOfficer && (
            <TabsContent value="admin" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <p className="font-semibold">Manage Members</p>
                    <p className="text-xs mt-1" style={{ color: "var(--gray-11)" }}>
                      Edit roles, remove members
                    </p>
                  </div>
                </Button>
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <p className="font-semibold">Create Event</p>
                    <p className="text-xs mt-1" style={{ color: "var(--gray-11)" }}>
                      Schedule new events
                    </p>
                  </div>
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
