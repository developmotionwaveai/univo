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

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  goalAmount: z.number().min(1, "Goal amount is required"),
  deadline: z.string().optional(),
  image: z.string().optional(),
});

type CampaignForm = z.infer<typeof campaignSchema>;

export default function CampaignCreate() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignForm) => {
      const response = await apiRequest("POST", "/api/campaigns", {
        ...data,
        goalAmount: Math.round(data.goalAmount * 100),
        createdBy: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({ title: "Campaign created successfully" });
      setLocation("/campaigns");
    },
    onError: () => {
      toast({ title: "Failed to create campaign", variant: "destructive" });
    },
  });

  const onSubmit = (data: CampaignForm) => {
    createCampaignMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
          Create Fundraising Campaign
        </h1>
        <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
          Launch a new fundraising campaign for your club
        </p>
      </div>

      <Card className="p-6 elevated-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title" className="fui-r-size-2">Campaign Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Annual Fundraiser 2024"
              data-testid="input-campaign-title"
              className="mt-1.5"
            />
            {errors.title && <p className="text-destructive fui-r-size-1 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="fui-r-size-2">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your campaign and how the funds will be used..."
              rows={6}
              data-testid="input-campaign-description"
              className="mt-1.5"
            />
            {errors.description && <p className="text-destructive fui-r-size-1 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="goalAmount" className="fui-r-size-2">Fundraising Goal ($)</Label>
              <Input
                id="goalAmount"
                type="number"
                step="0.01"
                {...register("goalAmount", { valueAsNumber: true })}
                placeholder="5000.00"
                data-testid="input-campaign-goal"
                className="mt-1.5"
              />
              {errors.goalAmount && <p className="text-destructive fui-r-size-1 mt-1">{errors.goalAmount.message}</p>}
            </div>

            <div>
              <Label htmlFor="deadline" className="fui-r-size-2">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                {...register("deadline")}
                data-testid="input-campaign-deadline"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image" className="fui-r-size-2">Campaign Image URL</Label>
            <Input
              id="image"
              {...register("image")}
              placeholder="https://example.com/campaign-image.jpg"
              data-testid="input-campaign-image"
              className="mt-1.5"
            />
            <p className="fui-r-size-1 mt-1.5" style={{ color: 'var(--gray-11)' }}>
              Recommended size: 1200×400px
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/campaigns")}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCampaignMutation.isPending}
              className="flex-1"
              data-testid="button-create"
            >
              {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
