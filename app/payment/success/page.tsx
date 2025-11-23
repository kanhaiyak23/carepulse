"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get("order_id");
  const userId = searchParams.get("userId");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // Verify payment status with server-side API
        const response = await fetch(`/api/payment/verify?order_id=${orderId}`);
        const data = await response.json();

        if (response.ok && data.isPaid) {
          // Mark user as premium
          setIsPremium(true);

          // Store premium status in localStorage (or update in your database)
          if (typeof window !== "undefined") {
            localStorage.setItem("isPremium", "true");
            localStorage.setItem("premiumOrderId", orderId);
            if (userId) {
              localStorage.setItem("premiumUserId", userId);
            }
          }
          
          // Redirect to appointment page after 2 seconds if userId is available
          if (userId) {
            setTimeout(() => {
              router.push(`/patients/${userId}/new-appointment`);
            }, 2000);
          }
        } else {
          setIsPremium(false);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Image
            src="/assets/icons/loader.svg"
            alt="loader"
            width={48}
            height={48}
            className="animate-spin mx-auto mb-4"
          />
          <p className="text-lg">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {isPremium ? (
          <>
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Payment Successful!
              </h1>
              <p className="text-gray-600">
                Your subscription has been activated.
              </p>
              {userId && (
                <p className="mt-2 text-sm text-blue-600">
                  Redirecting to appointments page...
                </p>
              )}
            </div>

            <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">
                  Subscription Status
                </span>
                <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                  PREMIUM
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order ID:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className="text-sm font-medium text-gray-900">
                    Premium Subscription
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Premium Features Unlocked:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Unlimited appointments
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Exclusive features
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              {userId ? (
                <Button
                  onClick={() => router.push(`/patients/${userId}/new-appointment`)}
                  className="flex-1 shad-primary-btn"
                >
                  Go to Appointments
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/")}
                  className="flex-1 shad-primary-btn"
                >
                  Go to Dashboard
                </Button>
              )}
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1"
              >
                Home
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Payment Failed
            </h1>
            <p className="mb-6 text-gray-600">
              We couldn't verify your payment. Please try again.
            </p>
            <Button onClick={() => router.push("/")} className="shad-primary-btn">
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

