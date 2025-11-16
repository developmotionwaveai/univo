import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Trash2, Shield, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  role: 'member' | 'officer' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export default function ManageMembers() {
  const [, params] = useRoute('/club/:id/manage-members');
  const clubId = params?.id;
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/members`);
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json() as Promise<ClubMember[]>;
    },
    enabled: !!clubId,
  });

  const filteredMembers = members?.filter(m =>
    m.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/club-members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      toast({
        title: 'Success',
        description: 'Member role updated',
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const res = await fetch(`/api/club-members/${memberId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to remove member');

      toast({
        title: 'Success',
        description: 'Member removed from club',
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
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
    return <div className="p-4">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Members</h1>
        <p className="text-gray-600">Control roles and manage club membership</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Club Members</CardTitle>
          <CardDescription>
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} total
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No members found
              </div>
            ) : (
              filteredMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {member.user?.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.firstName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={member.role} onValueChange={(value) => handleRoleChange(member.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <User className="h-4 w-4 inline mr-2" />
                          Member
                        </SelectItem>
                        <SelectItem value="officer">
                          <Shield className="h-4 w-4 inline mr-2" />
                          Officer
                        </SelectItem>
                        <SelectItem value="admin">
                          <Shield className="h-4 w-4 inline mr-2" />
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
