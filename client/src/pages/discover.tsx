import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Club } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";
import { Search, MapPin, Users, ExternalLink } from "lucide-react";

export default function DiscoverClubs() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clubs = [], isLoading } = useQuery<Club[]>({
    queryKey: ["/api/clubs"],
  });

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg" style={{ color: "var(--gray-11)" }}>
          Loading clubs...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
          Discover Clubs
        </h1>
        <p style={{ color: "var(--gray-11)" }} className="mt-2">
          Browse and join clubs at your campus
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5" style={{ color: "var(--gray-9)" }} />
        <Input
          placeholder="Search clubs by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Club Grid */}
      {filteredClubs.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: "var(--gray-11)" }}>
            {searchTerm ? "No clubs found matching your search" : "No clubs available yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClubs.map((club) => (
            <Card
              key={club.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer border border-[var(--stroke)]"
              style={{ backgroundColor: "var(--panel-solid)" }}
            >
              {club.banner && (
                <div className="mb-4 h-32 bg-gradient-to-r from-accent-9 to-accent-10 rounded-lg overflow-hidden">
                  <img
                    src={club.banner}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--gray-12)" }}>
                    {club.name}
                  </h3>
                  {club.category && (
                    <p
                      className="text-sm mt-1"
                      style={{ backgroundColor: "var(--accent-3)", color: "var(--accent-11)" }}
                    >
                      {club.category}
                    </p>
                  )}
                </div>

                <p
                  className="text-sm line-clamp-2"
                  style={{ color: "var(--gray-11)" }}
                >
                  {club.description}
                </p>

                <div className="flex items-center gap-4 text-sm" style={{ color: "var(--gray-10)" }}>
                  {club.email && (
                    <div className="flex items-center gap-1">
                      <span>📧</span>
                      {club.email}
                    </div>
                  )}
                </div>

                <Link href={`/club/${club.id}`}>
                  <a>
                    <Button className="w-full mt-4" variant="default">
                      View Club
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
