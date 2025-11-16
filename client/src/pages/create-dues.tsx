import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const duesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(["monthly", "semester", "yearly"]).optional(),
});

type DuesForm = z.infer<typeof duesSchema>;

export default function CreateDues() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/club/:id/create-dues");
  const clubId = params?.id;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DuesForm>({
    resolver: zodResolver(duesSchema),
  });

  const onSubmit = async (data: DuesForm) => {
    if (!clubId) return;

    setIsLoading(true);
    try {
      await apiRequest("POST", `/api/clubs/${clubId}/dues`, {
        name: data.name,
        amount: parseFloat(data.amount),
        description: data.description || "",
        dueDate: new Date(data.dueDate).toISOString(),
        isRecurring: isRecurring,
        frequency: isRecurring ? data.frequency : null,
        isActive: true,
      });

      toast({
        title: "Success!",
        description: "Dues created successfully",
      });

      setLocation(`/club/${clubId}/manage-dues`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create dues",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
          Create Dues
        </h1>
        <p style={{ color: "var(--gray-11)" }} className="mt-2">
          Set up membership dues for your club
        </p>
      </div>

      <Card className="p-6" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" style={{ color: "var(--gray-12)" }}>
              Dues Name
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Semester Dues"
              className="mt-1.5"
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" style={{ color: "var(--gray-12)" }}>
              <DollarSign className="h-4 w-4 inline mr-2" />
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount")}
              placeholder="50.00"
              className="mt-1.5"
            />
            {errors.amount && (
              <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" style={{ color: "var(--gray-12)" }}>
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="What these dues cover..."
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="dueDate" style={{ color: "var(--gray-12)" }}>
              <Calendar className="h-4 w-4 inline mr-2" />
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate")}
              className="mt-1.5"
            />
            {errors.dueDate && (
              <p className="text-destructive text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
            />
            <Label htmlFor="isRecurring" style={{ color: "var(--gray-12)" }}>
              Recurring Dues
            </Label>
          </div>

          {isRecurring && (
            <div>
              <Label htmlFor="frequency" style={{ color: "var(--gray-12)" }}>
                Frequency
              </Label>
              <select
                id="frequency"
                {...register("frequency")}
                className="w-full mt-1.5 p-2 border rounded"
              >
                <option value="monthly">Monthly</option>
                <option value="semester">Per Semester</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/club/${clubId}/manage-dues`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating..." : "Create Dues"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
