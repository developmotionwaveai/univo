import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Heart, ArrowLeft, Users } from "lucide-react";
import { Campaign, Donation } from "@shared/schema";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CampaignDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", id],
    enabled: !!id,
  });

  const { data: donations = [] } = useQuery<Donation[]>({
    queryKey: ["/api/donations", id],
    enabled: !!id,
  });

  const { register, handleSubmit, reset, watch } = useForm();
  const customAmount = watch("customAmount");

  const donateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/donations", {
        ...data,
        campaignId: id,
        amount: Math.round(parseFloat(data.amount) * 100),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/donations", id] });
      toast({ title: "Thank you for your donation!" });
      reset();
    },
    onError: () => {
      toast({ title: "Donation failed", variant: "destructive" });
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

  if (!campaign) {
    return (
      <div className="p-6">
        <Card className="p-12 elevated-card text-center">
          <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>Campaign not found</p>
        </Card>
      </div>
    );
  }

  const progress = ((campaign.currentAmount || 0) / campaign.goalAmount) * 100;
  const daysLeft = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const visibleDonations = donations.filter(d => !d.isAnonymous);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-2)' }}>
      <div className="relative">
        {campaign.image && (
          <div
            className="h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${campaign.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          </div>
        )}
        <div className="absolute top-6 left-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/campaigns")}
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
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 elevated-card">
              <h1 className="fui-r-size-6 fui-r-weight-bold" style={{ color: 'var(--gray-12)' }}>
                {campaign.title}
              </h1>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="fui-r-size-4 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                    ${((campaign.currentAmount || 0) / 100).toFixed(2)}
                  </span>
                  <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                    raised of ${(campaign.goalAmount / 100).toFixed(2)}
                  </span>
                </div>
                <Progress value={progress} className="h-4" />
                <div className="flex items-center justify-between mt-2">
                  <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                    {progress.toFixed(0)}% funded
                  </span>
                  {daysLeft !== null && (
                    <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                      {daysLeft} days left
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-3" style={{ color: 'var(--gray-12)' }}>
                  About This Campaign
                </h2>
                <p className="fui-r-size-3 leading-relaxed whitespace-pre-line" style={{ color: 'var(--gray-11)' }}>
                  {campaign.description}
                </p>
              </div>
            </Card>

            {visibleDonations.length > 0 && (
              <Card className="p-8 elevated-card">
                <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
                  Donor Wall
                </h2>
                <div className="space-y-3">
                  {visibleDonations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--gray-a2)' }}
                      data-testid={`donor-${donation.id}`}
                    >
                      <Avatar>
                        <AvatarFallback>{donation.donorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="fui-r-size-2 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                            {donation.donorName}
                          </p>
                          <span className="fui-r-size-2 fui-r-weight-semi-bold" style={{ color: 'var(--success-9)' }}>
                            ${(donation.amount / 100).toFixed(2)}
                          </span>
                        </div>
                        {donation.message && (
                          <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
                            {donation.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div>
            <Card className="p-6 elevated-card sticky top-6">
              <h3 className="fui-r-size-3 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
                Make a Donation
              </h3>

              <form onSubmit={handleSubmit((data) => donateMutation.mutate(data))} className="space-y-4">
                <div>
                  <Label className="fui-r-size-2 mb-3 block">Select Amount</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById("amount") as HTMLInputElement;
                          if (input) input.value = amount.toString();
                        }}
                        className="hover-elevate"
                        data-testid={`button-preset-${amount}`}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount" className="fui-r-size-2">Custom Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...register("amount")}
                    placeholder="25.00"
                    data-testid="input-donation-amount"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="donorName" className="fui-r-size-2">Your Name</Label>
                  <Input
                    id="donorName"
                    {...register("donorName")}
                    placeholder="John Doe"
                    data-testid="input-donor-name"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="donorEmail" className="fui-r-size-2">Your Email</Label>
                  <Input
                    id="donorEmail"
                    type="email"
                    {...register("donorEmail")}
                    placeholder="you@example.com"
                    data-testid="input-donor-email"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="fui-r-size-2">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Leave a message..."
                    rows={3}
                    data-testid="input-donor-message"
                    className="mt-1.5"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={donateMutation.isPending}
                  data-testid="button-donate"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {donateMutation.isPending ? "Processing..." : "Donate Now"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
