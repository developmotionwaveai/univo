import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please sign in.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--gray-2)' }}>
      <Card className="w-full max-w-md p-8 elevated-card">
        <div className="mb-8 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">U</span>
          </div>
          <h1 className="fui-r-size-5 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
            Create Account
          </h1>
          <p className="fui-r-size-2 mt-2" style={{ color: 'var(--gray-11)' }}>
            Register to start managing your campus club
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username" className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
              Username
            </Label>
            <Input
              id="username"
              type="text"
              {...register("username")}
              placeholder="Choose a username"
              data-testid="input-username"
              className="mt-1.5"
            />
            {errors.username && (
              <p className="text-destructive fui-r-size-1 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              data-testid="input-email"
              className="mt-1.5"
            />
            {errors.email && (
              <p className="text-destructive fui-r-size-1 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Create a password"
              data-testid="input-password"
              className="mt-1.5"
            />
            {errors.password && (
              <p className="text-destructive fui-r-size-1 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="fui-r-size-2" style={{ color: 'var(--gray-12)' }}>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm your password"
              data-testid="input-confirm-password"
              className="mt-1.5"
            />
            {errors.confirmPassword && (
              <p className="text-destructive fui-r-size-1 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading}
            data-testid="button-register"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:underline"
              data-testid="link-login"
            >
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
