import { createContext, useContext, useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

interface StripeConfig {
  publishableKey: string;
  stripeEnabled: boolean;
}

const StripeContext = createContext<Stripe | null>(null);

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    // Fetch Stripe config from backend
    fetch("/api/stripe-config")
      .then((res) => res.json())
      .then((config: StripeConfig) => {
        if (config.stripeEnabled && config.publishableKey) {
          setStripePromise(loadStripe(config.publishableKey));
        }
      })
      .catch((error) => {
        console.error("Failed to load Stripe config:", error);
      });
  }, []);

  return (
    <StripeContext.Provider value={null}>
      {children}
    </StripeContext.Provider>
  );
}

export function useStripe() {
  return useContext(StripeContext);
}
