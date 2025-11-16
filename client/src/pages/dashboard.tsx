import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Sparkles, ArrowRight, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  logo?: string;
  banner?: string;
  maxMembers?: number;
}

interface Event {
  id: string;
  title: string;
  clubId: string;
  date: string;
  time?: string;
  location?: string;
}

export default function Dashboard() {
  const { data: userClubs, isLoading: clubsLoading } = useQuery<Club[]>({
    queryKey: ["/api/user/clubs"],
  });

  const { data: allClubs } = useQuery<Club[]>({
    queryKey: ["/api/clubs"],
  });

  const { data: userEvents } = useQuery<Event[]>({
    queryKey: ["/api/user/events"],
  });

  const clubCount = userClubs?.length || 0;
  const suggestedClubs = allClubs?.filter(club => !userClubs?.find(uc => uc.id === club.id)).slice(0, 3) || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-2)' }}>
      {/* Hero Section */}
      <div className="p-8 pb-6">
        <div className="max-w-6xl">
          <div className="mb-8">
            <h1 className="fui-r-size-6 fui-r-weight-semi-bold mb-2" style={{ color: 'var(--gray-12)' }}>
              Welcome Back! 👋
            </h1>
            <p className="fui-r-size-3" style={{ color: 'var(--gray-11)' }}>
              Discover clubs, make new friends, and get involved on campus
            </p>
          </div>

          {/* Stats Overview */}
          {!clubsLoading && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="elevated-card hover-elevate">
                <p className="fui-r-size-2" style={{ color: 'var(--gray-10)' }}>My Clubs</p>
                <p className="fui-r-size-5 fui-r-weight-semi-bold mt-2" style={{ color: 'var(--accent-9)' }}>
                  {clubCount}
                </p>
                <p className="fui-r-size-1 mt-2" style={{ color: 'var(--gray-10)' }}>
                  {clubCount === 1 ? '1 club joined' : `${clubCount} clubs joined`}
                </p>
              </div>

              <Link href="/events">
                <a className="block elevated-card hover-elevate cursor-pointer transition-all no-underline" style={{ textDecoration: 'none' }}>
                  <p className="fui-r-size-2" style={{ color: 'var(--gray-10)' }}>Upcoming Events</p>
                  <p className="fui-r-size-5 fui-r-weight-semi-bold mt-2" style={{ color: 'var(--success-9)' }}>
                    {userEvents?.length || 0}
                  </p>
                  <p className="fui-r-size-1 mt-2" style={{ color: 'var(--gray-10)' }}>
                    coming your way
                  </p>
                </a>
              </Link>

              <Link href="/discover">
                <a className="block elevated-card hover-elevate cursor-pointer transition-all no-underline" style={{ textDecoration: 'none' }}>
                  <p className="fui-r-size-2" style={{ color: 'var(--gray-10)' }}>Browse Clubs</p>
                  <p className="fui-r-size-5 fui-r-weight-semi-bold mt-2" style={{ color: 'var(--warning-a11)' }}>
                    {allClubs?.length || 0}
                  </p>
                  <p className="fui-r-size-1 mt-2" style={{ color: 'var(--gray-10)' }}>
                    to explore
                  </p>
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8">
        <div className="max-w-6xl space-y-8">
          {/* Your Clubs Section */}
          {clubCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="fui-r-size-5 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                  Your Clubs
                </h2>
                <Link href="/my-clubs">
                  <a className="fui-r-size-2 flex items-center gap-1 hover-elevate p-2" style={{ color: 'var(--accent-9)' }}>
                    View all <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userClubs?.slice(0, 3).map((club) => (
                  <Link key={club.id} href={`/club/${club.id}`}>
                    <a>
                      <Card className="elevated-card hover-elevate h-full cursor-pointer transition-all overflow-hidden group">
                        {/* Banner Image */}
                        <div className="h-32 rounded-t-lg overflow-hidden relative">
                          {club.banner ? (
                            <img 
                              src={club.banner} 
                              alt={club.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div style={{ backgroundColor: 'var(--accent-a3)' }} className="w-full h-full"></div>
                          )}
                        </div>
                        
                        {/* Logo & Content */}
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {club.logo && (
                              <img 
                                src={club.logo} 
                                alt={club.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="fui-r-size-3 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                                {club.name}
                              </h3>
                              <div className="mt-1 inline-block px-2 py-1 rounded-md fui-r-size-1" style={{ backgroundColor: 'var(--accent-a3)', color: 'var(--accent-9)' }}>
                                {club.category}
                              </div>
                            </div>
                          </div>
                          <p className="fui-r-size-2 line-clamp-2" style={{ color: 'var(--gray-11)' }}>
                            {club.description}
                          </p>
                        </div>
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Clubs Section */}
          {suggestedClubs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-9)' }} />
                  <h2 className="fui-r-size-5 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                    Discover Clubs for You
                  </h2>
                </div>
                <Link href="/discover">
                  <a className="fui-r-size-2 flex items-center gap-1 hover-elevate p-2" style={{ color: 'var(--accent-9)' }}>
                    Explore all <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suggestedClubs.map((club) => (
                  <Link key={club.id} href={`/club/${club.id}`}>
                    <a>
                      <Card className="elevated-card hover-elevate h-full cursor-pointer transition-all overflow-hidden group flex flex-col">
                        {/* Banner Image */}
                        <div className="h-32 rounded-t-lg overflow-hidden relative">
                          {club.banner ? (
                            <img 
                              src={club.banner} 
                              alt={club.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div style={{ backgroundColor: 'var(--success-a3)' }} className="w-full h-full"></div>
                          )}
                        </div>
                        
                        {/* Logo & Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start gap-3 mb-3">
                            {club.logo && (
                              <img 
                                src={club.logo} 
                                alt={club.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="fui-r-size-3 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                                {club.name}
                              </h3>
                              <div className="mt-1 inline-block px-2 py-1 rounded-md fui-r-size-1" style={{ backgroundColor: 'var(--success-a3)', color: 'var(--success-9)' }}>
                                {club.category}
                              </div>
                            </div>
                          </div>
                          <p className="fui-r-size-2 line-clamp-2 flex-1" style={{ color: 'var(--gray-11)' }}>
                            {club.description}
                          </p>
                          <Link href={`/club/${club.id}`}>
                            <a className="mt-4 block">
                              <Button className="w-full" style={{ backgroundColor: 'var(--accent-9)', color: 'white' }}>
                                View Club
                              </Button>
                            </a>
                          </Link>
                        </div>
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {userEvents && userEvents.length > 0 && (
            <div>
              <h2 className="fui-r-size-5 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
                Upcoming Events
              </h2>
              <div className="space-y-3">
                {userEvents.slice(0, 5).map((event) => (
                  <Link key={event.id} href={`/event/${event.id}`}>
                    <a>
                      <Card className="elevated-card hover-elevate cursor-pointer transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="fui-r-size-3 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                              {event.title}
                            </h3>
                            <div className="flex gap-4 mt-2 flex-wrap">
                              {event.date && (
                                <div className="flex items-center gap-1 fui-r-size-2" style={{ color: 'var(--gray-10)' }}>
                                  <Clock className="w-4 h-4" />
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-1 fui-r-size-2" style={{ color: 'var(--gray-10)' }}>
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--gray-10)' }} />
                        </div>
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!clubsLoading && clubCount === 0 && suggestedClubs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--gray-10)' }} />
              <h3 className="fui-r-size-4 fui-r-weight-semi-bold mb-2" style={{ color: 'var(--gray-12)' }}>
                No clubs yet?
              </h3>
              <p className="fui-r-size-2 mb-4" style={{ color: 'var(--gray-11)' }}>
                Browse our clubs and join ones that interest you!
              </p>
              <Link href="/discover">
                <a>
                  <Button style={{ backgroundColor: 'var(--accent-9)', color: 'white' }}>
                    Discover Clubs
                  </Button>
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
