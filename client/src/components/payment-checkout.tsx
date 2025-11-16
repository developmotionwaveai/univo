import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PaymentCheckoutProps {
  amount: number;
  description: string;
  metadata?: Record<string, string>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function CheckoutForm({
  amount,
  description,
  metadata,
  onSuccess,
  onCancel,
}: PaymentCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment successful!",
          description: "Your payment has been processed.",
        });
        onSuccess?.();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <p className="text-sm" style={{ color: "var(--gray-11)" }}>
          {description}
        </p>
        <p className="text-2xl font-bold mt-2" style={{ color: "var(--gray-12)" }}>
          ${(amount / 100).toFixed(2)}
        </p>
      </div>

      <PaymentElement />

      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export function PaymentCheckout({
  amount,
  description,
  metadata,
  onSuccess,
  onCancel,
}: PaymentCheckoutProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load Stripe publishable key
    fetch("/api/stripe-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.stripeEnabled && config.publishableKey) {
          setStripePromise(loadStripe(config.publishableKey));
        } else {
          toast({
            title: "Payment not available",
            description: "Stripe is not configured",
            variant: "destructive",
          });
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load Stripe config:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!stripePromise) return;

    // Create payment intent
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        amount,
        description,
        metadata,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to initialize payment",
            variant: "destructive",
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to create payment intent:", error);
        toast({
          title: "Error",
          description: "Failed to initialize payment",
          variant: "destructive",
        });
        setLoading(false);
      });
  }, [stripePromise, amount, description, metadata]);

  if (loading) {
    return (
      <Card className="p-6" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent-9)" }} />
        </div>
      </Card>
    );
  }

  if (!stripePromise || !clientSecret) {
    return (
      <Card className="p-6" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
        <p style={{ color: "var(--gray-11)" }}>
          Payment processing is not available at this time.
        </p>
        {onCancel && (
          <Button onClick={onCancel} className="mt-4">
            Go Back
          </Button>
        )}
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
    },
  };

  return (
    <Card className="p-6" style={{ backgroundColor: "var(--panel-solid)", borderColor: "var(--stroke)" }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--gray-12)" }}>
        Payment Checkout
      </h2>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          amount={amount}
          description={description}
          metadata={metadata}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </Card>
  );
}
