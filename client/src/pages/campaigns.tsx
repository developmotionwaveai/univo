import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Plus, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import { Campaign } from "@shared/schema";

export default function Campaigns() {
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const activeCampaigns = campaigns.filter(c => c.isActive);
  const pastCampaigns = campaigns.filter(c => !c.isActive);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
            Fundraising Campaigns
          </h1>
          <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
            Create and manage fundraising campaigns for your club
          </p>
        </div>
        <Link href="/campaigns/create">
          <a data-testid="button-create-campaign">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </a>
        </Link>
      </div>

      <div>
        <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
          Active Campaigns
        </h2>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-6 elevated-card animate-pulse">
                <div className="h-48 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : activeCampaigns.length === 0 ? (
          <Card className="p-12 elevated-card text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gray-11)' }} />
            <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
              No active campaigns
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activeCampaigns.map((campaign) => {
              const progress = ((campaign.currentAmount || 0) / campaign.goalAmount) * 100;
              const daysLeft = campaign.deadline
                ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <a data-testid={`card-campaign-${campaign.id}`}>
                    <Card className="overflow-hidden elevated-card hover-elevate active-elevate-2 transition-all cursor-pointer">
                      {campaign.image && (
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{ backgroundImage: `url(${campaign.image})` }}
                        />
                      )}
                      <div className="p-6">
                        <h3 className="fui-r-size-4 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                          {campaign.title}
                        </h3>
                        <p className="fui-r-size-2 mt-2 line-clamp-2" style={{ color: 'var(--gray-11)' }}>
                          {campaign.description}
                        </p>

                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="fui-r-size-2 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                              ${((campaign.currentAmount || 0) / 100).toFixed(2)} raised
                            </span>
                            <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                              of ${(campaign.goalAmount / 100).toFixed(2)}
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          <p className="fui-r-size-1 mt-2" style={{ color: 'var(--gray-11)' }}>
                            {progress.toFixed(0)}% funded
                            {daysLeft !== null && ` • ${daysLeft} days left`}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--stroke)' }}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" style={{ color: 'var(--gray-11)' }} />
                            <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                              Donors
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {pastCampaigns.length > 0 && (
        <div>
          <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
            Past Campaigns
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pastCampaigns.map((campaign) => {
              const progress = ((campaign.currentAmount || 0) / campaign.goalAmount) * 100;

              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <a data-testid={`card-past-campaign-${campaign.id}`}>
                    <Card className="overflow-hidden elevated-card opacity-75 hover-elevate transition-all cursor-pointer">
                      {campaign.image && (
                        <div
                          className="h-48 bg-cover bg-center grayscale"
                          style={{ backgroundImage: `url(${campaign.image})` }}
                        />
                      )}
                      <div className="p-6">
                        <h3 className="fui-r-size-4 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                          {campaign.title}
                        </h3>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="fui-r-size-2 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                              ${((campaign.currentAmount || 0) / 100).toFixed(2)} raised
                            </span>
                            <span className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                              of ${(campaign.goalAmount / 100).toFixed(2)}
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          <p className="fui-r-size-1 mt-2" style={{ color: 'var(--gray-11)' }}>
                            {progress.toFixed(0)}% funded
                          </p>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
