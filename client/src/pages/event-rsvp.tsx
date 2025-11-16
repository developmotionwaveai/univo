import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Calendar, MapPin, Users, DollarSign, CheckCircle, Clock } from "lucide-react";

interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  ticketPrice?: number;
  maxAttendees?: number;
  club?: {
    id: string;
    name: string;
  };
}

interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  ticketQuantity: number;
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: string;
}

export default function EventRSVP() {
  const [, params] = useRoute("/events/:id/rsvp");
  const eventId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ticketQuantity, setTicketQuantity] = useState(1);

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  const { data: existingRSVP } = useQuery<RSVP | null>({
    queryKey: [`/api/events/${eventId}/my-rsvp`],
    queryFn: async () => {
      const res = await fetch(`/api/rsvps/event/${eventId}/user/${user?.id}`, {
        credentials: "include",
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch RSVP");
      return res.json();
    },
    enabled: !!eventId && !!user,
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      const totalAmount = (event?.ticketPrice || 0) * ticketQuantity;

      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventId,
          userId: user?.id,
          ticketQuantity,
          totalAmount,
          paymentStatus: totalAmount > 0 ? "pending" : "completed",
        }),
      });

      if (!res.ok) throw new Error("Failed to create RSVP");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your RSVP has been confirmed",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/my-rsvp`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to RSVP",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg" style={{ color: "var(--gray-11)" }}>
          Loading event...
        </div>
      </div>
    );
  }

  const totalCost = (event.ticketPrice || 0) * ticketQuantity;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href={`/events/${eventId}`}>
        <a className="text-sm mb-4 inline-block" style={{ color: "var(--accent-9)" }}>
          ← Back to Event
        </a>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
          {event.title}
        </h1>
        <p style={{ color: "var(--gray-11)" }} className="mt-2">
          {event.club?.name}
        </p>
      </div>

      <div className="grid gap-4 mb-6">
        <Card className="p-4" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5" style={{ color: "var(--accent-9)" }} />
            <span style={{ color: "var(--gray-12)" }}>
              {new Date(event.date).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5" style={{ color: "var(--accent-9)" }} />
            <span style={{ color: "var(--gray-12)" }}>{event.location}</span>
          </div>
        </Card>
      </div>

      {existingRSVP ? (
        <Card className="p-6" style={{ backgroundColor: "var(--success-3)", borderColor: "var(--success-6)" }}>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6" style={{ color: "var(--success-9)" }} />
            <h2 className="text-xl font-bold" style={{ color: "var(--success-11)" }}>
              You're Registered!
            </h2>
          </div>
          <p style={{ color: "var(--success-11)" }}>
            Tickets: {existingRSVP.ticketQuantity}
          </p>
          {existingRSVP.totalAmount > 0 && (
            <p style={{ color: "var(--success-11)" }}>
              Total: ${existingRSVP.totalAmount.toFixed(2)} - {existingRSVP.paymentStatus}
            </p>
          )}
        </Card>
      ) : (
        <Card className="p-6" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--gray-12)" }}>
            Register for Event
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity" style={{ color: "var(--gray-12)" }}>
                <Users className="h-4 w-4 inline mr-2" />
                Number of Tickets
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(parseInt(e.target.value) || 1)}
                className="mt-1.5"
              />
            </div>

            {event.ticketPrice && event.ticketPrice > 0 ? (
              <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--accent-3)" }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--gray-12)" }}>Price per ticket:</span>
                  <span style={{ color: "var(--gray-12)" }} className="font-bold">
                    ${event.ticketPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-lg">
                  <span style={{ color: "var(--gray-12)" }} className="font-bold">
                    <DollarSign className="h-5 w-5 inline" />
                    Total:
                  </span>
                  <span style={{ color: "var(--accent-11)" }} className="font-bold">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--success-3)" }}>
                <p style={{ color: "var(--success-11)" }} className="font-bold">
                  Free Event
                </p>
              </div>
            )}

            <Button
              onClick={() => rsvpMutation.mutate()}
              disabled={rsvpMutation.isPending}
              className="w-full"
            >
              {rsvpMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {totalCost > 0 ? "Proceed to Payment" : "Confirm RSVP"}
                </>
              )}
            </Button>

            {totalCost > 0 && (
              <p className="text-xs text-center" style={{ color: "var(--gray-10)" }}>
                You'll be redirected to payment after confirming
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
