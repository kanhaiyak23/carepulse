"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SubscriptionButtonProps {
  amount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userId?: string;
}

const SubscriptionButton = ({
  amount = 20, // Default subscription amount in INR
  customerName,
  customerEmail,
  customerPhone,
  userId,
}: SubscriptionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load Cashfree SDK
    if (typeof window !== "undefined") {
      if ((window as any).Cashfree) {
        setCashfreeLoaded(true);
      } else {
        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
        if (!existingScript) {
          const script = document.createElement("script");
          script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
          script.async = true;
          script.onload = () => {
            setCashfreeLoaded(true);
          };
          script.onerror = () => {
            console.error("Failed to load Cashfree SDK");
          };
          document.body.appendChild(script);
        } else {
          // Script is loading, wait for it
          existingScript.addEventListener('load', () => {
            setCashfreeLoaded(true);
          });
        }
      }
    }
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Create payment order
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          customerName: customerName || "Customer",
          customerEmail: customerEmail || "customer@example.com",
          customerPhone: customerPhone || "9999999999",
          userId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMessage = data.message || data.error || "Failed to create payment order";
        console.error("Payment order creation failed:", {
          status: response.status,
          error: data,
        });
        throw new Error(errorMessage);
      }

      // Wait for Cashfree SDK to load if not already loaded
      if (!cashfreeLoaded) {
        await new Promise((resolve) => {
          const checkCashfree = setInterval(() => {
            if ((window as any).Cashfree) {
              clearInterval(checkCashfree);
              setCashfreeLoaded(true);
              resolve(true);
            }
          }, 100);
        });
      }

      // Initialize Cashfree Checkout
      // Use production mode if NEXT_PUBLIC_CASHFREE_ENV is set to 'production'
      // Otherwise default to sandbox for testing
      const cashfreeMode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' 
        ? 'production' 
        : 'sandbox';
      
      const cashfree = (window as any).Cashfree({
        mode: cashfreeMode,
      });

      // Open Cashfree checkout
      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      alert(error.message || "Failed to initiate payment. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="shad-primary-btn w-full"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center gap-4">
          <Image
            src="/assets/icons/loader.svg"
            alt="loader"
            width={24}
            height={24}
            className="animate-spin"
          />
          Processing...
        </div>
      ) : (
        `Subscribe Premium - ₹${amount}`
      )}
    </Button>
  );
};

export default SubscriptionButton;

