import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ClubApplication {
  id: string;
  clubId: string;
  userId: string;
  coverLetter?: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ManageApplications() {
  const [, params] = useRoute('/club/:id/manage-applications');
  const clubId = params?.id;
  const { toast } = useToast();

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['club-applications', clubId],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/applications`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json() as Promise<ClubApplication[]>;
    },
    enabled: !!clubId,
  });

  const pendingApps = applications?.filter(a => a.status === 'pending') || [];
  const acceptedApps = applications?.filter(a => a.status === 'accepted') || [];
  const rejectedApps = applications?.filter(a => a.status === 'rejected') || [];

  const handleApplicationReview = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/club-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to review application');

      toast({
        title: 'Success',
        description: `Application ${status === 'accepted' ? 'accepted' : 'rejected'}`,
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to review application',
        variant: 'destructive',
      });
    }
  };

  if (!clubId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Club ID not found</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading applications...</div>;
  }

  const ApplicationCard = ({ app, actions = false }: { app: ClubApplication; actions?: boolean }) => (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">
            {app.user?.firstName} {app.user?.lastName}
          </p>
          <p className="text-sm text-gray-600">{app.user?.email}</p>
        </div>
        <Badge
          variant={
            app.status === 'pending'
              ? 'secondary'
              : app.status === 'accepted'
              ? 'default'
              : 'destructive'
          }
        >
          {app.status}
        </Badge>
      </div>

      {app.coverLetter && (
        <div>
          <p className="text-sm font-medium mb-1">Cover Letter:</p>
          <p className="text-sm text-gray-600">{app.coverLetter}</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Applied on {new Date(app.submittedAt).toLocaleDateString()}
      </p>

      {actions && app.status === 'pending' && (
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => handleApplicationReview(app.id, 'accepted')}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleApplicationReview(app.id, 'rejected')}
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Applications</h1>
        <p className="text-gray-600">Review and approve club membership applications</p>
      </div>

      {pendingApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending Applications ({pendingApps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApps.map(app => (
              <ApplicationCard key={app.id} app={app} actions={true} />
            ))}
          </CardContent>
        </Card>
      )}

      {acceptedApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Accepted ({acceptedApps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {acceptedApps.map(app => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </CardContent>
        </Card>
      )}

      {rejectedApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Rejected ({rejectedApps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rejectedApps.map(app => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </CardContent>
        </Card>
      )}

      {applications?.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No applications yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}
