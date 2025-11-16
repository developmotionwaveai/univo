import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, DollarSign, Plus } from "lucide-react";
import { Link } from "wouter";
import { Event } from "@shared/schema";

export default function Events() {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
  const pastEvents = events.filter(e => new Date(e.date) <= new Date());

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
            Events
          </h1>
          <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
            Manage club events and ticket sales
          </p>
        </div>
        <Link href="/events/create">
          <a data-testid="button-create-event">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </a>
        </Link>
      </div>

      <div>
        <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
          Upcoming Events
        </h2>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 elevated-card animate-pulse">
                <div className="h-40 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <Card className="p-12 elevated-card text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gray-11)' }} />
            <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
              No upcoming events
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <a data-testid={`card-event-${event.id}`}>
                  <Card className="overflow-hidden elevated-card hover-elevate active-elevate-2 transition-all cursor-pointer">
                    {event.banner && (
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${event.banner})` }}
                      />
                    )}
                    <div className="p-6">
                      <h3 className="fui-r-size-4 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                        {event.title}
                      </h3>
                      <p className="fui-r-size-2 mt-2 line-clamp-2" style={{ color: 'var(--gray-11)' }}>
                        {event.description}
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" style={{ color: 'var(--gray-11)' }} />
                          <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" style={{ color: 'var(--gray-11)' }} />
                            <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                              {event.location}
                            </span>
                          </div>
                        )}
                        {event.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" style={{ color: 'var(--gray-11)' }} />
                            <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                              {event.capacity} attendees
                            </span>
                          </div>
                        )}
                        {event.requiresPayment && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" style={{ color: 'var(--accent-9)' }} />
                            <span className="fui-r-size-2 fui-r-weight-medium" style={{ color: 'var(--accent-9)' }}>
                              ${((event.price || 0) / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div>
          <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
            Past Events
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <a data-testid={`card-past-event-${event.id}`}>
                  <Card className="overflow-hidden elevated-card opacity-75 hover-elevate transition-all cursor-pointer">
                    {event.banner && (
                      <div
                        className="h-48 bg-cover bg-center grayscale"
                        style={{ backgroundImage: `url(${event.banner})` }}
                      />
                    )}
                    <div className="p-6">
                      <h3 className="fui-r-size-4 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-3">
                        <Calendar className="h-4 w-4" style={{ color: 'var(--gray-11)' }} />
                        <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
