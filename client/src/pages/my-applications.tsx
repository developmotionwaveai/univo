import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2,
  ExternalLink 
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

interface Club {
  id: string;
  name: string;
  description: string;
  category?: string;
}

interface Application {
  id: string;
  clubId: string;
  userId: string;
  coverLetter: string;
  status: "pending" | "accepted" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  club?: Club;
}

export default function MyApplications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: applications, isLoading: appLoading } = useQuery<Application[]>({
    queryKey: ["/api/user/applications"],
    enabled: !!user,
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await fetch(`/api/club-applications/${appId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete application");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/applications"] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 border-green-200";
      case "rejected":
        return "bg-red-50 border-red-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-2)' }}>
        <Card className="p-8 text-center">
          <p style={{ color: 'var(--gray-11)' }} className="mb-4">Please log in to view your applications</p>
          <Link href="/login">
            <a><Button>Go to Login</Button></a>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-2)' }}>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8" style={{ color: 'var(--accent-9)' }} />
              <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                My Applications
              </h1>
            </div>
            <p className="fui-r-size-3" style={{ color: 'var(--gray-11)' }}>
              Track your club membership applications and their status
            </p>
          </div>

          {/* Empty State */}
          {!appLoading && !applications?.length && (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--gray-3)' }}>
                <FileText className="h-8 w-8" style={{ color: 'var(--gray-8)' }} />
              </div>
              <h3 className="fui-r-size-4 fui-r-weight-semi-bold mb-2" style={{ color: 'var(--gray-12)' }}>
                No Applications Yet
              </h3>
              <p className="fui-r-size-3 mb-4" style={{ color: 'var(--gray-10)' }}>
                Start exploring clubs and submit applications to join
              </p>
              <Link href="/discover">
                <a><Button>Discover Clubs</Button></a>
              </Link>
            </Card>
          )}

          {/* Applications List */}
          {appLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {applications?.map(app => {
                return (
                  <Card
                    key={app.id}
                    className={`p-6 border-2 transition-all hover:shadow-lg ${getStatusColor(app.status)}`}
                  >
                    <div className="flex gap-4">
                      {/* Application Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="fui-r-size-4 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
                              {app.club?.name || "Unknown Club"}
                            </h3>
                            <p className="fui-r-size-2" style={{ color: 'var(--gray-10)' }}>
                              {app.club?.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(app.status)}
                            {getStatusBadge(app.status)}
                          </div>
                        </div>

                        {/* Cover Letter Preview */}
                        {app.coverLetter && (
                          <p className="fui-r-size-2 mb-3" style={{ color: 'var(--gray-11)' }}>
                            {app.coverLetter.substring(0, 100)}
                            {app.coverLetter.length > 100 ? "..." : ""}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 fui-r-size-1" style={{ color: 'var(--gray-9)' }}>
                          <span>Submitted {formatDate(app.submittedAt)}</span>
                          {app.reviewedAt && (
                            <span>Reviewed {formatDate(app.reviewedAt)}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/club/${app.clubId}`}>
                          <a>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </Link>
                        {app.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteApplicationMutation.mutate(app.id)}
                            disabled={deleteApplicationMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
