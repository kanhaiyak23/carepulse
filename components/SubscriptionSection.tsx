"use client";

import { useState, useEffect } from "react";
import SubscriptionButton from "./SubscriptionButton";

interface SubscriptionSectionProps {
  userId: string;
  patientEmail?: string;
  patientName?: string;
}

const SubscriptionSection = ({
  userId,
  patientEmail,
  patientName,
}: SubscriptionSectionProps) => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check subscription status from localStorage
    if (typeof window !== "undefined") {
      const premiumStatus = localStorage.getItem("isPremium");
      const premiumOrderId = localStorage.getItem("premiumOrderId");
      
      // Also check if there's a userId match in localStorage
      const storedUserId = localStorage.getItem("premiumUserId");
      
      if (premiumStatus === "true" && (storedUserId === userId || !storedUserId)) {
        setIsPremium(true);
      } else {
        setIsPremium(false);
      }
    }
  }, [userId]);

  // Don't show anything if email is not available
  if (!patientEmail) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
      {isPremium ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Premium Subscribed
              </h3>
              <p className="text-sm text-gray-600">
                You have an active premium subscription
              </p>
            </div>
          </div>
          <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white">
            PREMIUM
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upgrade to Premium
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get unlimited appointments, priority support, and exclusive features
            </p>
          </div>
          <SubscriptionButton
            amount={20}
            customerName={patientName || "Customer"}
            customerEmail={patientEmail}
            userId={userId}
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionSection;

