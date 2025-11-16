import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Application } from "@shared/schema";
import { FileText, CheckCircle, XCircle } from "lucide-react";

export default function Applications() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const { toast } = useToast();

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/applications/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Application reviewed successfully" });
      setSelectedApplication(null);
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-[var(--success-a3)] text-[var(--success-9)]";
      case "rejected": return "bg-[var(--danger-9)] text-white";
      default: return "bg-[var(--warning-a3)] text-[var(--warning-a11)]";
    }
  };

  const pendingCount = applications.filter(app => app.status === "pending").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
          Applications
        </h1>
        <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
          Review and manage membership applications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 elevated-card">
          <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>Pending Review</p>
          <p className="fui-r-size-5 fui-r-weight-semi-bold mt-2" style={{ color: 'var(--warning-a11)' }}>
            {pendingCount}
          </p>
        </Card>
        <Card className="p-4 elevated-card">
          <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>Accepted</p>
          <p className="fui-r-size-5 fui-r-weight-semi-bold mt-2" style={{ color: 'var(--success-9)' }}>
            {applications.filter(app => app.status === "accepted").length}
          </p>
        </Card>
        <Card className="p-4 elevated-card">
          <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>Rejected</p>
          <p className="fui-r-size-5 fui-r-weight-semi-bold mt-2" style={{ color: 'var(--danger-9)' }}>
            {applications.filter(app => app.status === "rejected").length}
          </p>
        </Card>
      </div>

      <Card className="p-6 elevated-card">
        <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
          All Applications
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gray-11)' }} />
            <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
              No applications yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border hover-elevate cursor-pointer transition-all"
                style={{ borderColor: 'var(--stroke)' }}
                onClick={() => setSelectedApplication(app)}
                data-testid={`card-application-${app.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="fui-r-size-3 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                        {app.applicantName}
                      </p>
                      <Badge className={getStatusBadgeColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                    <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
                      {app.applicantEmail}
                    </p>
                    <p className="fui-r-size-1 mt-2" style={{ color: 'var(--gray-11)' }}>
                      Submitted {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-view-${app.id}`}>
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Review</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <p className="fui-r-size-2 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                  Applicant Information
                </p>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="fui-r-size-1" style={{ color: 'var(--gray-11)' }}>Name</p>
                    <p className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>{selectedApplication.applicantName}</p>
                  </div>
                  <div>
                    <p className="fui-r-size-1" style={{ color: 'var(--gray-11)' }}>Email</p>
                    <p className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>{selectedApplication.applicantEmail}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="fui-r-size-2 fui-r-weight-medium mb-2" style={{ color: 'var(--gray-12)' }}>
                  Responses
                </p>
                <div className="space-y-3">
                  {Object.entries(selectedApplication.responses).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-a2)' }}>
                      <p className="fui-r-size-1 fui-r-weight-medium" style={{ color: 'var(--gray-11)' }}>{key}</p>
                      <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-12)' }}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApplication.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => reviewMutation.mutate({ id: selectedApplication.id, status: "accepted" })}
                    data-testid="button-accept"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => reviewMutation.mutate({ id: selectedApplication.id, status: "rejected" })}
                    data-testid="button-reject"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
