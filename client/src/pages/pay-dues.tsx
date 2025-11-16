import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { PaymentCheckout } from "@/components/payment-checkout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface ClubDues {
  id: string;
  clubId: string;
  amount: number;
  dueDate: string;
  description: string;
  club?: {
    id: string;
    name: string;
  };
}

export default function PayDues() {
  const [, params] = useRoute("/dues/:id/pay");
  const duesId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dues, isLoading } = useQuery<ClubDues>({
    queryKey: [`/api/club-dues/${duesId}`],
    enabled: !!duesId,
  });

  const handlePaymentSuccess = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/user/dues-payments"] });
    queryClient.invalidateQueries({ queryKey: [`/api/club-dues/${duesId}`] });

    toast({
      title: "Payment successful!",
      description: "Your dues have been paid.",
    });

    // Redirect to payments page
    setTimeout(() => {
      setLocation("/my-payments");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg" style={{ color: "var(--gray-11)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!dues) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <p style={{ color: "var(--gray-11)" }}>Dues not found</p>
          <Button onClick={() => setLocation("/my-payments")} className="mt-4">
            Go to Payments
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => setLocation("/my-payments")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Payments
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
          Pay Club Dues
        </h1>
        <p style={{ color: "var(--gray-11)" }} className="mt-2">
          {dues.club?.name || "Club"}
        </p>
      </div>

      <PaymentCheckout
        amount={dues.amount}
        description={dues.description || `Dues for ${dues.club?.name || "Club"}`}
        metadata={{
          duesId: dues.id,
          clubId: dues.clubId,
          type: "dues",
        }}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setLocation("/my-payments")}
      />
    </div>
  );
}
