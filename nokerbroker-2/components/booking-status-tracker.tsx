// components/booking-status-tracker.tsx
"use client";

import React from "react";
import { CheckCircle2, Clock, Calendar, FileText, AlertCircle } from "lucide-react";

export type BookingStepStatus =
  | "ENQUIRED"
  | "SITE_VISIT_SCHEDULED"
  | "TOKEN_PAID"
  | "BOOKED"
  | "AGREEMENT_SIGNED"
  | "CANCELLED";

interface BookingStatusTrackerProps {
  status: BookingStepStatus;
  tokenAmount?: number;
  paymentRef?: string;
  projectName?: string;
  unitType?: string;
}

const STEPS: { key: BookingStepStatus; label: string; icon: React.ElementType }[] = [
  { key: "ENQUIRED", label: "Enquiry Received", icon: Clock },
  { key: "SITE_VISIT_SCHEDULED", label: "Site Visit Scheduled", icon: Calendar },
  { key: "TOKEN_PAID", label: "Token Paid", icon: CheckCircle2 },
  { key: "BOOKED", label: "Unit Booked", icon: CheckCircle2 },
  { key: "AGREEMENT_SIGNED", label: "Agreement Signed", icon: FileText },
];

export function BookingStatusTracker({
  status,
  tokenAmount,
  paymentRef,
  projectName = "Project Unit",
  unitType = "Standard",
}: BookingStatusTrackerProps) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h3 className="font-semibold text-lg">Booking Cancelled</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">
          This booking for {projectName} ({unitType}) has been cancelled.
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <h3 className="font-bold text-lg text-ink">{projectName}</h3>
          <p className="text-sm text-ink-soft">Unit: {unitType}</p>
        </div>
        {tokenAmount && (
          <div className="text-right">
            <span className="text-xs text-ink-soft uppercase tracking-wider block">Token Amount</span>
            <span className="font-bold text-lg text-orange">₹{tokenAmount.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      {/* Steps Progress */}
      <div className="relative flex flex-col md:flex-row justify-between gap-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex md:flex-col items-center gap-3 flex-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "border-orange bg-orange text-white"
                    : "border-border bg-white text-ink-faint"
                } ${isCurrent ? "ring-4 ring-orange-pale" : ""}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="md:text-center">
                <p className={`text-xs font-semibold ${isCompleted ? "text-ink" : "text-ink-soft"}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="text-[10px] text-orange font-medium inline-block bg-orange-pale px-2 py-0.5 rounded-full mt-1">
                    Current Stage
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {paymentRef && (
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-ink-soft">
          <span>Payment Reference:</span>
          <span className="font-mono text-ink font-medium">{paymentRef}</span>
        </div>
      )}
    </div>
  );
}
