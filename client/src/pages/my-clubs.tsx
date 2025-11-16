import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Club, ClubMember } from "@shared/schema";
import { Link } from "wouter";
import { ArrowRight, Plus } from "lucide-react";

export default function MyClubs() {
  const { data: clubs = [], isLoading: clubsLoading } = useQuery<Club[]>({
    queryKey: ["/api/user/clubs"],
  });

  const { data: clubRoles = [], isLoading: rolesLoading } = useQuery<ClubMember[]>({
    queryKey: ["/api/user/club-roles"],
  });

  // Create a map of club ID to user's role
  const clubRoleMap = clubRoles.reduce(
    (acc, role) => {
      acc[role.clubId] = role;
      return acc;
    },
    {} as Record<string, ClubMember>
  );

  if (clubsLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg" style={{ color: "var(--gray-11)" }}>
          Loading your clubs...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
            My Clubs
          </h1>
          <p style={{ color: "var(--gray-11)" }} className="mt-2">
            You are a member of {clubs.length} club{clubs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/discover">
          <a>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Join a Club
            </Button>
          </a>
        </Link>
      </div>

      {/* Clubs List */}
      {clubs.length === 0 ? (
        <Card
          className="p-12 text-center border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <p style={{ color: "var(--gray-11)" }} className="mb-4">
            You haven't joined any clubs yet
          </p>
          <Link href="/discover">
            <a>
              <Button variant="default">
                Browse Clubs
              </Button>
            </a>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map((club) => {
            const userRole = clubRoleMap[club.id];
            const isOfficer = userRole?.role === "officer" || userRole?.role === "admin";

            return (
              <Card
                key={club.id}
                className="p-6 hover:shadow-lg transition-shadow border border-[var(--stroke)]"
                style={{ backgroundColor: "var(--panel-solid)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: "var(--gray-12)" }}>
                      {club.name}
                    </h3>
                    {club.category && (
                      <p
                        className="text-xs mt-1 inline-block px-2 py-1 rounded"
                        style={{
                          backgroundColor: "var(--accent-3)",
                          color: "var(--accent-11)",
                        }}
                      >
                        {club.category}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full capitalize font-medium"
                    style={{
                      backgroundColor:
                        userRole?.role === "admin"
                          ? "var(--danger-3)"
                          : userRole?.role === "officer"
                          ? "var(--warning-a3)"
                          : "var(--accent-3)",
                      color:
                        userRole?.role === "admin"
                          ? "var(--danger-11)"
                          : userRole?.role === "officer"
                          ? "var(--warning-a11)"
                          : "var(--accent-11)",
                    }}
                  >
                    {userRole?.role}
                  </span>
                </div>

                <p
                  className="text-sm line-clamp-2 mb-4"
                  style={{ color: "var(--gray-11)" }}
                >
                  {club.description}
                </p>

                <div className="flex gap-2">
                  <Link href={`/club/${club.id}`}>
                    <a className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Club
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  </Link>
                  {isOfficer && (
                    <Link href={`/club/${club.id}/dashboard`}>
                      <a>
                        <Button>Dashboard</Button>
                      </a>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
