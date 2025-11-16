import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Member } from "@shared/schema";
import { useForm } from "react-hook-form";

export default function Members() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { register, handleSubmit, reset } = useForm();

  const addMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/members", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Member added successfully" });
      setIsAddDialogOpen(false);
      reset();
    },
    onError: () => {
      toast({ title: "Failed to add member", variant: "destructive" });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/members/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Member updated successfully" });
    },
  });

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesStatus = !statusFilter || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-[var(--danger-9)] text-white";
      case "officer": return "bg-[var(--accent-9)] text-white";
      default: return "bg-[var(--gray-a3)] text-[var(--gray-12)]";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-[var(--success-a3)] text-[var(--success-9)]";
      case "inactive": return "bg-[var(--gray-a3)] text-[var(--gray-11)]";
      case "pending": return "bg-[var(--warning-a3)] text-[var(--warning-a11)]";
      default: return "bg-[var(--gray-a3)] text-[var(--gray-11)]";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
            Members
          </h1>
          <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
            Manage your club members
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-member">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit((data) => addMemberMutation.mutate(data))} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} placeholder="Member name" data-testid="input-member-name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="email@example.com" data-testid="input-member-email" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select id="role" {...register("role")} className="w-full p-2 border rounded-lg" data-testid="select-member-role">
                  <option value="member">Member</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit-member">
                Add Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 elevated-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--gray-11)' }} />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-members"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={roleFilter === null ? "default" : "outline"}
              onClick={() => setRoleFilter(null)}
              data-testid="button-filter-all"
            >
              All
            </Button>
            <Button
              variant={roleFilter === "admin" ? "default" : "outline"}
              onClick={() => setRoleFilter("admin")}
              data-testid="button-filter-admin"
            >
              Admin
            </Button>
            <Button
              variant={roleFilter === "officer" ? "default" : "outline"}
              onClick={() => setRoleFilter("officer")}
              data-testid="button-filter-officer"
            >
              Officer
            </Button>
            <Button
              variant={roleFilter === "member" ? "default" : "outline"}
              onClick={() => setRoleFilter("member")}
              data-testid="button-filter-member"
            >
              Member
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="fui-r-size-2 fui-r-weight-medium">Member</TableHead>
                <TableHead className="fui-r-size-2 fui-r-weight-medium">Role</TableHead>
                <TableHead className="fui-r-size-2 fui-r-weight-medium">Status</TableHead>
                <TableHead className="fui-r-size-2 fui-r-weight-medium">Joined</TableHead>
                <TableHead className="fui-r-size-2 fui-r-weight-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="fui-r-size-2 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                          {member.name}
                        </p>
                        <p className="fui-r-size-1" style={{ color: 'var(--gray-11)' }}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-actions-${member.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => updateMemberMutation.mutate({
                            id: member.id,
                            data: { status: member.status === "active" ? "inactive" : "active" }
                          })}
                        >
                          {member.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
