import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Users, DollarSign, ArrowLeft } from "lucide-react";
import { Event } from "@shared/schema";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
    enabled: !!id,
  });

  const { register, handleSubmit, reset } = useForm();

  const rsvpMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/rsvps", {
        ...data,
        eventId: id,
        ticketsPurchased: 1,
        totalAmount: event?.price || 0,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rsvps"] });
      toast({ title: "RSVP submitted successfully!" });
      reset();
    },
    onError: () => {
      toast({ title: "Failed to submit RSVP", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-6 elevated-card animate-pulse">
          <div className="h-96 bg-muted rounded" />
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <Card className="p-12 elevated-card text-center">
          <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>Event not found</p>
        </Card>
      </div>
    );
  }

  const isPastEvent = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-2)' }}>
      <div className="relative">
        {event.banner && (
          <div
            className="h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${event.banner})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          </div>
        )}
        <div className="absolute top-6 left-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/events")}
            data-testid="button-back"
            className="bg-white/90 backdrop-blur hover-elevate"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 relative pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-8 elevated-card">
              <h1 className="fui-r-size-6 fui-r-weight-bold" style={{ color: 'var(--gray-12)' }}>
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" style={{ color: 'var(--accent-9)' }} />
                  <span className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
                    {new Date(event.date).toLocaleString()}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" style={{ color: 'var(--accent-9)' }} />
                    <span className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
                      {event.location}
                    </span>
                  </div>
                )}
                {event.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" style={{ color: 'var(--accent-9)' }} />
                    <span className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
                      {event.capacity} max attendees
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-3" style={{ color: 'var(--gray-12)' }}>
                  About This Event
                </h2>
                <p className="fui-r-size-3 leading-relaxed" style={{ color: 'var(--gray-11)' }}>
                  {event.description}
                </p>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 elevated-card sticky top-6">
              {event.requiresPayment && (
                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-a3)' }}>
                  <p className="fui-r-size-1 fui-r-weight-medium" style={{ color: 'var(--accent-9)' }}>
                    Ticket Price
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <DollarSign className="h-6 w-6" style={{ color: 'var(--accent-9)' }} />
                    <span className="fui-r-size-6 fui-r-weight-bold" style={{ color: 'var(--accent-9)' }}>
                      {((event.price || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {!isPastEvent ? (
                <form onSubmit={handleSubmit((data) => rsvpMutation.mutate(data))} className="space-y-4">
                  <div>
                    <Label htmlFor="attendeeName" className="fui-r-size-2">Your Name</Label>
                    <Input
                      id="attendeeName"
                      {...register("attendeeName")}
                      placeholder="John Doe"
                      data-testid="input-attendee-name"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendeeEmail" className="fui-r-size-2">Your Email</Label>
                    <Input
                      id="attendeeEmail"
                      type="email"
                      {...register("attendeeEmail")}
                      placeholder="you@example.com"
                      data-testid="input-attendee-email"
                      className="mt-1.5"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={rsvpMutation.isPending}
                    data-testid="button-rsvp"
                  >
                    {rsvpMutation.isPending ? "Processing..." : event.requiresPayment ? "Purchase Ticket" : "RSVP"}
                  </Button>
                  {!event.requiresPayment && (
                    <p className="fui-r-size-1 text-center" style={{ color: 'var(--gray-11)' }}>
                      Free event - No payment required
                    </p>
                  )}
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                    This event has already passed
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
