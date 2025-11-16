import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Plus, Trash2, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const duesSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  amount: z.coerce.number().positive('Amount must be positive'),
  dueDate: z.string().datetime().optional(),
});

type DuesFormData = z.infer<typeof duesSchema>;

interface ClubDues {
  id: string;
  clubId: string;
  name: string;
  amount: number;
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
}

interface DuesPayment {
  id: string;
  duesId: string;
  userId: string;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paidAt?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ManageDues() {
  const [, params] = useRoute('/club/:id/manage-dues');
  const clubId = params?.id;
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<DuesFormData>({
    resolver: zodResolver(duesSchema),
    defaultValues: {
      name: '',
      amount: 0,
    },
  });

  const { data: dues, isLoading: duesLoading, refetch: refetchDues } = useQuery({
    queryKey: ['club-dues', clubId],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/dues`);
      if (!res.ok) throw new Error('Failed to fetch dues');
      return res.json() as Promise<ClubDues[]>;
    },
    enabled: !!clubId,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['dues-payments', clubId],
    queryFn: async () => {
      // This would need to be implemented in the backend
      return [] as DuesPayment[];
    },
    enabled: !!clubId,
  });

  const onSubmit = async (data: DuesFormData) => {
    if (!clubId) return;

    try {
      const res = await fetch(`/api/clubs/${clubId}/dues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: Math.round(data.amount * 100), // Convert to cents
        }),
      });

      if (!res.ok) throw new Error('Failed to create dues');

      toast({
        title: 'Success',
        description: 'Dues created successfully',
      });

      form.reset();
      setShowForm(false);
      refetchDues();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create dues',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (duesId: string) => {
    if (!confirm('Are you sure you want to deactivate these dues?')) return;

    try {
      const res = await fetch(`/api/clubs/${clubId}/dues/${duesId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });

      if (!res.ok) throw new Error('Failed to update dues');

      toast({
        title: 'Success',
        description: 'Dues deactivated',
      });

      refetchDues();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update dues',
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

  if (duesLoading) {
    return <div className="p-4">Loading dues...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Club Dues</h1>
        <p className="text-gray-600">Set up and track membership dues</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Dues</CardTitle>
          <CardDescription>
            {dues?.filter(d => d.isActive).length || 0} active dues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dues?.filter(d => d.isActive).map(due => (
            <div key={due.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {due.name}
                </p>
                <p className="text-sm text-gray-600">
                  ${(due.amount / 100).toFixed(2)}
                </p>
                {due.dueDate && (
                  <p className="text-xs text-gray-500">
                    Due: {new Date(due.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeactivate(due.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {dues?.filter(d => d.isActive).length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No active dues. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {(dues?.filter(d => !d.isActive).length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Dues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dues?.filter(d => !d.isActive).map(due => (
              <div key={due.id} className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                <div>
                  <p className="font-medium text-gray-600">{due.name}</p>
                  <p className="text-sm text-gray-500">
                    ${(due.amount / 100).toFixed(2)}
                  </p>
                </div>
                <Badge variant="outline">Inactive</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dues Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fall 2024 Dues" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="25.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>When members should pay by</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dues
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Dues
        </Button>
      )}
    </div>
  );
}
