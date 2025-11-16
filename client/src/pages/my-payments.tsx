import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DuesPayment } from "@shared/schema";
import { CreditCard, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function MyPayments() {
  const { data: duesPayments = [], isLoading } = useQuery<DuesPayment[]>({
    queryKey: ["/api/user/dues-payments"],
  });

  const completedPayments = duesPayments.filter((p) => p.paymentStatus === "completed");
  const pendingPayments = duesPayments.filter((p) => p.paymentStatus === "pending");
  const failedPayments = duesPayments.filter((p) => p.paymentStatus === "failed");

  const getStatusColor = (status: string | null) => {
    if (!status) return { backgroundColor: "var(--gray-3)", color: "var(--gray-11)" };
    switch (status) {
      case "completed":
        return { backgroundColor: "var(--success-3)", color: "var(--success-11)" };
      case "pending":
        return { backgroundColor: "var(--warning-a3)", color: "var(--warning-a11)" };
      case "failed":
        return { backgroundColor: "var(--danger-3)", color: "var(--danger-11)" };
      default:
        return { backgroundColor: "var(--gray-3)", color: "var(--gray-11)" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg" style={{ color: "var(--gray-11)" }}>
          Loading payments...
        </div>
      </div>
    );
  }

  const totalPaid = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--gray-12)" }}>
          My Payments & Dues
        </h1>
        <p style={{ color: "var(--gray-11)" }} className="mt-2">
          Track your club dues and event payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className="p-4 border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5" style={{ color: "var(--success-9)" }} />
            <span style={{ color: "var(--gray-11)" }}>Total Paid</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--gray-12)" }}>
            ${(totalPaid / 100).toFixed(2)}
          </p>
        </Card>

        <Card
          className="p-4 border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" style={{ color: "var(--warning-a11)" }} />
            <span style={{ color: "var(--gray-11)" }}>Pending</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--gray-12)" }}>
            ${(totalPending / 100).toFixed(2)}
          </p>
        </Card>

        <Card
          className="p-4 border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5" style={{ color: "var(--accent-9)" }} />
            <span style={{ color: "var(--gray-11)" }}>Total Transactions</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--gray-12)" }}>
            {duesPayments.length}
          </p>
        </Card>
      </div>

      {/* Tabs for payment statuses */}
      {duesPayments.length === 0 ? (
        <Card
          className="p-12 text-center border border-[var(--stroke)]"
          style={{ backgroundColor: "var(--panel-solid)" }}
        >
          <p style={{ color: "var(--gray-11)" }}>
            No payments yet. Join clubs and pay their dues!
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedPayments.length})
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed ({failedPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pendingPayments.length === 0 ? (
              <p style={{ color: "var(--gray-11)" }}>No pending payments</p>
            ) : (
              pendingPayments.map((payment) => {
                return (
                  <Card
                    key={payment.id}
                    className="p-4 border border-[var(--stroke)]"
                    style={{ backgroundColor: "var(--panel-solid)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: "var(--gray-12)" }}>
                          Dues Payment
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" style={{ color: "var(--gray-10)" }} />
                          <span style={{ color: "var(--gray-10)" }} className="text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-lg font-bold" style={{ color: "var(--gray-12)" }}>
                            ${((payment.amount || 0) / 100).toFixed(2)}
                          </p>
                          <Badge style={getStatusColor(payment.paymentStatus)}>
                            {payment.paymentStatus}
                          </Badge>
                        </div>
                        <Link href={`/dues/${payment.clubDuesId}/pay`}>
                          <Button size="sm">Pay Now</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedPayments.length === 0 ? (
              <p style={{ color: "var(--gray-11)" }}>No completed payments</p>
            ) : (
              completedPayments.map((payment) => {
                return (
                  <Card
                    key={payment.id}
                    className="p-4 border border-[var(--stroke)]"
                    style={{ backgroundColor: "var(--panel-solid)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold" style={{ color: "var(--gray-12)" }}>
                          Dues Payment
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" style={{ color: "var(--gray-10)" }} />
                          <span style={{ color: "var(--gray-10)" }} className="text-sm">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: "var(--gray-12)" }}>
                          ${((payment.amount || 0) / 100).toFixed(2)}
                        </p>
                        <Badge style={getStatusColor(payment.paymentStatus)}>
                          {payment.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-3">
            {failedPayments.length === 0 ? (
              <p style={{ color: "var(--gray-11)" }}>No failed payments</p>
            ) : (
              failedPayments.map((payment) => {
                return (
                  <Card
                    key={payment.id}
                    className="p-4 border border-[var(--stroke)]"
                    style={{ backgroundColor: "var(--panel-solid)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold" style={{ color: "var(--gray-12)" }}>
                          Dues Payment
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" style={{ color: "var(--gray-10)" }} />
                          <span style={{ color: "var(--gray-10)" }} className="text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: "var(--gray-12)" }}>
                          ${((payment.amount || 0) / 100).toFixed(2)}
                        </p>
                        <Badge style={getStatusColor(payment.paymentStatus)}>
                          {payment.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
