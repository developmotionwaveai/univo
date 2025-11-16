import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, User, Mail, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileRequest>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      alert("Profile updated successfully!");
    },
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    setLocation("/login");
  };

  const onSubmit = (data: UpdateProfileRequest) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="fui-r-size-6 fui-r-weight-semi-bold mb-2" style={{ color: 'var(--gray-12)' }}>
            Profile Settings
          </h1>
          <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="elevated-card mb-6">
          <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-6" style={{ color: 'var(--gray-12)' }}>
            Account Information
          </h2>

          {/* Read-only fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="fui-r-size-2 fui-r-weight-medium block mb-2" style={{ color: 'var(--gray-11)' }}>
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-a2)' }}>
                <p className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
                  {user?.username}
                </p>
              </div>
              <p className="fui-r-size-1 mt-1" style={{ color: 'var(--gray-10)' }}>
                Cannot be changed
              </p>
            </div>

            <div>
              <label className="fui-r-size-2 fui-r-weight-medium block mb-2" style={{ color: 'var(--gray-11)' }}>
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-a2)' }}>
                <p className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
                  {user?.email}
                </p>
              </div>
              <p className="fui-r-size-1 mt-1" style={{ color: 'var(--gray-10)' }}>
                Cannot be changed
              </p>
            </div>
          </div>

          <hr className="my-6" style={{ borderColor: 'var(--stroke)' }} />

          {/* Editable fields */}
          <h3 className="fui-r-size-3 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
            Edit Profile
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="fui-r-size-2 fui-r-weight-medium block mb-2" style={{ color: 'var(--gray-11)' }}>
                  First Name
                </label>
                <Input
                  {...register("firstName")}
                  placeholder="First name"
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="fui-r-size-2 fui-r-weight-medium block mb-2" style={{ color: 'var(--gray-11)' }}>
                  Last Name
                </label>
                <Input
                  {...register("lastName")}
                  placeholder="Last name"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="fui-r-size-2 fui-r-weight-medium block mb-2" style={{ color: 'var(--gray-11)' }}>
                <FileText className="w-4 h-4 inline mr-2" />
                Bio
              </label>
              <Textarea
                {...register("bio")}
                placeholder="Tell us about yourself..."
                className="rounded-lg min-h-24"
              />
              <p className="fui-r-size-1 mt-1" style={{ color: 'var(--gray-10)' }}>
                Max 500 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={updateMutation.isPending}
              style={{ backgroundColor: 'var(--accent-9)', color: 'white' }}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card className="elevated-card border" style={{ borderColor: 'var(--danger-9) ' }}>
          <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--danger-9)' }}>
            Danger Zone
          </h2>

          <div className="space-y-3">
            <div>
              <p className="fui-r-size-2 mb-3" style={{ color: 'var(--gray-11)' }}>
                Log out of your account. You'll need to log back in on your next visit.
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
                style={{ backgroundColor: 'var(--danger-9)', color: 'white' }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
