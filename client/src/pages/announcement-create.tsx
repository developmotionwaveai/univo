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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  targetGroup: z.string(),
});

type AnnouncementForm = z.infer<typeof announcementSchema>;

export default function AnnouncementCreate() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementForm>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      targetGroup: "all",
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: AnnouncementForm) => {
      const response = await apiRequest("POST", "/api/announcements", {
        ...data,
        createdBy: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Announcement sent successfully" });
      setLocation("/announcements");
    },
    onError: () => {
      toast({ title: "Failed to send announcement", variant: "destructive" });
    },
  });

  const onSubmit = (data: AnnouncementForm) => {
    createAnnouncementMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
          Create Announcement
        </h1>
        <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
          Send an announcement to club members
        </p>
      </div>

      <Card className="p-6 elevated-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title" className="fui-r-size-2">Announcement Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Important Club Update"
              data-testid="input-announcement-title"
              className="mt-1.5"
            />
            {errors.title && <p className="text-destructive fui-r-size-1 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="content" className="fui-r-size-2">Message</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Write your announcement message..."
              rows={8}
              data-testid="input-announcement-content"
              className="mt-1.5"
            />
            {errors.content && <p className="text-destructive fui-r-size-1 mt-1">{errors.content.message}</p>}
          </div>

          <div>
            <Label htmlFor="targetGroup" className="fui-r-size-2">Send To</Label>
            <select
              id="targetGroup"
              {...register("targetGroup")}
              className="w-full p-2 border rounded-lg mt-1.5"
              data-testid="select-target-group"
            >
              <option value="all">All Members</option>
              <option value="members">Members Only</option>
              <option value="officers">Officers Only</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/announcements")}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAnnouncementMutation.isPending}
              className="flex-1"
              data-testid="button-send"
            >
              {createAnnouncementMutation.isPending ? "Sending..." : "Send Announcement"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
