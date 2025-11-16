import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, MapPin, DollarSign, ArrowRight } from "lucide-react";

export default function MyEvents() {
  // For now, fetch all events - in production, this would fetch only user's RSVP'd events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const upcomingEvents = events
    .filter((e) => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter((e) => new Date(e.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg" style={{ color: "var(--gray-11)" }}>
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
          My Events
        </h1>
        <p style={{ color: "var(--gray-11)" }} className="mt-2">
          {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: "var(--gray-12)" }}>
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="p-4 border border-[var(--stroke)] hover:shadow-md transition-shadow"
                style={{ backgroundColor: "var(--panel-solid)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" style={{ color: "var(--gray-12)" }}>
                      {event.title}
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--gray-11)" }}
                    >
                      {event.description}
                    </p>

                    <div className="flex gap-4 mt-3 flex-wrap text-sm">
                      <div className="flex items-center gap-1" style={{ color: "var(--gray-10)" }}>
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1" style={{ color: "var(--gray-10)" }}>
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      {event.requiresPayment && (
                        <div className="flex items-center gap-1" style={{ color: "var(--warning-a11)" }}>
                          <DollarSign className="h-4 w-4" />
                          ${((event.price || 0) / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <Link href={`/events/${event.id}`}>
                    <a>
                      <Badge variant="secondary" className="ml-4">
                        View
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Badge>
                    </a>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: "var(--gray-12)" }}>
            Past Events
          </h2>
          <div className="space-y-3">
            {pastEvents.slice(0, 5).map((event) => (
              <Card
                key={event.id}
                className="p-4 border border-[var(--stroke)]"
                style={{ backgroundColor: "var(--panel-solid)", opacity: 0.7 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className="font-semibold"
                      style={{ color: "var(--gray-11)" }}
                    >
                      {event.title}
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--gray-10)" }}
                    >
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <Card
          className="p-12 text-center border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <p style={{ color: "var(--gray-11)" }}>
            No events yet. Explore clubs and sign up for events!
          </p>
        </Card>
      )}
    </div>
  );
}
