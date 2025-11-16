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
import { MessageSquare, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  targetGroup: z.enum(["all", "members", "officers"]),
});

type AnnouncementForm = z.infer<typeof announcementSchema>;

export default function CreateAnnouncement() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/club/:id/create-announcement");
  const clubId = params?.id;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [targetGroup, setTargetGroup] = useState<string>("all");

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

  const onSubmit = async (data: AnnouncementForm) => {
    if (!clubId) return;

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/announcements", {
        clubId,
        title: data.title,
        content: data.content,
        targetGroup: targetGroup,
      });

      toast({
        title: "Success!",
        description: "Announcement posted successfully",
      });

      setLocation(`/club/${clubId}/dashboard`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
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
          Create Announcement
        </h1>
        <p style={{ color: "var(--gray-11)" }} className="mt-2">
          Share important updates with your club members
        </p>
      </div>

      <Card className="p-6" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" style={{ color: "var(--gray-12)" }}>
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Announcement Title
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Important Club Update"
              className="mt-1.5"
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content" style={{ color: "var(--gray-12)" }}>
              Message
            </Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Write your announcement here..."
              className="mt-1.5 min-h-48"
            />
            {errors.content && (
              <p className="text-destructive text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="targetGroup" style={{ color: "var(--gray-12)" }}>
              <Users className="h-4 w-4 inline mr-2" />
              Send To
            </Label>
            <Select value={targetGroup} onValueChange={setTargetGroup}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="members">Members Only</SelectItem>
                <SelectItem value="officers">Officers Only</SelectItem>
              </SelectContent>
            </Select>
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
              {isLoading ? "Posting..." : "Post Announcement"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
