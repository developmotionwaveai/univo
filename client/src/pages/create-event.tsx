import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, DollarSign } from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  ticketPrice: z.string().optional(),
});

type EventForm = z.infer<typeof eventSchema>;

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/club/:id/create-event");
  const clubId = params?.id;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventForm) => {
    if (!clubId) return;

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/events", {
        clubId,
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
        location: data.location,
        ticketPrice: data.ticketPrice ? parseFloat(data.ticketPrice) : 0,
      });

      toast({
        title: "Success!",
        description: "Event created successfully",
      });

      setLocation(`/club/${clubId}/dashboard`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
          Create Event
        </h1>
        <p style={{ color: "var(--gray-11)" }} className="mt-2">
          Set up a new event for your club members
        </p>
      </div>

      <Card className="p-6" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" style={{ color: "var(--gray-12)" }}>
              Event Title
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Spring Networking Mixer"
              className="mt-1.5"
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" style={{ color: "var(--gray-12)" }}>
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your event..."
              className="mt-1.5 min-h-32"
            />
            {errors.description && (
              <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" style={{ color: "var(--gray-12)" }}>
                <Calendar className="h-4 w-4 inline mr-2" />
                Date & Time
              </Label>
              <Input
                id="date"
                type="datetime-local"
                {...register("date")}
                className="mt-1.5"
              />
              {errors.date && (
                <p className="text-destructive text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location" style={{ color: "var(--gray-12)" }}>
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Student Union Room 202"
                className="mt-1.5"
              />
              {errors.location && (
                <p className="text-destructive text-sm mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="ticketPrice" style={{ color: "var(--gray-12)" }}>
              <DollarSign className="h-4 w-4 inline mr-2" />
              Ticket Price (optional)
            </Label>
            <Input
              id="ticketPrice"
              type="number"
              step="0.01"
              {...register("ticketPrice")}
              placeholder="0.00"
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/club/${clubId}/dashboard`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
