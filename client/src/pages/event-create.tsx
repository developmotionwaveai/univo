import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().optional(),
  capacity: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  requiresPayment: z.boolean(),
  banner: z.string().optional(),
});

type EventForm = z.infer<typeof eventSchema>;

export default function EventCreate() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      requiresPayment: false,
      price: 0,
    },
  });

  const requiresPayment = watch("requiresPayment");

  const createEventMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      const response = await apiRequest("POST", "/api/events", {
        ...data,
        price: data.requiresPayment ? Math.round((data.price || 0) * 100) : 0,
        createdBy: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event created successfully" });
      setLocation("/events");
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const onSubmit = (data: EventForm) => {
    createEventMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
          Create Event
        </h1>
        <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
          Create a new club event with ticket sales
        </p>
      </div>

      <Card className="p-6 elevated-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title" className="fui-r-size-2">Event Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Annual Tech Symposium"
              data-testid="input-event-title"
              className="mt-1.5"
            />
            {errors.title && <p className="text-destructive fui-r-size-1 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="fui-r-size-2">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your event..."
              rows={4}
              data-testid="input-event-description"
              className="mt-1.5"
            />
            {errors.description && <p className="text-destructive fui-r-size-1 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="date" className="fui-r-size-2">Event Date</Label>
              <Input
                id="date"
                type="datetime-local"
                {...register("date")}
                data-testid="input-event-date"
                className="mt-1.5"
              />
              {errors.date && <p className="text-destructive fui-r-size-1 mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <Label htmlFor="location" className="fui-r-size-2">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Student Center, Room 101"
                data-testid="input-event-location"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="capacity" className="fui-r-size-2">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                placeholder="100"
                data-testid="input-event-capacity"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="banner" className="fui-r-size-2">Banner Image URL</Label>
              <Input
                id="banner"
                {...register("banner")}
                placeholder="https://example.com/image.jpg"
                data-testid="input-event-banner"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="border-t pt-6" style={{ borderColor: 'var(--stroke)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="fui-r-size-2 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                  Requires Payment
                </p>
                <p className="fui-r-size-1 mt-1" style={{ color: 'var(--gray-11)' }}>
                  Enable ticket sales for this event
                </p>
              </div>
              <Switch
                checked={requiresPayment}
                onCheckedChange={(checked) => setValue("requiresPayment", checked)}
                data-testid="switch-requires-payment"
              />
            </div>

            {requiresPayment && (
              <div>
                <Label htmlFor="price" className="fui-r-size-2">Ticket Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="25.00"
                  data-testid="input-event-price"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/events")}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              className="flex-1"
              data-testid="button-create"
            >
              {createEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
