import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { DollarSign, Receipt, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  type: "dues" | "event" | "donation";
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  description: string;
  club?: {
    name: string;
  };
}

export default function PaymentHistory() {
  const { user } = useAuth();

  const { data: duesPayments = [] } = useQuery<any[]>({
    queryKey: ["/api/user/dues-payments"],
    enabled: !!user,
  });

  const { data: eventPayments = [] } = useQuery<any[]>({
    queryKey: ["/api/user/event-payments"],
    queryFn: async () => {
      // Would need backend endpoint
      return [];
    },
    enabled: !!user,
  });

  const { data: donations = [] } = useQuery<any[]>({
    queryKey: ["/api/user/donations"],
    queryFn: async () => {
      // Would need backend endpoint
      return [];
    },
    enabled: !!user,
  });

  const allPayments: Payment[] = [
    ...duesPayments.map(p => ({
      id: p.id,
      type: "dues" as const,
      amount: p.amount,
      status: p.paymentStatus,
      createdAt: p.createdAt,
      description: `Dues Payment`,
    })),
    ...eventPayments.map(p => ({
      id: p.id,
      type: "event" as const,
      amount: p.totalAmount,
      status: p.paymentStatus,
      createdAt: p.createdAt,
      description: `Event Ticket`,
    })),
    ...donations.map(p => ({
      id: p.id,
      type: "donation" as const,
      amount: p.amount,
      status: p.paymentStatus,
      createdAt: p.createdAt,
      description: `Donation`,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "dues":
        return <DollarSign className="h-5 w-5" />;
      case "event":
        return <Calendar className="h-5 w-5" />;
      case "donation":
        return <Receipt className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
            Payment History
          </h1>
          <p style={{ color: "var(--gray-11)" }} className="mt-2">
            View all your payments and transactions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
            <p className="text-sm" style={{ color: "var(--gray-11)" }}>Total Paid</p>
            <p className="text-2xl font-bold" style={{ color: "var(--gray-12)" }}>
              ${allPayments
                .filter(p => p.status === "completed")
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </p>
          </Card>

          <Card className="p-4" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
            <p className="text-sm" style={{ color: "var(--gray-11)" }}>Pending</p>
            <p className="text-2xl font-bold" style={{ color: "var(--warning-9)" }}>
              ${allPayments
                .filter(p => p.status === "pending")
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </p>
          </Card>

          <Card className="p-4" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
            <p className="text-sm" style={{ color: "var(--gray-11)" }}>Transactions</p>
            <p className="text-2xl font-bold" style={{ color: "var(--gray-12)" }}>
              {allPayments.length}
            </p>
          </Card>
        </div>

        {/* Payment List */}
        <div className="space-y-3">
          {allPayments.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--gray-3)" }}>
                <Receipt className="h-8 w-8" style={{ color: "var(--gray-8)" }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--gray-12)" }}>
                No Payments Yet
              </h3>
              <p style={{ color: "var(--gray-10)" }}>
                Your payment history will appear here
              </p>
            </Card>
          ) : (
            allPayments.map(payment => (
              <Card
                key={payment.id}
                className="p-4"
                style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "var(--accent-3)" }}
                    >
                      {getTypeIcon(payment.type)}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--gray-12)" }}>
                        {payment.description}
                      </p>
                      <p className="text-sm" style={{ color: "var(--gray-11)" }}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold" style={{ color: "var(--gray-12)" }}>
                        ${payment.amount.toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    {payment.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
